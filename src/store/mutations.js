import {storage as deviceStorage} from "@/store/devices/device_store.js";
export default {
  info(state, text) {
    const notification = {
      style: 'info',
      timeout: 2000,
      active: true,
      text
    }
    state.appNotifications.push(notification)
  },
  success(state, text) {
    const notification = {
      style: 'success',
      timeout: 2000,
      active: true,
      text
    }
    state.appNotifications.push(notification)
  },
  error(state, text) {
    const notification = {
      style: 'error',
      timeout: 2000,
      active: true,
      text
    }
    state.appNotifications.push(notification)
  },
  warning(state, text) {
    const notification = {
      style: 'warning',
      timeout: 2000,
      active: true,
      text
    }
    state.appNotifications.push(notification)
  },
  removeAppNotification(state) {
    state.appNotifications = state.appNotifications.filter(n => n.active === true)
  },
  // UI mutations
  setTheme(state, theme) {
    localStorage.setItem('theme', theme)
    state.theme = theme
  },
  setLoading(state, loading) {
    state.loading = loading
  },
  setDebug(state, debug) {
    state.debug = debug
  },
  setRefreshInterval(state, interval) {
    state.refreshInterval = interval
  },
  setVersion(state, version) {
    state.version = version
  },
  setReboot(state, reboot) {
    state.reboot = reboot
  },
  setAddDevice(state, addDevice) {
    state.addDevice = addDevice
  },
  setDeviceRequestError(state, err){
    state.deviceRequestError = err
  },
  deviceRequestErrorOn(state){
    state.deviceRequestError = true
  },
  deviceRequestErrorOff(state){
    state.deviceRequestError = false
  },

  setDevices(state, devices){
    state.devices = devices
  },

  setSidebarRail(state, sidebarRail) {
    state.sidebarRail = sidebarRail
  },
  setSidebarOpen(state, sidebarOpen) {
    state.sidebarOpen = sidebarOpen
  },
  setScanMode(state, scanMode) {
    state.scanMode = scanMode
  },

  async saveDevice(state, device){
    const index = state.devices.findIndex(d => d.hostname === device.hostname)
    if(index === -1){
      state.devices.push(device)
      await deviceStorage.saveDevice(device, false)
    } else {
      state.devices[index] = {...state.devices[index], ...device}
      await deviceStorage.updateDevice(device.hostname, device)
    }

  },

  removeDevice(state, device){
    state.devices = state.devices.filter(d => d.hostname !== device.hostname)
  },

  async setActiveDevice(state, activeDevice) {
    if(activeDevice !== null) {
      await deviceStorage.saveDevice(activeDevice, true)
    }
    state.activeDevice = activeDevice
    state.devices = await deviceStorage.loadSavedDevices()
  },

  // /api/systeminfo
  setSystemInfo(state, info) {
    state.state.info = info
  },

  // /api/conf
  setAdcConf(state, adc) {
    state.state.conf.adc = adc
  },
  setNtcConf(state, ntc) {
    state.state.conf.ntc = ntc
  },
  setDioConf(state, dio) {
    state.state.conf.dio = dio
  },
  setOneWireConf(state, onewire) {
    state.state.conf.onewire = onewire
  },
  setRf433Conf(state, rf433) {
    state.state.conf.rf433 = rf433
  },
  updateRf433Value(state, {serial,value}) {
    const existing = state.state.conf.rf433.findIndex(d => d.serial === serial)
    if (existing) {
      state.state.conf.rf433[existing].value = value
    }
  },
  addRf433Sensor(state, sensor) {
    if (state.state.conf.rf433) {
      const existing = state.state.conf.rf433.findIndex(d => d.serial === sensor.serial)
      if (existing === -1) {
        state.state.conf.rf433.push(
          {
            ...sensor,
            ...{
              type: 20,
              new: true,
              label: null,
              alarm:false
            }
          })
      } else {
        state.state.conf.rf433[existing] = {
          ...state.state.conf.rf433[existing],
          ...sensor
        }
      }
    }
  },

  updateRf433Sensor(state, sensor) {
    if(state.state.conf.rf433){
      const existing = state.state.conf.rf433.findIndex(d=>d.serial === sensor.serial)
      if(existing > -1){
        state.state.conf.rf433[existing] = {
          ...state.state.conf.rf433[existing],
          ...sensor
        }
      }
    }
  },


  setOutputs(state, outputs) {
    state.state.conf.outputs = outputs
  },
  setInputs(state, inputs) {
    state.state.conf.inputs = inputs
  },
  setOpenCollectors(state, oc) {
    state.state.conf.opencollectors = oc
  },

  // /api/state
  setOpenThermData(state, data) {
    state.state.sensorData.opentherm = data
  },

  setState(state, {key, value, history}) {
    state.state.sensorData[key] = {value, history}
  },

  setDeviceConfiguration(state, deviceConfiguration) {
    state.deviceConfiguration = deviceConfiguration
  },

  // Charts
  pushAdcData(state, { datetime, adc1, adc2 }) {
    state.charts.time.push(datetime)
    state.charts.adc1.push(adc1)
    state.charts.adc2.push(adc2)

    if (state.charts.time.length > 50) {
      state.charts.time.shift()
      state.charts.adc1.shift()
      state.charts.adc2.shift()
    }
  },

  pushNtcData(state, { ntc1, ntc2 }) {
    state.charts.ntc1.push(ntc1)
    state.charts.ntc2.push(ntc2)

    if (state.charts.ntc1.length > 50) {
      state.charts.ntc1.shift()
      state.charts.ntc2.shift()
    }
  },

  pushOpenThermData(state, { datetime, modulation, temperature }) {
    if (typeof modulation === 'number') {
      state.charts.opentherm.modulation.push([datetime, modulation])
      if (state.charts.opentherm.modulation.length > 50) {
        state.charts.opentherm.modulation.shift()
      }
    }

    if (typeof temperature === 'number') {
      state.charts.opentherm.temperature.push([datetime, temperature])
      if (state.charts.opentherm.temperature.length > 50) {
        state.charts.opentherm.temperature.shift()
      }
    }
  },

  updateOneWireChart(state, { datetime, sensors }) {
    if (state.charts.timeOw.length === 0) {
      state.charts.ow = sensors.map(sensor => ({
        type: 'line',
        name: sensor.label !== null ? sensor.label : sensor.sn,
        sn: sensor.sn,
        smooth: true,
        emphasis: { focus: 'series' },
        symbolSize: 10,
        markPoint: {
          symbolSize: 70,
          data: [
            { type: 'max', name: 'Max' },
            { type: 'min', name: 'Min' }
          ]
        },
        data: []
      }))
    }

    for (const sensor of sensors) {
      const index = state.charts.ow.findIndex(s => s.sn === sensor.sn)
      if (index > -1 && sensor.temp) {
        state.charts.ow[index].data.push(sensor.temp.toFixed(2))
        if (state.charts.ow[index].data.length > 50) {
          state.charts.ow[index].data.shift()
        }
      }
    }

    state.charts.timeOw.push(datetime)
    if (state.charts.timeOw.length > 50) {
      state.charts.timeOw.shift()
    }
  },

  updateRelayState(state, { index, state: relayState }) {
    if (state.state.conf?.outputs) {
      const relayIndex = state.state.conf?.outputs.findIndex(
        r => r.index === index
      )

      if (relayIndex > -1 && state.state.conf?.outputs[relayIndex]) {
        state.state.conf.outputs[relayIndex].state = relayState
      }
    }
  },
  updateInputState(state, { index, state: relayState }) {
    if (state.state.conf?.inputs) {
      const inputIndex = state.state.conf?.inputs.findIndex(
        r => r.index === index
      )

      if (inputIndex > -1 && state.state.conf?.inputs[inputIndex]) {
        state.state.conf.inputs[inputIndex].state = relayState
      }
    }
  },
  updateOcState(state, { index, state: ocState }) {
    if (state.state.conf?.inputs) {
      const ocIndex = state.state.conf?.opencollectors.findIndex(
        r => r.index === index
      )

      if (ocIndex > -1 && state.state.conf?.opencollectors[ocIndex]) {
        state.state.conf.opencollectors[ocIndex].state = ocState
      }
    }
  },

  setScanModeRf433(state, mode){
    state.scanModeRf433 = mode
  },
}
