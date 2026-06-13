<script>

import HistoryChartItem from "@/components/chunks/HistoryChartItem.vue";
import ModalDialog from "@/components/chunks/ModalDialog.vue";

export default {
  name: "OneWirePanel",
  components: {ModalDialog, HistoryChartItem},
  data() {
    return {
      edit: false,
      sensor: false,
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
    openEdit(v){
      this.sensor = v
      this.edit = true
    },
    async getState(){
      const res = await this.$store.dispatch('getState',this.mode)
      if(res?.success){
        this.state = res.data.state
      }
    },
    async getConf(){
      await this.$store.dispatch('getOneWireConf')
    },
    async saveSensor(){
      try {
        const res = await this.$store.dispatch('saveSetting',{
          setting: this.mode,
          values: this.sensor,
        })
        if(res){
          this.edit = false
          this.$store.commit('success', this.$t('Saved'))
          this.sensor = null
        }
      } catch (error) {
        this.$store.commit('error', error.message)
      }
    },
    async copySerial(serial){
      await navigator.clipboard.writeText(serial)
        .catch( () => {
          this.$store.commit('error',this.$t('Error'))
          }
        )
        this.$store.commit('success',this.$t('Copied'))
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
                      @click="openEdit(item)"
                    />
                  </template>
                  <template #actions>
                    <VSheet
                      width="100%"
                      class="text-right"
                    >
                      <VBtn
                        variant="plain"
                        color="default"
                        size="small"
                        prepend-icon="mdi-content-copy"
                        @click="copySerial(item.serial)"
                      >
                        {{ item.serial }}
                      </VBtn>
                    </VSheet>
                  </template>
                </HistoryChartItem>
              </VCol>
            </VRow>
          </VContainer>
        </VSheet>
      </template>
    </VCard>
    <ModalDialog
      v-model="edit"
      :title="sensor?.label"
    >
      <VForm v-if="sensor">
        <VTextField
          v-model="sensor.label"
          :label="$t('Name')"
          class="mb-4"
        />
        <VSlider
          v-model="sensor.calibration"
          color="primary"
          class="mb-4"
          :label="$t('Calibration')"
          :min="-10"
          :max="10"
          :step="0.1"
        >
          <template #append>
            {{ sensor.calibration }}
          </template>
        </VSlider>
        <VSwitch
          v-model="sensor.active"
          color="primary"
          :true-value="true"
          :false-value="false"
          :label="$t('Active')"
        />
      </VForm>
      <template #actions>
        <VBtn
          :text="$t('Save')"
          prepend-icon="mdi-content-save"
          @click="saveSensor"
        />
      </template>
    </ModalDialog>
  </vwindowitem>
</template>

<style scoped lang="scss">

</style>
