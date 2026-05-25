<script>
export default {
  name: "HistoryChartItem",
  props:{
    icon: {
      type: String,
      default: "mdi-thermometer",
    },
    color:{
      type:String,
      default:"secondary"
    },
    history:{
      type:Object,
      required:true
    },
    label:{
      type:String,
      default:null
    }
  },
  computed: {
    timestamps(){
      return this.history?.timestamps ?? [];
    },
    values(){
      return this.history?.values ?? [];
    },
    lastValue(){
      return this.values[this.values.length - 1]?.toFixed(2);
    }
  }
}
</script>

<template>
  <VCard
    v-if="values"
    variant="text"
  >
    <template #prepend>
      <VIcon
        :color="color"
        :icon="icon"
        :size="64"
      />
    </template>
    <template #title>
      <div class="text-body-medium text-secondary">
        {{ label ?? history.name }}
      </div>
      <div class="text-display-medium font-weight-bold">
        {{ lastValue }}
      </div>
    </template>
    <template #append>
      <slot name="append" />
    </template>
    <VCardText>
      <VSparkline
        :color="color"
        :model-value="values"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>
