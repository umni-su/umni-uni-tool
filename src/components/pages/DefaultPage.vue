<script>
import { listen } from '@tauri-apps/api/event';
import {storage as deviceStorage} from "@/store/devices/device_store.js";

import UmniLogo from "../chunks/UmniLogo.vue";
import ThemeSwitcher from "../chunks/ThemeSwitcher.vue";
import AppLoader from "../chunks/widgets/AppLoader.vue";
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import AddDeviceModal from "@/components/AddDeviceModal.vue";
import NavigationPanel from "@/components/chunks/NavigationPanel.vue";
import RebootPage from "@/components/pages/RebootPage.vue";
import DebugSwitcher from "@/components/chunks/DebugSwitcher.vue";
import {invoke} from "@tauri-apps/api/core";


export default {
  name: "DefaultPage",
  components: {
    DebugSwitcher,
    RebootPage, NavigationPanel, AddDeviceModal, ModalDialog, ThemeSwitcher, UmniLogo, AppLoader},
  data(){
    return {
      unListen: null,
      opened: false,
      loading: false,
    }
  },
  computed: {
    isScanning(){
      return this.$store.getters['isScanMode'];
    },
    devices(){
      return this.$store.getters['getDevices']
    },
    devicesFromScan(){
      return this.devices.filter(device => device.fromScan)
    },
    activeDevice(){
      return this.$store.getters['getActiveDevice'];
    },
    deviceError(){
      return this.$store.getters['isDeviceError'];
    },
    hasDevice(){
      return this.activeDevice !== null;
    },
    systemInfo(){
      return this.$store.getters['getSystemInfo'];
    },
    hostname(){
      return this.$store.getters['getHostname']?.toUpperCase();
    },
    title(){
      return this.systemInfo?.title?.toUpperCase();
    },
    theme() {
      return this.$store.getters['getTheme']
    },
    interval() {
      return this.$store.getters['getRefreshInterval'] / 1000
    },
    mobile(){
      return this.$vuetify.display.mobile
    },
    isOpen(){
      return this.$store.getters['isSidebarOpen']
    },
    color(){
      return this.$vuetify.theme.name === 'light' ? 'grey-lighten-4' : 'rgba(0,0,0,0.3)'
    },
    isReboot(){
      return this.$store.getters['isReboot']
    },
    titleText(){
      return this.title ? `${this.title} (${this.hostname})` : this.hostname
    },
    mergedDevices(){
      const merged = []
      this.devicesFromScan.map(deviceScan=>{
        let founded = false
        this.devices?.map(device => {
          if(deviceScan.hostname === device.hostname){
            founded = true
          }
          merged.push(device)
        })
        if(!founded){
          //merged.push({...deviceScan,...{merged: false}})
        }
      })
      return merged
    }
  },
  watch:{
    isScanning(v){
      this.opened = v;
    },
    async opened(v){
      this.$store.commit('setScanMode', v)
      try {
        await invoke('start_mdns_discovery');
      } catch (err) {
        console.error("Ошибка mDNS:", err);
      }
    },
    activeDevice:{
      async handler(val){
        if(val !== null){
          if (this.$route.path === '/') {
            this.$router.push({name: 'home_panel'})
          }
          this.$store.dispatch('closeSSE')
          await this.$store.dispatch('initSSE')

          this.loading = true
          await this.getSystemInfo().finally(() => this.loading = false)
        }
      }
    },
  },
  created(){
    this.$moment.locale(this.$i18n.locale);
  },
  async beforeCreate() {
    const activeDevice = await deviceStorage.getActiveDevice()
    this.$store.commit('setActiveDevice', activeDevice)
  },
  async beforeMount() {
    const pack = await import('../../../package.json')
    this.$store.commit('setVersion', pack.version)
  },
  unmounted() {
    if (this.unListen) {
      this.unListen(); // Вызываем сохраненную функцию отписки
      this.unListen = null;
    }
  },
  async mounted() {
    await this.loadDevices();
    this.unListen = await listen('device-found', (event) => {
      //const [hostname, ips, txt] = event.payload;
      const [name, hostname, ips, txt] = event.payload
      const ip = ips[0];
      this.$store.commit('saveDevice',{
        name: hostname.replace('.local.', '.local'),
        hostname: hostname.replace('.local.', '.local'),
        ip: ip,
        lastSeen: Date.now(),
        fromScan:true,
        txt
      })
    });
  },
  methods: {
    async loadDevices() {
      const devices = await deviceStorage.loadSavedDevices();
      this.$store.commit('setDevices', devices)
    },

    async getSystemInfo() {
      await this.$store.dispatch('getSystemInfo')
    },
    async logout() {
      await this.$store.dispatch('logOut')
    },
    setActiveDevice(device){
      this.$store.commit('setActiveDevice', device)
      this.opened = false
    },
    openAddDevice(){
      this.$store.commit('setAddDevice', true)
    },
    toggleSidebar(){
      this.$store.commit('setSidebarOpen', !this.isOpen);
    },

  }
}
</script>

