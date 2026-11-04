import dateToStringDateTime from "@/helpers/dateToStringDateTime.js"
import {invoke} from "@tauri-apps/api/core";
import {storage} from "@/store/devices/device_store.js";

// Базовые настройки (axios больше не нужен)
const API = '/api/'

// Извлекаем host (IP) из URL устройства
function hostOf(url) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

// Использовать admin-HMAC вместо Bearer (Bearer остаётся при USE_HMAC = false)
const USE_HMAC = true
const ADMIN_ID = 'admin'

// Подбираем токен устройства по его IP/хостнейму
async function tokenFor(url) {
  const host = hostOf(url)
  if (!host) return null
  try {
    const devices = await storage.loadSavedDevices()
    const device = devices.find(d => d.ip === host || d.hostname === host)
    return device?.token || null
  } catch (e) {
    console.error('tokenFor error:', e)
    return null
  }
}

// Поля авторизации для invoke: HMAC-ключ либо Bearer-заголовок
async function authFields(url) {
  const token = await tokenFor(url)
  if (!token) return {}
  if (USE_HMAC) return { hmacKey: token, hmacId: ADMIN_ID }
  return { headers: { Authorization: `Bearer ${token}` } }
}

/**
 *
 * @param method
 * @param url
 * @param body
 * @param commit
 * @param headers
 * @returns {Promise<unknown>}
 */
async function secureApiRequest(method, url, body = null, commit = null, headers = undefined) {
  if(commit){
    commit('setLoading', true)
    commit('deviceRequestErrorOff')
    commit('resetAppError')
  }
  try {
    // Авторизация: явно переданные заголовки или HMAC/Bearer по IP устройства из URL
    const auth = headers === undefined ? await authFields(url) : { headers }
    // Rust-команда сама вернет готовый объект, если ответ — JSON
    // Если произойдет сетевая ошибка или IP запрещен — выкинет exception
    const res = await invoke('secure_request', {
      payload: { url, method, body, ...auth }
    })
    if(res.error === 'Unauthorized') {
      const unAuthError  = new Error(res.error)
      unAuthError.status = 401
      unAuthError.message = res.error
      if(commit) {
        commit('setAuthenticated', false)
      }
      throw unAuthError
    }
    if(res.success){
      if(commit) {
        commit('setAuthenticated', true)
      }
    }
    return res
  } catch (error) {
    // 401 не оборачиваем: выше (LoginPage) важно отличить его от сетевой ошибки
    if(error?.status === 401) {
      throw error
    }
    const customError = new Error(error)
    customError.code = 500
    customError.message = error.message
    console.error(`Secure Request Error [${method}]:`, error)
    if(commit){
      commit('setAppError', customError)
      commit('deviceRequestErrorOn')
    }
    throw customError
  } finally {
    if(commit){
      commit('setLoading', false)
    }
  }
}

async function uploadFirmware(url, file, commit = null) {
  if (commit) {
    commit('setLoading', true)
  }

  try {
    // 1. Читаем файл в ArrayBuffer
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });

    // 2. Превращаем в массив байт для Rust Vec<u8>
    const byteArray = Array.from(new Uint8Array(arrayBuffer));

    // 3. Вызываем нашу новую чистую команду
    return await invoke('upload_firmware', {
      url: url,
      fileBytes: byteArray, // В JS пишем в camelCase, Tauri сам сопоставит с file_bytes в Rust
      ...(await authFields(url))
    });
  } finally {
    if (commit) {
      commit('setLoading', false)
    }
  }
}

