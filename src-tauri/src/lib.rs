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
struct RequestPayload {
    url: String,
    method: String,
    body: Option<Value>,
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

    let method = payload.method.to_uppercase();
    let request_builder = match method.as_str() {
        "GET" => {
            let mut url = parsed_url;

            // Добавляем query параметры к URL для GET
            if let Some(params) = &payload.body {
                let query_string = serde_qs::to_string(&params).map_err(|e| e.to_string())?;
                url.set_query(Some(&query_string));
            }

            client.get(url.to_string())
        }
        "POST" => {
            let mut builder = client.post(&payload.url);
            if let Some(body) = payload.body {
                builder = builder.json(&body);
            }
            builder
        }
        _ => return Err("Method not supported".into()),
    };

    let response = request_builder.send().await.map_err(|e| e.to_string())?;
    let json_res: Value = response.json().await.map_err(|e| e.to_string())?;
    Ok(json_res)
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
) -> Result<(), String> {
    // 1. Остановка предыдущего потока
    let mut lock = state.0.lock().map_err(|_| "Failed to lock state")?;
    if let Some(handle) = lock.take() {
        handle.abort();
    }

    // 2. Запуск асинхронной задачи
    let handle = tauri::async_runtime::spawn(async move {
        let client = reqwest::Client::new();
        let response = client
            .get(&url)
            .header("Accept", "text/event-stream")
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
            start_sse_stream,
            stop_sse_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
