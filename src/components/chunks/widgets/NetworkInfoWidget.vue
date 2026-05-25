<script>

export default {
  name: 'NetworkInfoWidget',
  data() {
    return {
      slide: null
    }
  },
  computed: {
    sysinfo() {
      return this.$store.getters['getSystemInfo']
    },
    netif() {
      return this.sysinfo.networks
    }
  },
  methods: {
    mac(str) {

      return str.toUpperCase()
    }
  }
}
</script>

<template>
  <VCard
    v-if="sysinfo"
    class="network-info"
    height="100%"
    :title="$t('Network information')"
    :subtitle="$t('Network interfaces information')"
  >
    <VCardText>
      <VCarousel
        color="primary"
        hide-delimiter-background
        :show-arrows="false"
        height="190px"
      >
        <VCarouselItem
          v-for="net in netif"
          :key="net.name"
        >
          <VList density="compact">
            <VListSubheader>{{ net.name.toUpperCase() }}</VListSubheader>
            <VListItem>
              <VListItemSubtitle>{{ $t('Mac address') }}</VListItemSubtitle>
              <VListItemTitle>{{ net.mac }}</VListItemTitle>
              <VListItemSubtitle>{{ $t('IP address') }}</VListItemSubtitle>
              <VListItemTitle>{{ net.ip }}</VListItemTitle>
              <VListItemSubtitle>{{ $t('Network mask') }}</VListItemSubtitle>
              <VListItemTitle>{{ net.mask }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCarouselItem>
      </VCarousel>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">


</style>
