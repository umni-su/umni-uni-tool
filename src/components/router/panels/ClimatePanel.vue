<script>
import BoilerErrorFlags from "@/components/chunks/BoilerError.vue";
import DebugCard from "@/components/chunks/DebugCard.vue";
import FeatureCard from "@/components/chunks/FeatureCard.vue";

import debounce from "@/helpers/debounce.js";

export default {
  name: "ClimatePanel",
  components: {FeatureCard, DebugCard, BoilerErrorFlags},
  data() {
    return {
      dbFn: null,
      firstRun: true,
      loading: false,
      values: {
        en: false,
        ch_en: false,
        ch_sp: null,
        dhw_en: false,
        dhw_sp: null,
        ch2_en: false,
        cool_en: false,
        mod: null,
        otc_en: false
      }
    }
  },
  computed: {
    interval() {
      return this.$store.getters['getRefreshInterval']
    },
    state() {
      return this.$store.getters['getOpenThermData']
    },
    enabled(){
      return this.state?.en
    },
    ready() {
      return this.state?.ready
    },
    adapterSuccess(){
      return this.state?.adapter_success
    },
    boilerConfig(){
      return this.state?.boiler_config
    },
    ch2Present(){
      return this.boilerConfig?.ch2_present
    },
    controlType(){
      return this.boilerConfig?.control_type
    },
    dhwConfig(){
      return this.boilerConfig?.dhw_config
    },
    coolingSupported(){
      return this.boilerConfig?.cooling_supported
    },
    dhwPresent(){
      return this.boilerConfig?.dhw_present
    },
    pumpControlAllowed(){
      return this.boilerConfig?.pump_control_allowed
    },
    slaveOtVersion(){
      return this.boilerConfig?.slave_ot_version
    },
    slaveProductVersion(){
      return this.boilerConfig?.slave_product_version
    },
    supportedFeatures(){
      return this.state?.supported_features
    },
    dhwFeature(){
      return this.supportedFeatures?.dhw_present
    },
    flowRateFeature(){
      return this.supportedFeatures?.flow_rate
    },
    heatCurveReadFeature(){
      return this.supportedFeatures?.heat_curve_read
    },
    heatCurveWriteFeature(){
      return this.supportedFeatures?.heat_curve_write
    },
    modulationLevel(){
      return this.state?.modulation
    },
    outsideTemperature(){
      return this.state?.outside_temperature
    },
    modulatingFeature(){
      return this.supportedFeatures?.modulating || this.modulationReadFeature || this.modulationWriteFeature
    },
    modulationReadFeature(){
      return this.supportedFeatures?.modulation_read
    },
    modulationWriteFeature(){
      return this.supportedFeatures?.modulation_write
    },
    outsideTemperatureFeature(){
      return this.supportedFeatures?.outside_temperature
    },
    pressureFeature(){
      return this.supportedFeatures?.pressure
    },
    returnTemperatureFeature(){
      return this.supportedFeatures?.return_temperature
    },
    bounds(){
      return this.state.bounds
    },
    boundsCh(){
      return this.state.bounds.ch
    },
    boundsDhw(){
      return this.state.bounds.ch
    },
    boundsHcr(){
      return this.state.bounds.ch
    },
    chEnabled(){
      return this.state.ch_en
    },
    chActive(){
      return this.state.ch_active
    },
    dhwEnabled(){
      return this.state.dhw_en
    },
    otcEnabled(){
      return this.state.otc_en
    },
    dhwActive(){
      return this.state.dhw_active
    },
    flameOn(){
      return this.state.flame_on
    },
    chSetpoint(){
      return this.state.ch_sp
    },
    dhwSetpoint(){
      return this.state.dhw_sp
    },
    returnTemperature(){
      return this.state.return_temperature
    }
  },
  watch: {
    async interval() {
      clearInterval(this.handler)
    },
    values:{
      deep: true,
      handler() {
        this.dbFn()
      }
    }
  },
  async created() {
    await this.getState()
    this.values.dhw_sp = this.dhwSetpoint
    this.values.ch_sp = this.chSetpoint
    this.values.ch_en = this.chEnabled
    this.values.dhw_en = this.dhwEnabled
    this.values.otc_en = this.otcEnabled
    this.values.en = this.enabled
    this.values.mod = this.state?.mod
    this.dbFn = debounce(this.onValuesChanged, 800)

  },
  unmounted() {
    clearInterval(this.handler)
  },
  methods: {
    async getState() {
      this.loading = true
      await this.$store.dispatch('getOpenThermState').finally(()=>{
        this.loading = false
      })
    },
    async onValuesChanged(){
      if(this.firstRun){
        this.firstRun = false
        return false
      }
      const res = await this.$store.dispatch('saveSetting', {
        setting: 'opentherm',
        values: this.values,
      })
      if(res){

      }
    }
  }
}
</script>

