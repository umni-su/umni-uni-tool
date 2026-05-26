<script>

import HistoryChartItem from "@/components/chunks/HistoryChartItem.vue";

export default {
  name: "OneWirePanel",
  components: {HistoryChartItem},
  data() {
    return {
      mode: 'onewire',
      handler: null,
      state: []
    }
  },
  computed: {
    conf(){
      return this.$store.getters['getOneWireConf']
    },
    allData(){
      return this.conf?.map(c=>{
        c.history = this.state?.find(s => s.serial === c.serial)?.history
        return c
      })
    },
    lastMessage(){
      return this.$store.getters['lastMessagePayload']
    },
  },
  watch: {
    lastMessage(v){
      if(v?.data?.capability === 'onewire'){
        const sn = v?.data?.serial
        const ts = v?.data?.timestamp
        const val = v?.data?.value
        this.state = this.state?.map(state => {
          if(state.serial === sn){
            state.history.timestamps.shift()
            state.history.timestamps.push(ts)
            state.history.values.shift()
            state.history.values.push(val)
          }
          return state
        })
      }
    }
  },
  async mounted() {
    await this.getConf()
    await this.getState()
  },
  methods: {
    async getState(){
      const res = await this.$store.dispatch('getState',this.mode)
      if(res?.success){
        this.state = res.data.state
      }
    },
    async getConf(){
      await this.$store.dispatch('getOneWireConf')
    }
  }
}
</script>

<template>
  <VWindowItem
    value="1wire"
    class="fill-height"
  >
    <VCard
      ref="card"
      class="fill-height"
    >
      <template #title>
        {{ $t('1-wire sensors') }}
      </template>
      <template #text>
        <VSheet>
          <VContainer fluid>
            <VRow>
              <VCol
                v-for="item in allData"
                :key="item.serial"
                cols="12"
                md="6"
              >
                <HistoryChartItem
                  v-if="item.history"
                  variant="tonal"
                  :label="item.label"
                  :history="item.history"
                  color="secondary"
                >
                  <template #append>
                    <VBtn
                      color="secondary"
                      icon="mdi-pencil"
                      variant="tonal"
                      rounded="pill"
                      density="comfortable"
                    />
                  </template>
                </HistoryChartItem>
              </VCol>
            </VRow>
          </VContainer>
        </VSheet>
      </template>
    </VCard>
  </vwindowitem>
</template>

<style scoped lang="scss">

</style>
