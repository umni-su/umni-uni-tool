<script>
import RfSensorItem from "@/components/chunks/RfSensorItem.vue";
import RfSensorTypeSelect from "@/components/chunks/RfSensorTypeSelect.vue";
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import RfSensorState from "@/components/chunks/RfSensorState.vue";

export default {
  name: "RfPanel",
  components: {RfSensorState, ModalDialog, RfSensorTypeSelect, RfSensorItem},
  data() {
    return {
      message: null,
      founded: false,
      scanHandler: null,
      totalScanSeconds: 15,
      showScan: false,
      scanList: []
    }
  },
  computed: {
    state() {
      return this.$store.getters['getRf433Conf']
    },
    lastMessage() {
      return this.$store.getters['lastMessage']
    },
    progress(){
      return this.totalScanSeconds * 100 / 15
    }
  },
  watch: {
    lastMessage:{
      deep: true,
      handler(v) {
        if(v?.data?.event === "rf433_scan"){
          const existing = this.scanList.findIndex(d=>{
            return d.identifier === v.data.data.identifier
          })
          if(existing > -1){
            this.scanList[existing] = v.data.data
          } else {
            this.scanList.push(v.data.data)
          }
        }
      }
    }
  },
  async created() {
    await this.getState()
  },
  unmounted() {
  },
  methods: {
    async getState() {
      await this.$store.dispatch('getRf433Conf')
    },
    addSensor(sensor){
      this.$store.commit('addRf433Sensor', sensor)
    },
    async scanRfSensors(){
      this.scanList = []
      this.showScan = true
      const res = await this.$store.dispatch('setScanModeRf433', true)
      if(res){
        this.scanHandler = setInterval(() => {
          if(this.totalScanSeconds === 0){
            clearInterval(this.scanHandler)
            this.scanHandler = null
            this.totalScanSeconds = 15
          } else {
            this.totalScanSeconds --
          }

        },1000)
      }
    }
  }
}
</script>

<template>
  <VWindowItem
    value="rf"
    class="fill-height"
  >
    <VSheet
      v-if="state && state.length > 0"
      height="100%"
      class="elevation-2 pa-4"
    >
      <VContainer class="pa-0">
        <VRow>
          <VCol>
            <!--            <RfSensorTypeSelect-->
            <!--              prepend-icon="mdi-filter"-->
            <!--              width="300"-->
            <!--            />-->
            <VBtn
              color="primary"
              prepend-icon="mdi-plus"
              :text="$t('Add wireless sensor')"
              @click="scanRfSensors"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            v-for="sensor in state"
            :key="sensor.serial"
            cols="12"
            md="4"
            sm="6"
          >
            <RfSensorItem
              :sensor="sensor"
            />
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>
    <VEmptyState
      v-else
      icon="mdi-access-point"
    >
      <template #title>
        {{ $t('Empty') }}
      </template>
      <template #text>
        {{ $t('You have not added any wireless sensors') }}
      </template>
      <template #actions>
        <VBtn
          color="primary"
          prepend-icon="mdi-plus"
          :text="$t('Add wireless sensor')"
          @click="scanRfSensors"
        />
      </template>
    </VEmptyState>
    <ModalDialog
      v-model="showScan"
      :title="$t('Scan devices')"
    >
      <VEmptyState v-if="scanHandler">
        <template #text>
          <div class="opacity-50 mt-4">
            {{ $t('Make the sensor triggers, then press the scan button') }}
          </div>
          <VDivider class="my-4" />
        </template>
        <template #media>
          <VProgressCircular
            :model-value="progress"
            :size="64"
            color="primary"
          >
            <template #default>
              {{ totalScanSeconds }}
            </template>
          </VProgressCircular>
        </template>
      </VEmptyState>
      <VSheet v-if="scanList.length > 0">
        <VList>
          <VListItem
            v-for="sensor in scanList"
            :key="sensor"
          >
            <VListItemSubtitle>
              {{ $moment(sensor.timestamp).fromNow() }}
            </VListItemSubtitle>
            <VListItemTitle>{{ sensor.serial }}</VListItemTitle>
            <template #append>
              <RfSensorState :state="sensor.value" />
              <VBtn
                class="ml-2"
                density="comfortable"
                color="default"
                rounded="pill"
                icon="mdi-plus"
                variant="text"
                @click="addSensor(sensor)"
              />
            </template>
          </VListItem>
        </VList>
      </VSheet>
      <template #actions>
        <VSheet class="w-100 text-center">
          <VBtn
            :disabled="scanHandler !== null"
            :loading="scanHandler !== null"
            color="primary"
            prepend-icon="mdi-sync"
            :text="$t('Scan')"
            @click="scanRfSensors"
          />
        </VSheet>
      </template>
    </ModalDialog>
  </VWindowItem>
</template>

<style scoped lang="scss">

</style>
