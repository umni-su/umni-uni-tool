<script>
import DebugCard from "@/components/chunks/DebugCard.vue";
import NetworkModeSelect from "@/components/chunks/NetworkModeSelect.vue";
import RebootConfirmation from "@/components/RebootConfirmation.vue";
import IpTypeSelect from "@/components/chunks/IpTypeSelect.vue";
import {invoke} from "@tauri-apps/api/core";

export default {
  name: "SettingsPage",
  components: {IpTypeSelect, RebootConfirmation, NetworkModeSelect, DebugCard},
  data() {
    return {
      tab: 'main',
      loading: false,
      error: false,
      settingsData: {
        general:{
          set_credentials: false,
          set_token: false,
          ntp: 'pool.ntp.org',
          password: null,
          socket_port: null,
          timezone: null,
          title: null,
          token: null,
          username: null,
        },
        network:{
          network_mode: 1,
          eth_dns: null,
          eth_gateway: null,
          eth_ip: null,
          eth_ip_type: null,
          eth_netmask: null,
          wifi_ap_password: null,
          wifi_sta_dns: null,
          wifi_sta_gateway: null,
          wifi_sta_ip: null,
          wifi_sta_ip_type: null,
          wifi_sta_netmask: null,
          wifi_sta_password: null,
          wifi_sta_ssid: null
        }
      }
    }
  },
  computed: {
    settings(){
      return this.$store.getters['getDeviceConfiguration']
    },
    validIpEth(){
      return this.isValidIp(this.settingsData.network.eth_ip)
    },
    validMaskEth(){
      return this.isValidIp(this.settingsData.network.eth_netmask)
    },
    validGwEth(){
      return this.isValidIp(this.settingsData.network.eth_gateway)
    },
    validIpWifi(){
      return this.isValidIp(this.settingsData.network.wifi_sta_ip)
    },
    validMaskWifi(){
      return this.isValidIp(this.settingsData.network.wifi_sta_netmask)
    },
    validGwWifi(){
      return this.isValidIp(this.settingsData.network.wifi_sta_gateway)
    },
    ethConfigurationInvalid(){
      return this.settingsData?.network?.eth_ip_type === 3 && (!this.validIpEth || !this.validMaskEth || !this.validGwEth)
    },
    wifiConfigurationInvalid(){
      return this.settingsData?.network?.wifi_sta_ip_type === 3 && (!this.validIpWifi || !this.validMaskWifi || !this.validGwWifi)
    }
  },
  watch: {
    'settingsData.network.eth_ip_type':{
      handler() {
        // this.settingsData.network.eth_ip = null
        // this.settingsData.network.eth_netmask = null
        // this.settingsData.network.eth_gateway = null
        // this.settingsData.network.eth_dns = null
      }
    },
    settings(newVal){
      if(newVal !== null && newVal !== undefined) {
        this.settingsData.general = {
          ...this.settingsData.general,
          ...{
            set_credentials: newVal.set_credentials,
              set_token: newVal.set_token,
            ntp: newVal.ntp,
            title: newVal.title,
            password: newVal.password,
            socket_port: newVal.socket_port,
            timezone: newVal.timezone,
            token: newVal.token,
            username: newVal.username,
          }
        }
        this.settingsData.network = {
          ...this.settingsData.network,
          ...{
            network_mode: newVal.network_mode,
            eth_ip_type: newVal.eth_ip_type,
            eth_netmask: newVal.eth_netmask,
            eth_ip: newVal.eth_ip,
            eth_gateway:newVal.eth_gateway,
            eth_dns: newVal.eth_dns,
            wifi_sta_ip_type: newVal.wifi_sta_ip_type,
            wifi_sta_dns: newVal.wifi_sta_dns,
            wifi_sta_gateway: newVal.wifi_sta_gateway,
            wifi_sta_ip: newVal.wifi_sta_ip,
            wifi_sta_netmask: newVal.wifi_sta_netmask,
            wifi_sta_password: newVal.wifi_sta_password,
            wifi_sta_ssid: newVal.wifi_sta_ssid,
          }
        }
      }
    }
  },
  async created() {
    await this.getSettings()
  },
  methods: {
    getNetworkConfigurationForServer(){
      const mode = this.settingsData.network.network_mode
      if(mode === 1) {
        // ETH
        const eth_type = this.settingsData.network.eth_ip_type
        if(eth_type === 0) {
          // DHCP
          return {
            eth_ip_type: this.settingsData.network.eth_ip_type
          }
        } else {
          return {
            eth_ip_type: this.settingsData.network.eth_ip_type,
            eth_netmask: this.settingsData.network.eth_netmask,
            eth_ip: this.settingsData.network.eth_ip,
            eth_gateway: this.settingsData.network.eth_gateway,
            eth_dns: this.settingsData.network.eth_dns,
          }
        }
      } else {
        // WIFI AS DEFAULT
        const wifi_type = this.settingsData.network.wifi_sta_ip_type
        if(wifi_type === 0) {
          // DHCP
          return {
            wifi_sta_ip_type: this.settingsData.network.wifi_sta_ip_type
          }
        } else {
          return {
            wifi_sta_ip_type: this.settingsData.network.wifi_sta_ip_type,
            wifi_sta_dns: this.settingsData.network.wifi_sta_dns,
            wifi_sta_gateway: this.settingsData.network.wifi_sta_gateway,
            wifi_sta_ip: this.settingsData.network.wifi_sta_ip,
            wifi_sta_netmask: this.settingsData.network.wifi_sta_netmask,
            wifi_sta_password: this.settingsData.network.wifi_sta_password,
            wifi_sta_ssid: this.settingsData.network.wifi_sta_ssid,
          }
        }
      }
    },
    isValidIp(v){
      const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipv4Regex.test(v);
    },
    async getSettings() {
      this.loading = true
      const ok = await this.$store.dispatch('getDeviceConfiguration').catch(()=>{
        this.error = true
      }).finally(() => {
        this.loading = false
      })
      if(ok){
        this.error = false
      }
    },
    async saveSettings(section){
      const serverData = section === 'newtork' ? this.getNetworkConfigurationForServer() : this.settingsData[section];
      const res = await this.$store.dispatch('saveDeviceConfiguration', serverData)
      if(res?.success){
        this.$store.commit('success', this.$t('Saved'))
      }
      await this.$refs.reboot.reboot()
    },
    async initScanner() {
      this.$store.commit('setScanMode', true);
      try {
        await invoke('start_mdns_discovery');
      } catch (err) {
        console.error("Ошибка mDNS:", err);
      }
    },
  }
}
</script>