export default {
  /** GET /api/systeminfo **/
  async getSystemInfo({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest('GET',`http://${state.activeDevice.ip}${API}systeminfo`, null, commit)

      if (data.success) {
        commit('setSystemInfo', data.data)
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getSystemInfo error:', error)
      throw error
    }
  },

  /**
   * Логин по токену устройства.
   * Сохраняет токен и проверяет его пробным запросом до переключения интерфейса,
   * чтобы экран с вводом токена не мигал при неверном значении.
   */
  async loginWithToken({ state, commit }, token) {
    const device = state.activeDevice || await storage.getActiveDevice()
    if (!device) {
      const err = new Error('No active device')
      err.status = 422
      throw err
    }

    const updated = { ...device, token: token.trim() }
    // токен нужен в хранилище: tokenFor() берёт его оттуда при каждом запросе
    await storage.updateDevice(updated.hostname, { token: updated.token })

    const res = await secureApiRequest('GET', `http://${updated.ip}${API}systeminfo`, null, null)
    if (!res?.success) {
      const err = new Error('Unauthorized')
      err.status = 401
      throw err
    }

    // сменился объект активного устройства -> App.vue поднимет SSE и загрузит данные
    commit('setActiveDevice', updated)
    return updated
  },

  async checkDevice({ commit, state }, ip) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest('GET',`http://${ip}${API}systeminfo`, null, commit)
      return data.data
    } catch (error) {
      commit('setLoading', false)
      throw error
    }
  },

  async flashDevice({ commit, state }, file) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await uploadFirmware(`http://${state.activeDevice.ip}${API}ota/update`, file, commit)
      return data.data
    } catch (error) {
      commit('setLoading', false)
      throw error
    }
  },

  /** GET /api/conf?section=adc **/
  async getAdcConf({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'GET',
        `http://${state.activeDevice.ip}${API}conf`,
        { section: 'adc' },
        commit
      )
      commit('setLoading', false)

      if (data?.success) {
        commit('setAdcConf', data.data)

        // Получаем значения каналов для графиков
        const datetime = dateToStringDateTime()
        const channels = data.data.channels || []
        const adc1 = channels.find(c => c.id === 0)?.value
        const adc2 = channels.find(c => c.id === 1)?.value
        commit('pushAdcData', { datetime, adc1, adc2 })
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getAdcConf error:', error)
      throw error
    }
  },

  /** GET /api/conf?section=ntc **/
  async getNtcConf({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'GET',
        `http://${state.activeDevice.ip}${API}conf`,
        { section: 'ntc' },
        commit
      )

      if (data?.success) {
        commit('setNtcConf', data.data)

        const channels = data.data.channels || []
        const ntc1 = channels.find(c => c.id === 0)?.value?.toFixed(2)
        const ntc2 = channels.find(c => c.id === 1)?.value?.toFixed(2)
        commit('pushNtcData', { ntc1, ntc2 })
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getNtcConf error:', error)
      throw error
    }
  },

  /** GET /api/conf?section=dio **/
  async getDioConf({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'GET',
        `http://${state.activeDevice.ip}${API}conf`,
        { section: 'dio' },
        commit
      )

      if (data?.success) {
        commit('setDioConf', data.data)
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getDioConf error:', error)
      throw error
    }
  },

  /** GET /api/conf?section=onewire **/
  async getOneWireConf({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'GET',
        `http://${state.activeDevice.ip}${API}conf`,
        { section: 'onewire' },
        commit
      )

      if (data?.success) {
        const datetime = dateToStringDateTime()
        const sensors = data.data.sensors || []

        commit('updateOneWireChart', { datetime, sensors })
        commit('setOneWireConf', data.data)
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getOneWireConf error:', error)
      throw error
    }
  },

  /** GET /api/conf?section=rf433 **/
  async getRf433Conf({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'GET',
        `http://${state.activeDevice.ip}${API}conf`,
        { section: 'rf433' },
        commit
      )

      if (data?.success) {
        commit('setRf433Conf', data.data?.devices)
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getRf433Conf error:', error)
      throw error
    }
  },

  async getState({ commit, state }, capability) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'POST',
        `http://${state.activeDevice.ip}${API}state`,
        { capability },
        commit
      )

      if (data?.success && data?.data) {
        commit('setState', {
          key: capability,
          value: data.data?.state?.value,
          history: data?.data?.history,
        })
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getState error:', error)
      throw error
    }
  },

  /** POST /api/state { capability: "opentherm" } **/
  async getOpenThermState({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'POST',
        `http://${state.activeDevice.ip}${API}state`,
        { capability: 'opentherm' },
        commit
      )

      if (data?.success) {
        const datetime = dateToStringDateTime()
        const modulation = data.data.modulation
        const temperature = data.data.boiler_temperature

        commit('pushOpenThermData', { datetime, modulation, temperature })
        commit('setOpenThermData', data.data)
      }
      return data
    } catch (error) {
      commit('setLoading', false)
      console.error('getOpenThermState error:', error)
      throw error
    }
  },

  async getConf({ commit, state }, section) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'GET',
        `http://${state.activeDevice.ip}${API}conf`,
        { section },
        commit
      )

      if (data?.success) {
        // Используем Vue.set или прямой доступ к объекту
        // В зависимости от вашего store
        if (!state.state.conf) {
          state.state.conf = {}
        }
        state.state.conf[section] = data.data[section]
        return data.data
      } else {
        throw new Error('No conf found for section ' + section)
      }
    } catch (error) {
      commit('setLoading', false)
      console.error('getConf error:', error)
      throw error
    }
  },

  /** POST /api/settings **/
  async saveSetting({ commit, state }, { setting, values }) {
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'POST',
        `http://${state.activeDevice.ip}${API}settings`,
        { setting, values },
        commit
      )

      if (data?.success) {
        return data
      }
      return null
    } catch (error) {
      commit('setLoading', false)
      console.error('saveSetting error:', error)
      return null
    }
  },

  /** POST /api/switch **/
  async switchRelay({ commit, state }, { mode, index, level }) {
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'POST',
        `http://${state.activeDevice.ip}${API}switch`,
        { mode, index, level },
        commit
      )

      if (data?.success) {
        commit('updateRelayState', { index, state: level })
        return data
      }
      return null
    } catch (error) {
      commit('setLoading', false)
      console.error('switchRelay error:', error)
      return null
    }
  },

  /** POST /api/beep **/
  async beep({ commit, state }, { count, on_ms, off_ms }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest(
        'POST',
        `http://${state.activeDevice.ip}${API}beep`,
        { count, on_ms, off_ms },
        commit
      )

      if (data?.success) {
        return data
      }
      return null
    } catch (error) {
      commit('setLoading', false)
      console.error('beep error:', error)
      return null
    }
  },

  async getDeviceConfiguration({state, commit}){
    const data = await secureApiRequest(
      'GET',
      `http://${state.activeDevice.ip}${API}configuration`,
      null,
      commit
    )
    if (data?.success) {
      commit('setDeviceConfiguration', data.data)
      return data
    }
    return null
  },

  async saveDeviceConfiguration({state, commit}, configuration){
    const data = await secureApiRequest(
      'POST',
      `http://${state.activeDevice.ip}${API}configuration`,
      configuration,
      commit
    )
    if (data?.success) {
      commit('setDeviceConfiguration', configuration)
      return data
    }
    return null
  },

  async rebootDevice({state, commit}){
    const data = await secureApiRequest(
      'GET',
      `http://${state.activeDevice.ip}${API}reboot`,
      null,
      commit
    )
    commit('setLoading', false)
    commit('setReboot', true)
    if (data?.success) {
      return data
    }
    return null
  },

  async setScanModeRf433({state, commit}, mode){
    const data = await secureApiRequest(
      'POST',
      `http://${state.activeDevice.ip}${API}rf/scan`,
      {mode},
      commit
    )
    if (data?.success) {
      commit('setScanModeRf433', mode)
      return data
    }
    return null
  },

  /** AUTOMATIONS **/
  async getAutomations({state, commit}){
    const data = await secureApiRequest(
      'GET',
      `http://${state.activeDevice.ip}${API}automations`,
      commit
    )
    commit('setLoading', false)
    if (data?.success) {
      commit('setAutomations', data.data)
      return data
    }
    return null
  },
  async addAutomation({state, dispatch, commit}, data){
    const res = await secureApiRequest(
      'POST',
      `http://${state.activeDevice.ip}${API}automations`,
      data,
      commit
    )
    if (res?.success) {
      dispatch('getAutomations')
      return res
    }
    return null
  },
  async updateAutomation({state, dispatch, commit}, data){
    const res = await secureApiRequest(
      'PUT',
      `http://${state.activeDevice.ip}${API}automations/${data.id}`,
      data,
      commit
    )
    if (res?.success) {
      dispatch('getAutomations')
      return res
    }
    return null
  },
  async deleteAutomation({state, dispatch, commit}, id){
    const res = await secureApiRequest(
      'DELETE',
      `http://${state.activeDevice.ip}${API}automations/${id}`,
      commit
    )
    if (res?.success) {
      dispatch('getAutomations')
      return res
    }
    return null
  },
  async trustPairGenerate({state,commit}){
    const res = await secureApiRequest(
      'POST',
      `http://${state.activeDevice.ip}${API}trust/pair/generate`,
      {},
      commit
    )
    if (res?.success) {
      commit('setPairCode', res.data.pair)
      // TODO store code res.data.expires_in
      return res
    }
    return null
  },
  async trustPairConsume({commit}, {device, code}){
    const res = await secureApiRequest(
      'POST',
      `http://${device.ip}${API}trust/pair/consume`,
      {
        pair: code
      },
      commit
    )
    if(res?.success) {
      return res
    }
    return null
  },
}