<template>
  <VWindowItem
    value="opentherm"
  >
    <VContainer
      v-if="state"
      class="pa-0"
      color="transparent"
    >
      <VRow>
        <VCol
          cols="12"
          sm="6"
        >
          <VCard class="fill-height">
            <template #title>
              {{ $t('Status') }}
            </template>
            <template #append>
              <VChip
                rounded="pill"
                :color="adapterSuccess ? 'success' : 'error'"
              >
                {{ adapterSuccess ? $t('Communication established') : $t('Communication failed') }}
              </vchip>
            </template>
            <template #text>
              <VList
                selectable
                slim
                density="compact"
              >
                <VListItem :subtitle="$t('Slave OpenTherm version')">
                  <template #append>
                    {{ slaveOtVersion }}
                  </template>
                </VListItem>
                <VListItem :subtitle="$t('Slave version')">
                  <template #append>
                    {{ slaveProductVersion }}
                  </template>
                </VListItem>
                <VListItem :subtitle="$t('Control type')">
                  <template #append>
                    {{ controlType }}
                  </template>
                </VListItem>
                <VListItem :subtitle="$t('Hot water type')">
                  <template #append>
                    {{ dhwConfig }}
                  </template>
                </VListItem>
                <VListItem :subtitle="$t('Pump control')">
                  <template #append>
                    {{ pumpControlAllowed }}
                  </template>
                </VListItem>
                <VListItem
                  v-if="modulationReadFeature"
                  :subtitle="$t('Modulation')"
                >
                  <template #append>
                    {{ modulationLevel }}
                  </template>
                </VListItem>
                <VListItem
                  v-if="outsideTemperatureFeature"
                  :subtitle="$t('Outside temperature')"
                >
                  <template #append>
                    {{ outsideTemperature }}
                  </template>
                </VListItem>
              </VList>
            </template>
            <template #actions>
              <VBtn
                prepend-icon="mdi-refresh"
                :text="$t('Refresh')"
                :disabled="loading"
                :loading="loading"
                @click="getState"
              />
            </template>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <VCard class="fill-height">
            <template #title>
              {{ $t('Boiler information') }}
              <div class="text-body-small text-secondary">
                {{ $t('Available features') }}
              </div>
            </template>

            <template #append>
              <VBtn
                v-tooltip="flameOn? $t('The flame is on') : $t('The flame is off')"
                variant="tonal"
                rounded="pill"
                :color="flameOn ? 'orange' : 'default'"
                :icon="flameOn ? 'mdi-fire' : 'mdi-fire-off'"
              />
            </template>

            <VCardText class="mx-n1">
              <VSwitch
                v-model="values.en"
                class="mx-2"
                color="success"
                :true-value="true"
                :false-value="false"
                :label="values.en ? $t('Disable') : $t('Enable')"
              />

              <FeatureCard
                :title="$t('Domestic hot water')"
                :enabled="dhwFeature"
              />
              <FeatureCard
                :title="$t('Flow rate')"
                :enabled="flowRateFeature"
              />
              <FeatureCard
                :title="$t('Modulation')"
                :enabled="modulatingFeature"
              />
              <FeatureCard
                :title="$t('Heat curve')"
                :enabled="heatCurveReadFeature"
              />
              <FeatureCard
                :title="$t('Outside temperature')"
                :enabled="outsideTemperatureFeature"
              />
              <FeatureCard
                :title="$t('Return temperature')"
                :enabled="returnTemperatureFeature"
              />
              <VSwitch
                v-model="values.otc_en"
                class="mt-4"
                color="primary"
                :label="$t('Outside temperature compensation')"
              />
            </VCardText>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="12"
        >
          <VCard>
            <template #subtitle>
              {{ $t('Heating temperature') }}
            </template>
            <template #text>
              <VSlider
                v-model="values.ch_sp"
                :step="1"
                :thumb-size="28"
                :track-size="6"
                :min="boundsCh.min"
                :max="boundsCh.max"
                :color="values.ch_en ? 'orange' : 'secondary'"
              >
                <template #prepend>
                  <VBtn
                    size="large"
                    variant="tonal"
                    class="mr-4"
                    rounded="pill"
                    :color="values.ch_en ? 'orange' : 'secondary'"
                    :icon="values.ch_en ? 'mdi-fire' :'mdi-fire-off'"
                    @click="values.ch_en = !values.ch_en"
                  />
                </template>
                <template #append>
                  <VSheet
                    width="90"
                    class="text-right text-secondary font-weight-black pa-4 text-headline-medium"
                  >
                    {{ values.ch_sp }}
                  </VSheet>
                </template>
              </VSlider>
            </template>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="12"
        >
          <VCard>
            <template #subtitle>
              {{ $t('Hot water temperature') }}
            </template>
            <template #text>
              <VSlider
                v-model="values.dhw_sp "
                :step="1"
                :thumb-size="28"
                :track-size="6"
                :min="boundsDhw.min"
                :max="boundsDhw.max"
                :color="values.dhw_en ? 'primary' : 'secondary'"
              >
                <template #prepend>
                  <VBtn
                    v-model="values.dhw_en"
                    size="large"
                    variant="tonal"
                    class="mr-4"
                    rounded="pill"
                    :color="values.dhw_en ? 'primary' : 'secondary'"
                    :icon="values.dhw_en ? 'mdi-water' :'mdi-water-off'"
                    @click="values.dhw_en = !values.dhw_en"
                  />
                </template>
                <template #append>
                  <VSheet
                    width="90"
                    class="text-right text-secondary font-weight-black pa-4 text-headline-medium"
                  >
                    {{ values.dhw_sp }}
                  </VSheet>
                </template>
              </VSlider>
            </template>
          </VCard>
        </VCol>
        <VCol
          cols="12"
          sm="12"
        >
          <VCard>
            <template #subtitle>
              {{ $t('Maximum modulation level') }}
            </template>
            <template #text>
              <VSlider
                v-model="values.mod"
                :step="1"
                :thumb-size="28"
                :track-size="6"
                :min="0"
                :max="100"
                :color="values.mod ? 'green' : 'secondary'"
              >
                <template #prepend>
                  <VBtn
                    v-model="values.dhw_en"
                    readonly
                    size="large"
                    variant="tonal"
                    class="mr-4"
                    rounded="pill"
                    :color="values.mod > 0 ? 'green' : 'secondary'"
                    icon="mdi-candle"
                  />
                </template>
                <template #append>
                  <VSheet
                    width="90"
                    class="text-right text-secondary font-weight-black pa-4 text-headline-medium"
                  >
                    {{ values.mod === null ? 0 : values.mod }}
                  </VSheet>
                </template>
              </VSlider>
            </template>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
    <DebugCard>
      {{ state }}
    </DebugCard>
  </VWindowItem>
</template>

<style scoped>
</style>
