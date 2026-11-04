<script>
import UmniLogo from "../chunks/UmniLogo.vue";
import ThemeSwitcher from "../chunks/ThemeSwitcher.vue";
import AppLoader from "../chunks/widgets/AppLoader.vue";
import NavigationPanel from "@/components/chunks/NavigationPanel.vue";
import RebootPage from "@/components/pages/RebootPage.vue";
import DebugSwitcher from "@/components/chunks/DebugSwitcher.vue";
import BottomMenu from "@/components/chunks/BottomMenu.vue";


export default {
  name: "DefaultPage",
  components: {
    BottomMenu,
    DebugSwitcher,
    RebootPage, NavigationPanel, ThemeSwitcher, UmniLogo, AppLoader},
  data(){
    return {
      bottom: true,
      opened: false,
      loading: false,
    }
  },
  computed: {

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

  },
  created(){
    this.$moment.locale(this.$i18n.locale);
  },

  async beforeMount() {
    const pack = await import('../../../package.json')
    this.$store.commit('setVersion', pack.version)
  },
  methods: {
    async getSystemInfo() {
      await this.$store.dispatch('getSystemInfo')
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
          />
        </VAppBarNavIcon>
        <VBtn
          v-if="mobile"
          prepend-icon="mdi-chip"
          :text="activeDevice.title"
          color="default"
          density="comfortable"
          variant="plain"
          @click="$store.commit('setBottomNav', true)"
        />
      </template>
      <template #title>
        <div
          v-if="hasDevice"
          class="text-center"
        >
          <VBtn
            v-if="!mobile"
            prepend-icon="mdi-chip"
            :text="titleText"
            color="default"
            density="comfortable"
            variant="tonal"
            @click="$store.commit('setBottomNav', true)"
          />
        </div>
      </template>
      <template #append>
        <VIcon
          v-if="systemInfo?.token !== null"
          v-tooltip="$t('The device is protected by a token')"
          class="opacity-70"
          icon="mdi-shield-check"
        />
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
    </VMain>
    <BottomMenu />
  </VSheet>
</template>

<style scoped>
.safe {
  padding-top: env(safe-area-inset-top);
}
</style>
