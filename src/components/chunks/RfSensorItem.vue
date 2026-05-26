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
  data(){
    return {
      showEdit: false,
      sensorCopy: null
    }
  },
  computed: {
    // 1 - movement sensor
    // 2 - door sensor
    // 3 - water leak sensor
    // 4 - buttons (remote controller with buttons)
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
  methods: {
    openEdit(){
      this.showEdit = true
      this.sensorCopy = this.sensor
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
      <VTooltip hover>
        <template #activator="{props}">
          <VBtn
            v-if="!sensor.new"
            v-bind="props"
            density="compact"
            variant="text"
            :icon="sensor.alarm ? 'mdi-bell' : 'mdi-bell-off'"
            :color="sensor.alarm ? 'orange' : 'secondary'"
          />
        </template>
        {{ sensor.alarm ? $t('Alarm mode is activated') : $t('Alarm mode is disabled') }}
      </VTooltip>
    </template>
    <template #title>
      <VChip
        :text="$t('Unsaved')"
        size="small"
        color="yellow-darken-2"
        rounded="pill"
      />{{ sensor.label }}
    </template>
    <template #subtitle>
      {{ typeString }}
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
        <template #actions>
          <VBtn
            :text="$t('Save')"
            prepend-icon="mdi-content-save"
          />
        </template>
        {{ sensor }}
      </ModalDialog>
    </template>
    <template #actions>
      <VBtn
        readonly
        variant="tonal"
        class="pa-0"
        density="compact"
        width="100%"
        :text="sensor.serial.toString(16)"
      />
    </template>
  </VCard>
</template>

<style scoped lang="scss">

</style>
