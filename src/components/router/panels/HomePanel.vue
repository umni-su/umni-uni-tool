<script>
import DeviceInformationWidget from "@/components/chunks/widgets/DeviceInformationWidget.vue";
import NetworkInfoWidget from "@/components/chunks/widgets/NetworkInfoWidget.vue";
import SystemInfoWidget from "@/components/chunks/widgets/SystemInfoWidget.vue";
import UsefulWidget from "@/components/chunks/widgets/UsefulWidget.vue";

export default {
  name: "HomePanel",
  components: {UsefulWidget, SystemInfoWidget, NetworkInfoWidget, DeviceInformationWidget},
  data() {
    return {
      data: null,
      handler: null
    }
  },
  computed: {
    sysinfo() {
      return this.$store.getters['getSystemInfo']
    },
    interval() {
      return this.$store.getters['getRefreshInterval']
    }
  },
  watch: {
    async interval() {
      clearInterval(this.handler)
      this.handler = setInterval(async () => {
        await this.getSystemInfo()
      }, this.interval)
      await this.getSystemInfo()
    }
  },
  async mounted() {
    this.handler = setInterval(async () => {
      await this.getSystemInfo()
    }, this.interval)
    await this.getSystemInfo()
  },
  unmounted() {
    clearInterval(this.handler)
  },
  methods: {
    async getSystemInfo() {
      await this.$store.dispatch('getSystemInfo')
    }
  }
}
</script>

<template>
  <VWindowItem
    class="fill-height"
    value="home"
  >
    <VSheet
      v-if="sysinfo"
      class="fill-height"
      color="transparent"
    >
      <VContainer
        class="fill-height pa-0"
        fluid
      >
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <DeviceInformationWidget />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <UsefulWidget />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <NetworkInfoWidget />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <SystemInfoWidget />
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>
  </VWindowItem>
</template>

<style scoped>

</style>