<template>
  <VEmptyState
    v-if="error"
    :title="$t('Error connecting to device')"
  >
    <template #actions="">
      <VBtn
        prepend-icon="mdi-refresh"
        :text="$t('Scan devices')"
        color="primary"
        @click="initScanner"
      />
    </template>
  </VEmptyState>
  <VSheet
    v-else
    class="pa-4 mx-auto"
    color="transparent"
    max-width="1200"
  >
    <VCard :loading="loading">
      <template #title>
        {{ $t('Settings') }}
      </template>
      <template #text>
        <VContainer
          fluid
          class="pa-0 mt-1"
        >
          <VRow>
            <VCol
              cols="12"
              sm="4"
            >
              <VTabs
                v-model="tab"
                density="compact"
                mobile-breakpoint="md"
                center-active
                :align-tabs="$vuetify.display.xs ? 'center' : 'start'"
                :direction="$vuetify.display.xs ?'horizontal' : 'vertical'"
              >
                <VTab
                  border="0"
                  value="main"
                  :text="$t('Main settings')"
                />
                <VTab
                  border="0"
                  value="network"
                  :text="$t('Network')"
                />
              </VTabs>
            </VCol>

            <VCol
              cols="12"
              sm="8"
            >
              <VSheet>
                <VTabsWindow
                  v-model="tab"
                  crossfade
                  reverse
                >
                  <VTabsWindowItem value="main">
                    <div class="text-title-large mb-4 font-weight-bold">
                      {{ $t('Main settings') }}
                    </div>
                    <VTextField
                      v-model="settingsData.general.title"
                      class="mb-4"
                      :label="$t('Device name')"
                    />
                    <VTextField
                      v-model="settingsData.general.ntp"
                      class="mb-4"
                      :label="$t('NTP server')"
                    />
                    <VTextField
                      v-model="settingsData.general.timezone"
                      class="mb-4"
                      :label="$t('Timezone')"
                    />
                    <VTextField
                      v-model.number="settingsData.general.socket_port"
                      class="mb-4"
                      :label="$t('Syslog port')"
                    />
                    <VCheckbox
                      v-model="settingsData.general.set_credentials"
                      :label="$t('Change credentials')"
                    />
                    <VTextField
                      v-if="settingsData.general.set_credentials"
                      v-model="settingsData.general.username"
                      class="mb-4"
                      :label="$t('Username')"
                    />
                    <VTextField
                      v-if="settingsData.general.set_credentials"
                      v-model="settingsData.general.password"
                      class="mb-4"
                      :label="$t('Password')"
                    />
                    <VCheckbox
                      v-model="settingsData.general.set_token"
                      :label="$t('Change access token')"
                    />
                    <VTextField
                      v-if="settingsData.general.set_token"
                      v-model="settingsData.general.token"
                      class="mb-4"
                      :label="$t('Access token')"
                    />
                    <VBtn
                      prepend-icon="mdi-content-save"
                      :text="$t('Save')"
                      @click="saveSettings('general')"
                    />
                  </VTabsWindowItem>
                  <VTabsWindowItem value="network">
                    <div class="text-title-large mb-4 font-weight-bold">
                      {{ $t('Network') }}
                    </div>
                    <NetworkModeSelect
                      v-model="settingsData.network.network_mode"
                      class="mt-2"
                    />
                    <VSheet v-if="settingsData.network.network_mode === 1">
                      <IpTypeSelect
                        v-model="settingsData.network.eth_ip_type"
                        class="mt-4"
                      />
                      <VSheet v-if="settingsData.network.eth_ip_type === 3">
                        <VTextField
                          v-model="settingsData.network.eth_ip"
                          class="mt-4"
                          :label="$t('IP address')"
                        />
                        <VTextField
                          v-model="settingsData.network.eth_netmask"
                          class="mt-4"
                          :label="$t('Network mask')"
                        />
                        <VTextField
                          v-model="settingsData.network.eth_gateway"
                          class="mt-4"
                          :label="$t('Gateway')"
                        />
                        <VTextField
                          v-model="settingsData.network.eth_dns"
                          class="mt-4"
                          :label="$t('DNS server')"
                        />
                      </VSheet>
                    </VSheet>
                    <VSheet v-else-if="settingsData.network.network_mode === 3">
                      <IpTypeSelect
                        v-model="settingsData.network.wifi_sta_ip_type"
                        class="mt-4"
                      />
                      <VTextField
                        v-model="settingsData.network.wifi_sta_ssid"
                        class="mt-4"
                        :label="$t('SSID name')"
                      />
                      <VTextField
                        v-model="settingsData.network.wifi_sta_password"
                        type="password"
                        class="mt-4"
                        :label="$t('SSID password')"
                      />
                      <VSheet v-if="settingsData.network.wifi_sta_ip_type === 3">
                        <VTextField
                          v-model="settingsData.network.wifi_sta_ip"
                          class="mt-4"
                          :label="$t('IP address')"
                        />
                        <VTextField
                          v-model="settingsData.network.wifi_sta_netmask"
                          class="mt-4"
                          :label="$t('Network mask')"
                        />
                        <VTextField
                          v-model="settingsData.network.wifi_sta_gateway"
                          class="mt-4"
                          :label="$t('Gateway')"
                        />
                        <VTextField
                          v-model="settingsData.network.wifi_sta_dns"
                          class="mt-4"
                          :label="$t('DNS server')"
                        />
                      </VSheet>
                    </VSheet>
                    <VBtn
                      class="mt-4"
                      prepend-icon="mdi-content-save"
                      :text="$t('Save')"
                      @click="saveSettings('network')"
                    />
                  </VTabsWindowItem>
                </VTabsWindow>
              </VSheet>
            </VCol>
          </VRow>
        </VContainer>

        <DebugCard>{{ settingsData }}</DebugCard>
      </template>
    </VCard>
    <RebootConfirmation ref="reboot" />
  </VSheet>
</template>

<style scoped lang="scss">

</style>
