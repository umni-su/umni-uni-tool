<script>
import RfSensorItem from "@/components/chunks/RfSensorItem.vue";
import RfSensorTypeSelect from "@/components/chunks/RfSensorTypeSelect.vue";

export default {
  name: "RfPanel",
  components: {RfSensorTypeSelect, RfSensorItem},
  data() {
    return {
      filterType: null,
      handler: null,
    }
  },
  computed: {
    state() {
      return this.$store.getters['getRfState']
    },
    interval() {
      return this.$store.getters['getRefreshInterval']
    },
    sensors() {
      return this.filterType > 0 ? this.state.filter(s => s.type === this.filterType) : this.state
    }
  },
  watch: {
    async interval() {
      clearInterval(this.handler)
      await this.getState()
      this.handler = setInterval(async () => {
        await this.getState()
      }, this.interval)
    }
  },
  async mounted() {
    await this.getState()
    this.handler = setInterval(async () => {
      await this.getState()
    }, this.interval)

  },
  unmounted() {
    clearInterval(this.handler)
  },
  methods: {
    async getState() {
      await this.$store.dispatch('getRf433Conf')
      //this.sensors = this.state
    }
  }
}
</script>

<template>
  <VWindowItem
    value="rf"
    class="fill-height"
  >
    <VSheet
      v-if="state && state.length > 0"
      height="100%"
      class="index-panel pa-6"
      color="transparent"
    >
      <VContainer>
        <VRow>
          <VCol>
            <RfSensorTypeSelect
              prepend-icon="mdi-filter"
              width="300"
              @update:model-value="filterType=$event"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol
            v-for="sensor in sensors"
            :key="sensor.serial"
            cols="12"
            md="4"
            sm="6"
          >
            <RfSensorItem
              :sensor="sensor"
            />
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>
    <VEmptyState
      v-else
      icon="mdi-access-point"
    >
      <template #title>
        {{ $t('Empty') }}
      </template>
      <template #text>
        {{ $t('You have not added any wireless sensors') }}
      </template>
      <template #actions>
        <VBtn
          color="primary"
          prepend-icon="mdi-plus"
          :text="$t('Add wireless sensor')"
          @click="$router.push({name:'settings_rf'})"
        />
      </template>
    </VEmptyState>
  </VWindowItem>
</template>

<style scoped lang="scss">

</style>
