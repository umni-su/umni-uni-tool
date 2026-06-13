<script>
import DebugCard from "@/components/chunks/DebugCard.vue";
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import {storage} from "@/store/devices/device_store.js";
import ConfirmationDialog from "@/components/chunks/ConfirmationDialog.vue";

export default {
  name: "DeviceItem",
  components: {ConfirmationDialog, ModalDialog, DebugCard},
  props:{
    device:{
      type:Object,
      required:true
    }
  },
  data(){
    return {
      edit: false,
      model: null
    }
  },
  computed: {
    theme(){
      return this.$vuetify.theme.name
    },
    title(){
      return this.device.title ? this.device.title.toUpperCase() : this.device.name.toUpperCase()
    }
  },
  watch:{
    device:{
      deep: true,
      handler(v){
        this.model = {...{},...v}
      }
    }
  },
  created() {
    this.model = {...{},...this.device}
  },
  methods: {
    openEditDevice(){
      this.edit = true
    },
    async deleteDevice(){
      const ok = await this.$refs.confirm.show({
        title: this.$t('Delete device?'),
        message: this.$t('After deletion, the device can be added again'),
        okText: this.$t('Delete'),
        okIcon: 'mdi-trash-can',
        okColor: 'error'
      })
      if(ok){
        await storage.forgetDevice(this.device.hostname)
        this.$store.commit('removeDevice', this.device)
      }
    },
    async setActive(){
      await this.$store.commit('setActiveDevice', this.device)
      this.opened = false
    },
    async saveDeviceConfiguration(){
      const updateData = {
        title: this.model.title,
      }
      const res = await this.$store.dispatch('saveDeviceConfiguration', updateData).catch(()=>{
        this.$store.commit('error', this.$t('Error'))
      })
      if(res){
        const deviceUpdate = {
          ...this.device,
          ...updateData
        }
        await storage.updateDevice(this.device.hostname, deviceUpdate)
        this.$store.commit('saveDevice', deviceUpdate)
        this.$store.commit('success', this.$t('Success'))
      }
    }
  }
}
</script>

<template>
  <VCard :variant="theme === 'dark' ? 'tonal' : 'elevated'">
    <template #title>
      {{ title }}
    </template>
    <template #text>
      <div> {{ $t('IP address') }}: {{ device.ip }}</div>
      <div>{{ $t('Activity') }}: {{ $moment(device.lastSeen).fromNow() }}</div>
      <DebugCard>
        {{ device }}
      </DebugCard>
    </template>
    <template #append>
      <VChip
        v-if="device.active"
        color="secondary"
        rounded="pill"
        size="small"
        class="mr-2"
        :text="$t('Default')"
        prepend-icon="mdi-star"
      />
      <VChip
        v-else
        color="primary"
        rounded="pill"
        size="small"
        class="mr-2"
        :text="$t('Choose')"
        prepend-icon="mdi-chevron-right"
        @click="setActive"
      />

      <VMenu :close-on-content-click="false">
        <template #activator="{props}">
          <VBtn
            v-bind="props"
            density="comfortable"
            color="default"
            icon="mdi-dots-vertical"
          />
        </template>
        <VList slim>
          <VListSubheader :title="device.name.toUpperCase()" />
          <VListItem
            prepend-icon="mdi-pencil"
            :title="$t('Edit')"
            @click="openEditDevice"
          />
          <VListItem
            base-color="error"
            prepend-icon="mdi-trash-can"
            :title="$t('Delete')"
            @click="deleteDevice"
          />
        </VList>
      </VMenu>
    </template>
    <template #default>
      <ModalDialog
        v-model="edit"
        :title="device.title"
      >
        <VTextField v-model="model.title" />
        <template #actions>
          <VBtn
            prepend-icon="mdi-content-save"
            :text="$t('Save')"
            @click="saveDeviceConfiguration"
          />
        </template>
      </ModalDialog>
      <ConfirmationDialog ref="confirm" />
    </template>
  </VCard>
</template>

<style scoped lang="scss">

</style>
