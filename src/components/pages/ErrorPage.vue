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
    async getSystemnfo(){
      await this.$store.commit('setActiveDevice', this.activeDevice)
    }
  }

}
</script>

<template>
  <VSheet
    color="primary"
    rounded="0"
    width="100%"
    height="100%"
    class="d-flex align-center justify-center"
  >
    <VSheet
      class="pa-6 text-center"
      color="transparent"
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
          class="text-headline-medium font-weight-bold"
        >
          {{ activeDevice.title.toUpperCase() }}
        </div>
        <div>
          <VBtn
            class="mt-4"
            prepend-icon="mdi-reload"
            :text="$t('Refresh')"
            @click="getSystemnfo"
          />
        </div>
        <div
          class="text-body-medium py-6 mb-6 opacity-70"
        >
          {{ $t('Connection to device failed') }}
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
  </VSheet>
</template>

<style scoped>
</style>
