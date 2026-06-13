export default {
  // UI
  getAppNotifications(state){
    return state.appNotifications;
  },
  getTheme(state) {
    return state.theme
  },
  isLoading(state) {
    return state.loading
  },
  isDebug(state) {
    return state.debug
  },
  getRefreshInterval(state) {
    return state.refreshInterval
  },
  getVersion(state) {
    return state.version
  },
  isReboot(state) {
    return state.reboot
  },
  isSidebarRail(state) {
    return state.sidebarRail
  },
  isSidebarOpen(state) {
    return state.sidebarOpen
  },
  isScanMode(state) {
    return state.scanMode
  },

  getDevices(state) {
    return [...state.devices].sort((a, b) => {
      // Активное устройство всегда первое
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;

      // Затем сортируем по имени
      return a.name.localeCompare(b.name);
    });
  },

  getFilteredDevices: (state) => (searchText) => {
    let devices = [...state.devices];

    if (searchText) {
      const query = searchText.toLowerCase();
      devices = devices.filter(device =>
        device.name.toLowerCase().includes(query) ||
        device.ip.toLowerCase().includes(query) ||
        device.hostname.toLowerCase().includes(query)
      );
    }

    return devices.sort((a, b) => {
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return a.name.localeCompare(b.name);
    });
  },

  getActiveDevice(state) {
    return state.activeDevice
  },

  isAddDevice(state) {
    return state.addDevice
  },

  // System Info (/api/systeminfo)
  getSystemInfo(state) {
    return state.state.info
  },
  getHostname(state) {
    return state.activeDevice?.hostname || null
  },
  getTitle(state) {
    return state.activeDevice?.title || null
  },
  getCapabilities(state) {
    const caps = state.state.info?.capabilities || []
    return caps.sort()
  },
  getAutomationsCapabilities(state) {
    const caps = state.state.info?.capabilities || []
    const filteredCaps = caps.filter(cap =>
      cap !== 'ai' &&
      cap !== 'ethernet' &&
      cap !== 'wifi' &&
      cap !== 'inputs' &&
      cap !== 'outputs' &&
      cap !== 'webserver' &&
      cap !== 'webhooks' &&
      cap !== 'opencollectors'
    )
    return filteredCaps.sort()
  },
  getAutomationsSwitchCapabilities(state, getters) {
    const caps = getters['getAutomationsCapabilities']
    const filteredCaps = caps.filter(cap =>
      (cap.startsWith('oc') && cap.length > 2) ||
      (cap.startsWith('out') && cap.length > 3) ||
      cap === 'opentherm' ||
      cap === 'buzzer' ||
      cap === 'alarm'
    )
    return filteredCaps.sort()
  },
  getHeapInfo(state) {
    return state.state.info?.heap || null
  },

  getOutputs(state) {
    return state.state.conf.outputs || []
  },
  getInputs(state) {
    return state.state.conf.inputs || []
  },
  getOpenCollectors(state) {
    return state.state.conf.opencollectors || []
  },

  isDeviceError(state){
    return state.deviceRequestError
  },

  getDeviceConfiguration(state) {
    return state.deviceConfiguration
  },

  // Проверка capabilities
  hasCapability: (state) => (capability) => {
    return state.state.info?.capabilities?.includes(capability) || false
  },
  hasEthernet(state) {
    return state.state.info?.capabilities?.includes('ethernet') || false
  },
  hasWifi(state) {
    return state.state.info?.capabilities?.includes('wifi') || false
  },
  hasSdCard(state) {
    return state.state.info?.capabilities?.includes('sdcard') || false
  },
  hasMqtt(state) {
    return state.state.info?.capabilities?.includes('mqtt') || false
  },
  hasOpenTherm(state) {
    return state.state.info?.capabilities?.includes('opentherm') || false
  },
  hasRf433(state) {
    return state.state.info?.capabilities?.includes('rf433') || false
  },
  hasOneWire(state) {
    return state.state.info?.capabilities?.includes('onewire') || false
  },
  hasNtc1(state) {
    return state.state.info?.capabilities?.includes('ntc1') || false
  },
  hasNtc2(state) {
    return state.state.info?.capabilities?.includes('ntc2') || false
  },
  hasAi1(state) {
    return state.state.info?.capabilities?.includes('ai1') || false
  },
  hasAi2(state) {
    return state.state.info?.capabilities?.includes('ai2') || false
  },
  hasOpenCollectors: (state) => {
    return state.state.info?.capabilities?.includes(`opencollectors`) || false
  },
  hasOutputs: (state) => {
    return state.state.info?.capabilities?.includes(`outputs`) || false
  },
  hasInputs: (state) => {
    return state.state.info?.capabilities?.includes(`inputs`) || false
  },
  hasOutput: (state) => (num) => {
    return state.state.info?.capabilities?.includes(`out${num}`) || false
  },
  hasInput: (state) => (num) => {
    return state.state.info?.capabilities?.includes(`inp${num}`) || false
  },

  // Конфигурации (/api/conf)
  getAdcConf(state) {
    return state.state.conf.adc
  },
  getNtcConf(state) {
    return state.state.conf.ntc
  },
  getDioConf(state) {
    return state.state.conf.dio
  },

  getState:(state) => (key) => {
    return state.state.sensorData[key] || null
  },

  getRelayState: (state) => (index) => {
    const relay = state.state.conf.dio?.outputs?.find(r => r.config_index === index || r.port_index === index)
    return relay?.state !== undefined ? relay.state : relay?.default_state || 0
  },
  getOneWireConf(state) {
    return state.state.conf.onewire
  },
  getOneWireSensors(state) {
    return state.state.conf.onewire?.sensors || []
  },
  getRf433Conf(state) {
    return state.state.conf.rf433
  },
  getRf433Devices(state) {
    return state.state.conf.rf433?.devices || []
  },

  // Данные сенсоров (/api/state)
  getOpenThermData(state) {
    return state.state.sensorData.opentherm?.state
  },
  getBoilerTemperature(state) {
    return state.state.sensorData.opentherm?.boiler_temperature || 0
  },
  getModulation(state) {
    return state.state.sensorData.opentherm?.modulation || 0
  },
  getFlameOn(state) {
    return state.state.sensorData.opentherm?.flame_on || false
  },
  getPressure(state) {
    return state.state.sensorData.opentherm?.pressure || 0
  },
  getCentralHeatingActive(state) {
    return state.state.sensorData.opentherm?.central_heating_active || false
  },
  getHotWaterActive(state) {
    return state.state.sensorData.opentherm?.hot_water_active || false
  },

  // Charts
  getCharts(state) {
    return state.charts
  },
  getOpenThermCharts(state) {
    return state.charts.opentherm
  },
  getAutomations(state){
    return state.automations
  },
  getActiveAutomation(state){
    return state.activeAutomation
  }
}
