<script>
export default {
  name: "IpTypeSelect",
  data(){
    return {
      items: [
        {
          title: this.$t('Dynamic (DHCP)'),
          value: 1
        },
        {
          title: this.$t('Static'),
          value: 2
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
    :label="$t('IP address type')"
    :items="items"
  />
</template>

<style scoped lang="scss">

</style>
