<script>
import {isPermissionGranted, requestPermission} from '@tauri-apps/plugin-notification';
import {listen} from '@tauri-apps/api/event';

import LoginPage from "@/components/pages/LoginPage.vue";
import DefaultPage from "@/components/pages/DefaultPage.vue";
import AppNotifications from "@/components/chunks/AppNotifications.vue";
import {storage as deviceStorage} from "@/store/devices/device_store.js";
import AddDeviceModal from "@/components/AddDeviceModal.vue";
import DeviceDiscoveryModal from "@/components/chunks/DeviceDiscoveryModal.vue";
import ErrorPage from "@/components/pages/ErrorPage.vue";
export default {
  name: 'App',
  components: {
    ErrorPage,
    DeviceDiscoveryModal,
    AddDeviceModal,
    AppNotifications,
    DefaultPage,
    LoginPage
  },
  data() {
    return {
      visible: false,
      unListenDevices: null
    }
  },
  computed: {
    appError(){
      return this.$store.getters['getAppError']
    },
    authenticated() {
      return this.$store.getters['isAuthenticated']
    },
    authChecked() {
      return this.$store.getters['isAuthChecked']
    },
    activeDevice() {
      return this.$store.getters['getActiveDevice']
    },
    theme() {
      return this.$store.getters['getTheme']
    },

  },

  watch:{
    activeDevice:{
      async handler(val){
        if(val !== null){
          if (this.$route.path === '/') {
            this.$router.push({name: 'home_panel'})
          }
          this.$store.dispatch('closeSSE')
          await this.$store.dispatch('initSSE')

          this.loading = true
          try {
            const res = await this.getSystemInfo()
            // false — запрос не выполнялся (уже идёт другой), не оставляем UI в подвешенном состоянии
            if(res === false) {
              this.$store.commit('setAuthenticated', false)
            }
          } catch {
            this.$store.commit('setActiveDevice', null)
            this.$store.commit('setAuthenticated', false)
          } finally {
            this.loading = false
          }
        }
      }
    },
  },
  async beforeCreate() {
    const [activeDevice, devices] = await Promise.all([
      deviceStorage.getActiveDevice(),
      deviceStorage.loadSavedDevices()
    ])
    this.$store.commit('setDevices', devices)
    if (activeDevice === null) {
      // проверять нечего — показываем экран токена/сканирования сразу
      this.$store.commit('setAuthenticated', false)
    }
    this.$store.commit('setActiveDevice', activeDevice)
  },
  async mounted() {
    // Слушатель mDNS живёт в App.vue, т.к. DefaultPage размонтирован на экране токена,
    // а сканировать устройства нужно и оттуда.
    this.unListenDevices = await listen('device-found', (event) => {
      const [, hostname, ips, txt] = event.payload
      const name = hostname.replace('.local.', '.local')
      this.$store.commit('saveDevice', {
        name,
        hostname: name,
        ip: ips[0],
        lastSeen: Date.now(),
        online: true,
        fromScan: true,
        txt
      })
    })

    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }

    if (permissionGranted) {
      console.log('✓ Уведомления разрешены');
    } else {
      console.warn('✗ Нет разрешения на уведомления');
    }
  },
  beforeUnmount() {
    if (this.unListenDevices) {
      this.unListenDevices()
      this.unListenDevices = null
    }
  },
  created() {
    this.visible = true
  },
  methods: {
    async getSystemInfo() {
      return this.$store.dispatch('getSystemInfo')
    },
  }
}
</script>

<template>
  <VApp
    v-if="visible"
    :theme="theme"
  >
    <ErrorPage v-if="appError !== null" />
    <VApp v-else>
      <LoginPage v-if="authChecked && !authenticated" />
      <DefaultPage v-else-if="authenticated" />
      <VSheet
        v-else
        color="primary"
        rounded="0"
        class="fill-height d-flex align-center justify-center"
      >
        <VProgressCircular
          indeterminate
          size="48"
        />
      </VSheet>
    </VApp>

    <AppNotifications />
    <DeviceDiscoveryModal />
    <AddDeviceModal />
  </VApp>
</template>

<style>
body {
  /* Добавляет отступ сверху, равный высоте статус-бара/челки */
  padding-top: env(safe-area-inset-top);
  /* На всякий случай для низа (где полоска жестов) */
  padding-bottom: env(safe-area-inset-bottom);
  /* Для боковых вырезов в альбомной ориентации */
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>
