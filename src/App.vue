<script>
import {isPermissionGranted, requestPermission, sendNotification} from '@tauri-apps/plugin-notification';

import LoginPage from "@/components/pages/LoginPage.vue";
import InstallPage from "@/components/pages/InstallPage.vue";
import DefaultPage from "@/components/pages/DefaultPage.vue";
import AppNotifications from "@/components/chunks/AppNotifications.vue";
import RebootPage from "@/components/pages/RebootPage.vue";
export default {
  name: 'App',
  components: {
    RebootPage,
    AppNotifications,
    DefaultPage,
    InstallPage,
    LoginPage
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    authenticated() {
      return true
    },
    installed() {
      return true
    },
    theme() {
      return this.$store.getters['getTheme']
    }
  },
  async mounted() {
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
  created() {
    this.visible = true
  },
  methods: {

  }
}
</script>

<template>
  <VApp
    v-if="visible"
    :theme="theme"
  >
    <LoginPage v-if="installed && !authenticated" />
    <InstallPage v-else-if="!installed" />
    <DefaultPage v-else-if="installed && authenticated" />
    <AppNotifications />
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
