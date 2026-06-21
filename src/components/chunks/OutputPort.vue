<script>

import ModalDialog from "@/components/chunks/ModalDialog.vue";

export default {
  name: "OutputPort",
  components: {ModalDialog},
  props: {
    capability:{
      type: String,
      required: true
    },
    port:{
      type:Object,
      required:true
    }
  },
  data(){
    return {
      state:0,
      edit: false,
      portModel:null
    }
  },
  computed: {
    isInput(){
      return this.capability === 'inputs'
    },
    isOn(){
      return this.port.state;
    }
  },
  watch: {
    port: {
      deep: true,
      handler(v) {
        this.state = v.state
      }
    }
  },
  created() {
    this.state = this.port.state
  },
  methods: {
    async updateOutputState(){
      await this.$store.dispatch('switchRelay',{
        mode: this.capability,
        index: this.port.index,
        level:this.state
      })
    },
    openEdit(){
      this.portModel = {...{},...this.port}
      this.edit = !this.edit
    },
    async savePort(){
      const res = await this.$store.dispatch('saveSetting',{
        setting: this.capability,
        values: {
          index: this.port.index,
          label: this.portModel.label,
          en: this.portModel.active
        }
      })
      if(res){
        this.edit = false
        const data = {
          active: this.portModel.active,
          label: this.portModel.label,
        }
        if(this.capability === 'outputs'){
          this.$store.commit('updateRelay', {
            index:this.port.index,
            data
          })
        }
        else if(this.capability === 'opencollectors'){
          this.$store.commit('updateOC', {
            index:this.port.index,
            data
          })
        }
        this.$store.commit('success', this.$t('Success'))
      }
    }
  }
}
</script>

<template>
  <VCol
    cols="12"
    md="3"
    sm="6"
  >
    <VCard
      :color="isOn ? 'primary' : 'secondary'"
      variant="tonal"
      min-height="130"
    >
      <template #title>
        {{ port.label }}
      </template>
      <template #append>
        <VBtn
          v-tooltip="$t('Edit')"
          density="compact"
          variant="plain"
          color="default"
          icon="mdi-pencil"
          @click="openEdit"
        />
      </template>
      <template #subtitle>
        {{ $t('Port #{index}',{index: port.index}) }}
      </template>
      <VCardText class="pa-0 pb-6 d-flex align-center justify-center">
        <VIcon
          v-if="isInput"
          :icon="isOn ? 'mdi-lightbulb-on' : 'mdi-lightbulb-off-outline'"
          :size="48"
          :color="isOn ? 'orange' : 'secondary'"
        />
        <VSwitch
          v-else
          v-model="state"
          color="primary"
          inline
          inset
          direction="vertical"
          @update:model-value="updateOutputState"
        />
        <ModalDialog
          v-model="edit"
          :title="port.label"
        >
          <VTextField
            v-model="portModel.label"
            :label="$t('Name')"
          />
          <VSwitch
            v-model="portModel.active"
            :label="$t('Active')"
            color="primary"
          />
          <template #actions>
            <VBtn
              :text="$t('Save')"
              prepend-icon="mdi-content-save"
              @click="savePort"
            />
          </template>
        </ModalDialog>
      </VCardText>
    </VCard>
  </VCol>
</template>

<style scoped lang="scss">

</style>
