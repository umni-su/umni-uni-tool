<script>
import ModalDialog from "@/components/chunks/ModalDialog.vue";

export default {
  name: "NtcConfCard",
  components: {ModalDialog},
  props: {
    ntc:{
      type:Object,
      default:null
    },
    index: {
      type:Number,
      default:null
    }
  },
  data(){
    return {
      edit:false,
      sensor: null
    }
  },
  computed: {
    channelData(){
      return this.$store.getters.getState(`ntc${this.index}`)
    },
    temp(){
      return this.channelData?.value?.toFixed(1)
    },
    values(){
      return this.channelData?.history?.values
    },
    color(){
      const temp = parseFloat(this.temp)
      if (temp < 0){
        return 'blue'
      }
      else if (temp > 0 && temp <= 17){
        return 'secondary'
      } else if (temp <= 18 && temp <= 25){
        return 'green'
      } else {
        return 'red'
      }
    }
  },
  methods:{
    editNtc(v){
      this.edit = true
      this.sensor = {...{offset:0}, ...v}
    },
    async saveChannel(){
      const res = await this.$store.dispatch('saveSetting',{
        setting: 'ntc',
        values:{
          channel: this.ntc.id,
          active:this.sensor.active,
          offset: this.sensor.offset ?? 0.0,
          label: this.sensor.label
        }
      })
      if(res){
        this.$store.commit('success', this.$t('Saved'))
      } else {
        this.$store.commit('error', this.$t('Error'))
      }
    }
  }
}
</script>

<template>
  <VCard
    hover
    variant="text"
    :title="ntc.label"
    :subtitle="`#ntc${index}`"
    @click="editNtc(ntc)"
  >
    <template #prepend>
      <VIcon
        :color="color"
        class="opacity-50"
        :size="64"
        icon="mdi-thermometer"
      />
    </template>
    <template #append>
      <div class="text-headline-large font-weight-black">
        {{ temp }} <VIcon
          :size="24"
          icon="mdi-temperature-celsius"
        />
      </div>
    </template>
    <template #text>
      <VSparkline
        v-model="values"
        type="trend"
        line-width="2"
        color="secondary"
        auto-draw
        smooth
      />
    </template>
    <ModalDialog v-model="edit">
      <VTextField
        v-model="sensor.label"
        :label="$t('Name')"
      />
      <VSlider
        v-model="sensor.offset"
        class="mt-4"
        color="primary"
        :min="-10"
        :max="10"
        :step="0.1"
        :label="$t('Calibration')"
      >
        <template #append>
          <VBtn
            variant="text"
            readonly
            width="70"
            :text="sensor.offset"
          />
        </template>
      </VSlider>
      <VSwitch
        v-model="sensor.active"
        color="primary"
        :label="$t('Active')"
      />
      <template #actions>
        <VBtn
          :text="$t('Save')"
          prepend-icon="mdi-content-save"
          @click="saveChannel"
        />
      </template>
    </ModalDialog>
  </VCard>
</template>

<style scoped lang="scss">

</style>
