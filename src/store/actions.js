import dateToStringDateTime from "@/helpers/dateToStringDateTime.js"
import {invoke} from "@tauri-apps/api/core";

// Базовые настройки (axios больше не нужен)
const API = '/api/'

async function secureApiRequest(method, url, body = null, commit = null) {
  if(commit){
    commit('deviceRequestErrorOff')
  }
  try {
    // Rust-команда сама вернет готовый объект, если ответ — JSON
    // Если произойдет сетевая ошибка или IP запрещен — выкинет exception
    return await invoke('secure_request', {
      payload: {url, method, body}
    })
  } catch (error) {
    // error здесь — это то, что мы написали в Err(...) в Rust
    const customError = new Error(error)
    console.error(`Secure Request Error [${method}]:`, error)
    if(commit){
      commit('deviceRequestErrorOn')
    }
    throw customError
  }
}

export default {
  /** GET /api/systeminfo **/
  async getSystemInfo({ commit, state }) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest('GET',`http://${state.activeDevice.ip}${API}systeminfo`, null, commit)
      commit('setLoading', false)

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

  async checkDevice({ commit, state }, ip) {
    if (state.loading) return false
    commit('setLoading', true)

    try {
      const data = await secureApiRequest('GET',`http://${ip}${API}systeminfo`, null, commit)
      commit('setLoading', false)
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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
      commit('setLoading', false)

      if (data?.success) {
        commit('setRf433Conf', data.data)
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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
      commit('setLoading', false)

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
    commit('setLoading', false)
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
    commit('setLoading', false)
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
}
