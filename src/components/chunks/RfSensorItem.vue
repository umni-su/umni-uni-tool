<script>
import RfSensorState from "@/components/chunks/RfSensorState.vue";
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import RfSensorTypeSelect from "@/components/chunks/RfSensorTypeSelect.vue";

export default {
  name: "RfSensorItem",
  components: {RfSensorTypeSelect, ModalDialog, RfSensorState},
  props: {
    sensor: {
      type: Object,
      required: true
    }
  },
  emits: ['on-sensor-saved'],
  data(){
    return {
      showEdit: false,
      sensorCopy: null
    }
  },
  computed: {
    lastMessage(){
      return this.$store.getters['lastMessage']
    },
    // 1 - movement sensor
    // 2 - door sensor
    // 3 - water leak sensor
    // 4 - buttons (remote controller with buttons)
    // 5 - smoke
    // 20 - other
    typeString() {
      switch (this.sensor.type) {
        case 1:
          return this.$t('Motion sensor')
        case 2:
          return this.$t('Door opening sensor')
        case 3:
          return this.$t('Water leak sensor')
        case 4:
          return this.$t('Remote controller')
        case 5:
          return this.$t('Smoke sensor')
        default:
          return this.$t('Other')
      }
    },
    icon() {
      switch (this.sensor.type) {
        case 1:
          return 'mdi-motion-sensor'
        case 2:
          return 'mdi-door-closed-lock'
        case 3:
          return 'mdi-water-alert'
        case 4:
          return 'mdi-remote'
        case 5:
          return 'mdi-smoke-detector-variant'
        default:
          return 'mdi-help'
      }
    }
  },
  watch:{
    lastMessage: {
      deep: true,
      handler(v) {
        if(v?.data?.data.capability === 'rf433'){
          const newState = v?.data?.data?.value ?? 0
          this.$store.commit('addRf433Sensor', {
            serial: v?.data?.data?.serial ,
            value: newState
          })
        }
      }
    }
  },
  methods: {
    openEdit(){
      this.showEdit = true
      this.sensorCopy = this.sensor
    },
    async saveSensor(){
      const res = await this.$store.dispatch('saveSetting' ,{
        setting: 'rf433',
        values:{
          serial:parseInt(this.sensor.serial, 16),
          label:this.sensor.label,
          type:this.sensor.type,
          alarm:this.sensor.alarm
        }
      })
      if(res){
        this.$emit('on-sensor-saved', this.sensor)
        this.$store.commit('addRf433Sensor', {
          serial:this.sensor.serial,
          label:this.sensor.label,
          type:this.sensor.type,
          alarm:this.sensor.alarm,
          value:this.sensor.value,
        })
        this.$store.commit('success', this.$t('Saved'))
      }
    }
  }
}
</script>

<template>
  <VCard
    hover
    @click="openEdit"
  >
    <template #append>
      <VBtn
        readonly
        density="compact"
        variant="text"
        color="secondary"
        :icon="icon"
      />

      <VBtn
        v-if="!sensor.new"
        density="compact"
        variant="text"
        :icon="sensor.alarm ? 'mdi-bell' : 'mdi-bell-off'"
        :color="sensor.alarm ? 'orange' : 'secondary'"
      />
    </template>
    <template #title>
      <VChip
        v-if="sensor.new"
        :text="$t('Unsaved')"
        size="small"
        color="yellow-darken-2"
        rounded="pill"
      />{{ sensor.label }}
    </template>
    <template #subtitle>
      <div>
        {{ typeString }}
      </div>
      <VBtn
        readonly
        size="small"
        rounded="pill"
        variant="tonal"
        density="compact"
        class="mr-2"
        :text="sensor.serial.toString(16)"
      />
    </template>
    <template #text>
      <RfSensorState :state="sensor.value" />
      <ModalDialog
        v-model="showEdit"
        :title="sensor.serial"
      >
        <VTextField
          v-model="sensorCopy.label"
          :label="$t('Name')"
        />
        <RfSensorTypeSelect
          v-model="sensorCopy.type"
          class="mt-4"
        />
        <VSwitch
          v-model="sensorCopy.alarm"
          color="primary"
          :label="$t('Alarm mode')"
        />
        <template #actions>
          <VBtn
            :text="$t('Save')"
            prepend-icon="mdi-content-save"
            @click="saveSensor"
          />
        </template>
      </ModalDialog>
    </template>
  </VCard>
</template>

<style scoped lang="scss">

</style>
