<script>
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import {invoke} from "@tauri-apps/api/core";

export default {
  name: "DeviceDiscoveryModal" ,
  components: {ModalDialog},
  data(){
    return {
      opened:false
    }
  },
  computed: {
    devices(){
      return this.$store.getters['getDevices']
    },
    devicesFromScan(){
      return this.devices.filter(device => device.fromScan)
    },
    activeDevice() {
      return this.$store.getters['getActiveDevice']
    },
    isScanning(){
      return this.$store.getters['isScanMode'];
    },
  },
  watch:{
    async isScanning(v){
      this.opened = v
      if (!v) return
      try {
        console.log('Start mdns discovery')
        await invoke('start_mdns_discovery');
      } catch (err) {
        console.error("Ошибка mDNS:", err);
      }
    },
  },
  methods: {
    setActiveDevice(device){
      this.$store.commit('setActiveDevice', device)
      this.$store.commit('setScanMode', false)
      this.opened = false
    },
    openAddDevice(){
      this.$store.commit('setAddDevice', true)
    },
    onClose(){
      return this.$store.commit('setScanMode',false)
    }
  }
}
</script>

<template>
  <ModalDialog
    v-model="opened"
    :title="$t('Choose device')"
    @modal-close="onClose"
  >
    <VList>
      <VListItem
        v-for="device in devicesFromScan"
        :key="device.hostname"
        rounded="lg"
        :value="device"
        :active="activeDevice?.name === device.name"
        class="mb-2"
        @click="setActiveDevice(device)"
      >
        <template #title>
          {{ device.title || device.name }}
        </template>
        <VListItemSubtitle>
          {{ device.name.toUpperCase() }}
        </VListItemSubtitle>
        <VListItemSubtitle class="opacity-50">
          {{ device.ip }}
        </VListItemSubtitle>
        <template #append>
          <VBtn
            density="compact"
            rounded="pill"
            icon="mdi-chevron-right"
            @click="setActiveDevice(device)"
          />
        </template>
      </VListItem>
    </VList>
    <template #actions>
      <VSheet
        class="text-center"
        width="100%"
      >
        <VBtn
          prepend-icon="mdi-plus"
          rounded="pill"
          variant="elevated"
          :text="$t('Add device')"
          @click="openAddDevice"
        />
      </VSheet>
    </template>
  </ModalDialog>
</template>

<style scoped lang="scss">

</style>
