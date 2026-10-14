use futures_util::StreamExt;
use mdns_sd::{ServiceDaemon, ServiceEvent};
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

struct SseState(Mutex<Option<tauri::async_runtime::JoinHandle<()>>>);

// Middleware: проверяет, является ли хост локальным IP (192.168.x.x, 10.x.x.x и т.д.)
fn is_private_ip(host: &str) -> bool {
    if let Ok(ip) = host.parse::<IpAddr>() {
        match ip {
            IpAddr::V4(v4) => v4.is_private() || v4.is_loopback(),
            IpAddr::V6(v6) => (v6.segments()[0] & 0xfe00) == 0xfc00 || v6.is_loopback(),
        }
    } else {
        // Если это не IP (например, .local имя), разрешаем,
        // так как mDNS имена резолвятся только внутри сети
        host.ends_with(".local") || host == "localhost"
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RequestPayload {
    url: String,
    method: String,
    body: Option<Value>,
    headers: Option<HashMap<String, String>>,
    hmac_key: Option<String>,
    hmac_id: Option<String>,
}

// Проброс произвольных заголовков в исходящий запрос.
// Невалидные имена/значения молча пропускаются.
fn apply_headers(
    mut rb: reqwest::RequestBuilder,
    headers: &HashMap<String, String>,
) -> reqwest::RequestBuilder {
    for (k, v) in headers {
        if let (Ok(name), Ok(value)) = (
            reqwest::header::HeaderName::from_bytes(k.as_bytes()),
            reqwest::header::HeaderValue::from_str(v),
        ) {
            rb = rb.header(name, value);
        }
    }
    rb
}

// Строит заголовки admin-HMAC (X-UMNI-*) для прошивки.
// key — webserver-токен (PSK), id — идентификатор (обычно "admin").
// include_body_hash — для потоковых запросов (OTA): хэш тела в отдельном заголовке.
fn build_hmac_headers(
    method: &str,
    url: &url::Url,
    body: &[u8],
    key: &str,
    id: &str,
    include_body_hash: bool,
) -> Result<HashMap<String, String>, String> {
    use hmac::{Hmac, Mac};
    use sha2::{Digest, Sha256};
    type HmacSha256 = Hmac<Sha256>;

    let ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis()
        .to_string();

    let mut nonce_bytes = [0u8; 16];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut nonce_bytes);
    let nonce = hex::encode(nonce_bytes);

    let body_hash = hex::encode(Sha256::digest(body));

    let uri = match url.query() {
        Some(q) => format!("{}?{}", url.path(), q),
        None => url.path().to_string(),
    };

    let canonical = format!("UMNI1\n{}\n{}\n{}\n{}\n{}", method, uri, ts, nonce, body_hash);

    let mut mac = HmacSha256::new_from_slice(key.as_bytes()).map_err(|e| e.to_string())?;
    mac.update(canonical.as_bytes());
    let sig = hex::encode(mac.finalize().into_bytes());

    let mut h = HashMap::new();
    h.insert("X-UMNI-Device".to_string(), id.to_string());
    h.insert("X-UMNI-Timestamp".to_string(), ts);
    h.insert("X-UMNI-Nonce".to_string(), nonce);
    h.insert("X-UMNI-Signature".to_string(), sig);
    if include_body_hash {
        h.insert("X-UMNI-Body-SHA256".to_string(), body_hash);
    }
    Ok(h)
}

#[tauri::command]
async fn secure_request(payload: RequestPayload) -> Result<Value, String> {
    let parsed_url = url::Url::parse(&payload.url).map_err(|_| "Invalid URL")?;
    let host = parsed_url.host_str().ok_or("No host in URL")?;

    if !is_private_ip(host) {
        return Err(format!("Access Denied: {} is not a local address", host));
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let mut headers = payload.headers.unwrap_or_default();
    let method = payload.method.to_uppercase();

    // URL для GET/DELETE (query из body) и точные байты тела для POST/PUT.
    let (final_url, body_bytes) = match method.as_str() {
        "GET" | "DELETE" => {
            let mut url = parsed_url;
            if let Some(params) = &payload.body {
                let query_string = serde_qs::to_string(&params).map_err(|e| e.to_string())?;
                url.set_query(Some(&query_string));
            }
            (url, None)
        }
        "POST" | "PUT" => {
            let bytes = match &payload.body {
                Some(body) => Some(serde_json::to_vec(body).map_err(|e| e.to_string())?),
                None => None,
            };
            (parsed_url, bytes)
        }
        _ => return Err("Method not supported".into()),
    };

    // Admin-HMAC вместо/вместе с Bearer
    if let Some(key) = payload.hmac_key.as_deref() {
        let id = payload.hmac_id.as_deref().unwrap_or("admin");
        let sig = build_hmac_headers(
            &method,
            &final_url,
            body_bytes.as_deref().unwrap_or(b""),
            key,
            id,
            false,
        )?;
        headers.extend(sig);
    }

    let request_builder = match method.as_str() {
        "GET" => client.get(final_url.to_string()),
        "DELETE" => client.delete(final_url.to_string()),
        "POST" => {
            let mut builder = client.post(final_url.to_string());
            if let Some(bytes) = &body_bytes {
                builder = builder
                    .header(reqwest::header::CONTENT_TYPE, "application/json")
                    .body(bytes.clone());
            }
            builder
        }
        "PUT" => {
            let mut builder = client.put(final_url.to_string());
            if let Some(bytes) = &body_bytes {
                builder = builder
                    .header(reqwest::header::CONTENT_TYPE, "application/json")
                    .body(bytes.clone());
            }
            builder
        }
        _ => return Err("Method not supported".into()),
    };

    let request_builder = apply_headers(request_builder, &headers);

    let response = request_builder.send().await.map_err(|e| e.to_string())?;
    let json_res: Value = response.json().await.map_err(|e| e.to_string())?;
    Ok(json_res)
}

#[tauri::command]
async fn upload_firmware(
    url: String,
    file_bytes: Vec<u8>,
    headers: Option<HashMap<String, String>>,
    hmac_key: Option<String>,
    hmac_id: Option<String>,
) -> Result<String, String> {
    // 1. Проверяем URL на валидность и локальный IP (как в вашем secure_request)
    let parsed_url = url::Url::parse(&url).map_err(|_| "Invalid URL")?;
    let host = parsed_url.host_str().ok_or("No host in URL")?;

    if !is_private_ip(host) {
        return Err(format!("Access Denied: {} is not a local address", host));
    }

    // 2. Создаем клиент (увеличим таймаут, так как прошивка может весить много и слаться дольше 5 секунд)
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    // 3. Заголовки: явные + admin-HMAC с привязкой хэша тела (OTA)
    let mut hdrs = headers.unwrap_or_default();
    if let Some(key) = hmac_key.as_deref() {
        let id = hmac_id.as_deref().unwrap_or("admin");
        let sig = build_hmac_headers("POST", &parsed_url, &file_bytes, key, id, true)?;
        hdrs.extend(sig);
    }

    // 4. Отправляем бинарные данные напрямую через .body() (аналог --data-binary)
    let request = client.post(&url)
        .header(reqwest::header::CONTENT_TYPE, "application/octet-stream")
        .body(file_bytes); // Передаем вектор байт напрямую

    let response = apply_headers(request, &hdrs)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // 5. Получаем ответ как текст (устройства на прошивку часто отвечают "OK" или отправляют пустой ответ, а не JSON)
    let res_text = response.text().await.map_err(|e| e.to_string())?;

    Ok(res_text)
}

#[tauri::command]
fn start_mdns_discovery(app: tauri::AppHandle) {
    let mdns = ServiceDaemon::new().unwrap();
    let receiver = mdns.browse("_umni_api._tcp.local.").unwrap();

    std::thread::spawn(move || {
        while let Ok(event) = receiver.recv() {
            if let ServiceEvent::ServiceResolved(info) = event {
                let hostname = info.get_hostname().to_string();
                let ips: Vec<String> = info
                    .get_addresses()
                    .iter()
                    .map(|ip| ip.to_string())
                    .collect();

                let mut txt_data = HashMap::new();
                for item in info.get_properties().iter() {
                    txt_data.insert(item.key().to_string(), item.val_str().to_string());
                }

                app.emit(
                    "device-found",
                    (info.get_fullname().to_string(), hostname, ips, txt_data),
                )
                .unwrap();
            }
        }
    });
}

#[tauri::command]
async fn start_sse_stream(
    app: AppHandle,
    state: State<'_, SseState>,
    url: String,
    headers: Option<HashMap<String, String>>,
    hmac_key: Option<String>,
    hmac_id: Option<String>,
) -> Result<(), String> {
    // 1. Остановка предыдущего потока
    let mut lock = state.0.lock().map_err(|_| "Failed to lock state")?;
    if let Some(handle) = lock.take() {
        handle.abort();
    }

    // Набор заголовков: явные + admin-HMAC (GET, пустое тело)
    let mut hdrs = headers.unwrap_or_default();
    if let Some(key) = hmac_key.as_deref() {
        let parsed = url::Url::parse(&url).map_err(|_| "Invalid URL")?;
        let id = hmac_id.as_deref().unwrap_or("admin");
        let sig = build_hmac_headers("GET", &parsed, b"", key, id, false)?;
        hdrs.extend(sig);
    }

    // 2. Запуск асинхронной задачи
    let handle = tauri::async_runtime::spawn(async move {
        let client = reqwest::Client::new();
        let request = client
            .get(&url)
            .header("Accept", "text/event-stream");
        let response = apply_headers(request, &hdrs)
            .send()
            .await;

        match response {
            Ok(res) if res.status().is_success() => {
                // Сообщаем фронту об успешном коннекте
                let _ = app.emit("sse-status", "connected");

                let mut stream = res.bytes_stream();
                let mut current_event = String::from("message");

                while let Some(item) = stream.next().await {
                    match item {
                        Ok(bytes) => {
                            let chunk = String::from_utf8_lossy(&bytes);

                            for line in chunk.lines() {
                                let line = line.trim();

                                // Игнорируем пустые строки и комментарии (: ping)
                                if line.is_empty() || line.starts_with(':') {
                                    continue;
                                }

                                if let Some(event_name) = line.strip_prefix("event: ") {
                                    current_event = event_name.to_string();
                                } else if let Some(data_content) = line.strip_prefix("data: ") {
                                    // Парсим JSON сразу в Rust
                                    let parsed_data: Value = serde_json::from_str(data_content)
                                        .unwrap_or(Value::String(data_content.to_string()));

                                    let payload = json!({
                                        "event": current_event,
                                        "data": parsed_data
                                    });

                                    // Отправляем чистый объект во Vue
                                    let _ = app.emit("sse-data", payload);

                                    // Сброс типа события к дефолтному
                                    current_event = String::from("message");
                                }
                            }
                        }
                        Err(_) => break, // Ошибка стрима (разрыв связи)
                    }
                }
                let _ = app.emit("sse-status", "disconnected");
            }
            Ok(res) => {
                let _ = app.emit("sse-status", format!("error: {}", res.status()));
            }
            Err(e) => {
                let _ = app.emit("sse-status", format!("error: {}", e));
            }
        }
    });

    // 3. Сохраняем handle для возможности остановки
    *lock = Some(handle);
    Ok(())
}

#[tauri::command]
async fn stop_sse_stream(state: State<'_, SseState>) -> Result<(), String> {
    let mut lock = state.0.lock().unwrap();
    if let Some(handle) = lock.take() {
        handle.abort();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(SseState(Mutex::new(None)))
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            start_mdns_discovery,
            secure_request,
            upload_firmware,
            start_sse_stream,
            stop_sse_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
