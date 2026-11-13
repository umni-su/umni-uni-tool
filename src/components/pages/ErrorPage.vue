<script>
import UmniLogo from "@/components/chunks/UmniLogo.vue";

export default {
  name: "ErrorPage",
  components: {UmniLogo},
  computed: {
    devices() {
      return this.$store.getters['getDevices']
    },
    activeDevice() {
      return this.devices.find(device => device.active)
    },
  },
  methods: {
    async getSystemInfo(){
      await this.$store.commit('setActiveDevice', this.activeDevice)
    }
  }

}
</script>

<template>
  <VApp
    color="primary"
    rounded="0"
  >
    <VSheet
      class="d-flex flex-wrap align-center justify-center flex-column pa-6 text-center fill-height"
      color="primary"
    >
      <UmniLogo
        color="white"
        :width="150"
        :height="150"
        short
        class="opacity-70 mx-auto"
      />
      <div class="text-center">
        <div
          v-if="activeDevice"
          class="text-headline-medium font-weight-bold mt-2"
        >
          {{ activeDevice?.title ? activeDevice?.title?.toUpperCase() : activeDevice.hostname }}
        </div>
        <div>
          <VBtn
            class="mt-4"
            prepend-icon="mdi-reload"
            :text="$t('Refresh')"
            @click="getSystemInfo"
          />
        </div>
        <div
          class="text-body-medium py-6 mb-6 opacity-70"
        >
          {{ $t('Connection to device failed') }}
        </div>
        <div
          class="text-body-medium py-6 mb-6 opacity-70"
        >
          <VSheet>
            <code>{{ activeDevice }}</code>
          </VSheet>
        </div>
        <VBtn
          :text="$t('Scan devices')"
          color="green"
          class="mx-auto"
          variant="flat"
          prepend-icon="mdi-swap-horizontal"
          density="comfortable"
          @click="$store.commit('setScanMode', true)"
        />
      </div>
    </VSheet>
  </VApp>
</template>

<style scoped>
</style>
