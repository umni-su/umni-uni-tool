<script>
import {markRaw} from "vue";
import * as echarts from 'echarts';
import RealTimeGraphNotification from "@/components/chunks/RealTimeGraphNotification.vue";
import NtcConf from "@/components/chunks/NtcConf.vue";
import AdcConf from "@/components/chunks/AdcConf.vue";

export default {
  name: "AnalogSensors",
  components: {
    AdcConf,
    NtcConf,
    RealTimeGraphNotification
  },
  data() {
    return {
      data: null,
      handler: null,
      ntcChart: null,
      aiChart: null,
      loaded: false,
    }
  },
  computed: {
    ai1() {
      return this.$store.getters.getState('ai1')
    },
    ai2() {
      return this.$store.getters.getState('ai2')
    },
    hasNtc1(){
      return this.$store.getters['hasNtc1']
    },
    hasNtc2(){
      return this.$store.getters['hasNtc2']
    },
    hasAi1(){
      return this.$store.getters['hasAi1']
    },
    hasAi2(){
      return this.$store.getters['hasAi2']
    },
    aiConf(){
      return this.$store.getters['getAdcConf']
    }
  },
  watch: {

  },
  async mounted() {
    await this.getNtcConfig()
    await this.getAiConfig()
    await this.getState()
    this.handler = setInterval(async () => {
      await this.getState()
    }, 60000)
  },
  unmounted() {
    clearInterval(this.handler)
  },
  methods: {
    async getNtcConfig(){
      await this.$store.dispatch('getNtcConf')
    },
    async getAiConfig(){
      await this.$store.dispatch('getAdcConf')
    },
    async getState(){
      const actions = [];

      if (this.hasNtc1) actions.push('ntc1');
      if (this.hasNtc2) actions.push('ntc2');
      if (this.hasAi1) actions.push('ai1');
      if (this.hasAi2) actions.push('ai2');

      // Выполнить все
      for (let i = 0; i < actions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.$store.dispatch('getState', actions[i]);
      }
      this.loaded = true
    }
  }
}
</script>

<template>
  <VWindowItem
    class="fill-height"
    value="analog"
  >
    <VSheet
      v-if="loaded"
      elevation="2"
      class="fill-height"
    >
      <NtcConf />
      <AdcConf />
    </VSheet>
    <VEmptyState v-else>
      <VProgressCircular
        indeterminate
        color="primary"
        :size="64"
      />
    </VEmptyState>
  </VWindowItem>
</template>

<style scoped>

</style>
