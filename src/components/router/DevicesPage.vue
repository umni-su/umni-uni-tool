<script>
import DeviceItem from "@/components/chunks/DeviceItem.vue";
import {invoke} from "@tauri-apps/api/core";

export default {
  name: "DevicesPage",
  components: {
    DeviceItem
  },
  data(){
    return {
      term: null
    }
  },
  computed:{
    devices () {
      return this.$store.getters.getFilteredDevices(this.term);
    }
  },
  methods:{
    openAddDevice(){
      this.$store.commit('setAddDevice', true)
    },
    load(){
      return this.$store.getters.getFilteredDevices(this.term);
    },

    async initScanner() {
      this.$store.commit('setScanMode', true);
      try {
        await invoke('start_mdns_discovery');
      } catch (err) {
        console.error("Ошибка mDNS:", err);
      }
    },
  }
}
</script>

<template>
  <VSheet
    class="pa-4 mx-auto"
    color="transparent"
    max-width="1200"
  >
    <VCard>
      <template #append>
        <VMenu>
          <template #activator="{props}">
            <VBtn
              variant="text"
              density="comfortable"
              color="default"
              v-bind="props"
              icon="mdi-dots-vertical"
            />
          </template>
          <VList class="py-0">
            <VListItem
              prepend-icon="mdi-plus"
              :title="$t('Add device')"
              @click="openAddDevice"
            />
            <VListItem
              prepend-icon="mdi-refresh"
              :title="$t('Scan devices')"
              @click="initScanner"
            />
          </VList>
        </VMenu>
      </template>
      <template #title>
        {{ $t('My devices') }}
      </template>
      <template #text>
        <VSheet
          class="mb-4 text-right"
          color="transparent"
        />
        <VTextField
          v-model="term"
          append-inner-icon="mdi-magnify"
          clearable
          class="mb-4"
          :label="$t('Name or IP address')"
        />
        <DeviceItem
          v-for="device in devices"
          :key="device"
          class="mb-4"
          :device="device"
        />
      </template>
    </VCard>
  </VSheet>
</template>

<style scoped lang="scss">

</style>
