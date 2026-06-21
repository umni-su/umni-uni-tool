<script>
import {invoke} from "@tauri-apps/api/core";

export default {
  name: "RebootPage",
  emits: ['start-scan'],
  data: function() {
    return {
      handler:null,
      maxRetries: 10,
      reties:0,
    }
  },
  computed:{
    isReboot(){
      return this.$store.getters['isReboot'];
    },
    devices(){
      return this.$store.getters['getDevices']
    },
    activeDevice(){
      return this.$store.getters['getActiveDevice'];
    },
    onlineDevice(){
      return this.devices.find(device=>{
        return device.hostname === this.activeDevice.hostname
      })
    }
  },
  watch:{
    reties(v){
      if (v === this.maxRetries){
        clearInterval(this.handler);
      }
    },
    onlineDevice:{
      deep: true,
      async handler(device){
        if(device && device?.hostname){
          clearInterval(this.handler)
          this.$store.commit('setReboot', false)
          this.$store.dispatch('closeSSE')
          await this.$store.dispatch('initSSE')
        }
      }
    }
  },
  mounted() {
    this.ping()
  },
  methods:{
    ping(){
        this.handler = setInterval(async () => {
          try {
            await invoke('start_mdns_discovery')
            if(this.reties <= this.maxRetries){
              this.reties +=1
            }
          } catch (err) {
            console.error("Ошибка mDNS:", err);
          }

        }, 5000)
    }
  }
}
</script>

<template>
  <VEmptyState
    v-if="isReboot"
    :headline="$t('The device is rebooting')"
    :text="$t('This usually happens very quickly, so you don\'t need to be patient')"
  >
    <template #media>
      <VProgressCircular
        class="mb-4"
        color="primary"
        :size="64"
        indeterminate
      />
    </template>
  </VEmptyState>
</template>

<style scoped lang="scss">

</style>
