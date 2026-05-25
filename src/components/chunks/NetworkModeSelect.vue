<script>
export default {
  name: "NetworkModeSelect",
  data(){
    return {
      items: [
        {
          title: this.$t('Ethernet'),
          value: 1
        },
        {
          title: this.$t('Wifi'),
          value: 3
        }
      ],
      selected: null
    }
  }
}
</script>

<template>
  <VSelect
    v-model="selected"
    :label="$t('Connection type')"
    :items="items"
  />
</template>

<style scoped lang="scss">

</style>
