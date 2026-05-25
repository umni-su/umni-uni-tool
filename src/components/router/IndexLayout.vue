<script>

export default {
  name: 'IndexLayout',

  data() {
    return {
      tab: null,
    }
  },
  computed: {
    hasOpenTherm(){
      return this.$store.getters.hasOpenTherm
    },
    hasOutputs(){
      return this.$store.getters.hasOutputs
    },
    hasOpenCollectors(){
      return this.$store.getters.hasOpenCollectors
    },
    hasInputs(){
      return this.$store.getters.hasInputs
    },
    hasOneWire(){
      return this.$store.getters.hasOneWire
    },
    hasRf433(){
      return this.$store.getters.hasRf433
    },
    hasAi(){
      return this.$store.getters.hasAi1 || this.$store.getters.hasAi2
    },
  },
  methods: {

  }
}
</script>

<template>
  <VSheet
    height="100%"
    class="mx-auto"
    max-width="1200"
    color="transparent"
  >
    <VTabs
      v-model="tab"
      color="default"
      grow
      center-active
      align-tabs="center"
      show-arrows
    >
      <VTab
        value="home"
        prepend-icon="mdi-home"
        :to="{name:'home_panel'}"
      >
        {{ $t('Dashboard') }}
      </VTab>
      <VTab
        v-if="hasOpenTherm"
        value="opentherm"
        prepend-icon="mdi-thermostat"
        :to="{name:'climate_panel'}"
      >
        {{ $t('Climate') }}
      </VTab>
      <VTab
        v-if="hasOutputs || hasInputs || hasOpenCollectors"
        value="dio"
        prepend-icon="mdi-dip-switch"
        :to="{name:'dio_panel'}"
      >
        {{ $t('Relays and inputs') }}
      </VTab>
      <VTab
        v-if="hasAi"
        value="analog"
        prepend-icon="mdi-sine-wave"
        :to="{name:'analog'}"
      >
        {{ $t('Analog sensors') }}
      </VTab>
      <VTab
        v-if="hasRf433"
        value="rf"
        prepend-icon="mdi-access-point"
        :to="{name:'rf_panel'}"
      >
        {{ $t('Radio channel') }}
      </VTab>
      <VTab
        v-if="hasOneWire"
        value="1wire"
        prepend-icon="mdi-network"
        :to="{name:'one_wire_panel'}"
      >
        {{ $t('1-wire') }}
      </VTab>
    </VTabs>
    <VTabsWindow
      v-model="tab"
      class="full-card-window-height pt-4"
    >
      <VSheet

        width="100%"
        color="transparent"
        class="pa-2 mx-auto fill-height"
      >
        <RouterView />
      </VSheet>
    </VTabsWindow>
  </VSheet>
</template>
<style scoped lang="scss">

</style>
