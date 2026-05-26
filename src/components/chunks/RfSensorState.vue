<script>
export default {
  name: "RfSensorState",
  props:{
    state:{
      type:Number,
      required:true,
    }
  },
  computed:{

  },
  methods: {
    bit(i) {
      return 0x01 & (this.state >> i)
    },}
}
</script>

<template>
  <VSheet>
    <VBtn
      v-for="num in [0,1,2,3]"
      :key="num"
      variant="text"
      :icon="bit(num) === 1 ? 'mdi-toggle-switch-variant' : 'mdi-toggle-switch-variant-off'"
      density="compact"
      readonly
      :color="bit(num) === 1 ? 'primary' : 'secondary'"
    />
  </VSheet>
</template>

<style scoped lang="scss">

</style>