<template>
  <VSheet
    class="fill-height"
  >
    <VAppBar
      class="safe"
      color="primary"
      :theme="theme"
      rounded="0"
    >
      <template #prepend>
        <VBtn
          density="comfortable"
          class="mx-2"
          icon="mdi-menu"
          color="default"
          @click="toggleSidebar"
        />
        <VAppBarNavIcon
          :loading="loading"
          density="default"
          :to="{name:'home_panel'}"
        >
          <UmniLogo
            :fill="theme === 'light'?'white' : 'white'"
            :width="35"
            :height="35"
            class=""
          />
        </VAppBarNavIcon>
      </template>
      <template #title>
        <div
          v-if="hasDevice"
          class="text-center"
        >
          <VBtn
            :text="titleText"
            color="default"
            density="comfortable"
            variant="tonal"
            @click="$store.commit('setScanMode', true)"
          />
        </div>
      </template>
      <template #append>
        <ThemeSwitcher
          class="mx-2"
          density="comfortable"
        />
        <DebugSwitcher
          class="mx-2"
          density="comfortable"
        />
      </template>
    </VAppBar>
    <NavigationPanel ref="navigation" />
    <VMain class="fill-height">
      <RebootPage
        v-if="isReboot"
        @start-scan="$refs.navigation.startScan"
      />
      <VSheet
        v-else
        :color="color"
        class="px-2 fill-height mx-auto"
        rounded="0"
      >
        <VEmptyState v-if="loading">
          <template #title>
            <VSheet class="mt-4">
              {{ $t('Connecting. Please wait...') }}
            </VSheet>
          </template>
          <template #media>
            <VProgressCircular
              indeterminate
              color="primary"
              :size="64"
            />
          </template>
        </VEmptyState>
        <VSheet
          v-else
          class="fill-height"
          width="100%"
          color="transparent"
        >
          <RouterView v-if="systemInfo && hasDevice" />
          <VEmptyState v-else>
            <template #text>
              <VAlert
                v-if="deviceError"
                variant="tonal"
                color="error"
              >
                {{ $t('Error connecting to device') }}
                <template #append>
                  <VBtn
                    prepend-icon="mdi-reload"
                    rounded="pill"
                    size="small"
                    :text="$t('Refresh')"
                    color="error"
                    @click="getSystemInfo"
                  />
                </template>
              </VAlert>
            </template>
          </VEmptyState>
        </VSheet>
        <AppLoader />
      </VSheet>
      <AddDeviceModal />
    </VMain>
    <ModalDialog
      v-model="opened"
      :title="$t('Choose device')"
    >
      <VList>
        <VListItem
          v-for="device in devicesFromScan"
          :key="device"
          rounded="lg"
          :value="device"
        >
          <template #title>
            {{ device.title }}
          </template>
          <template #subtitle>
            <VChip
              rounded="pill"
              size="small"
            >
              {{ device.name.toUpperCase() }}
            </VChip>
            <VChip
              rounded="pill"
              size="small"
              class="ml-2"
            >
              {{ device.ip }}
            </VChip>
          </template>
          <template #append>
            <VBtn
              density="compact"
              rounded="pill"
              icon="mdi-chevron-right"
              @click="setActiveDevice(device)"
            />
          </template>
        </VListItem>
      </VList>
      <template #actions>
        <VSheet
          class="text-center"
          width="100%"
        >
          <VBtn
            prepend-icon="mdi-plus"
            rounded="pill"
            variant="elevated"
            :text="$t('Add device')"
            @click="openAddDevice"
          />
        </VSheet>
      </template>
    </ModalDialog>
  </VSheet>
</template>

<style scoped>
.safe {
  padding-top: env(safe-area-inset-top);
}
</style>
