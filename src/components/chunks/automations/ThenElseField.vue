<script>
export default {
  name: "ThenElseField",
  props:{
    modelValue:{
      type:Object,
      default: null
    }
  },
emits: ['update:model-value'],
  data(){
    return {
      actions:[
        {
          value: 0,
          title: this.$t('Off')
        },
        {
          value: 1,
          title: this.$t('On')
        }
      ],
      value: null,
      defaultModel:{
        capability: null,
        subtype: null,
        action: null
      }
    }
  },
  computed:{
    capabilities(){
      return this.$store.getters['getAutomationsSwitchCapabilities']
    },
  },
  watch:{
    value:{
      deep: true,
      handler(v){
        this.$emit('update:model-value',v)
      }
    }
  },
  created(){
    this.value = this.modelValue
    if(this.modelValue === null){
      this.value = this.defaultModel
    }
  }
}
</script>

<template>
  <VSheet class="d-flex flex-wrap align-center">
    <VSheet width="90%">
      <VSelect
        v-model="value.capability"
        :items="capabilities"
        :label="$t('Capability')"
        class="mb-4"
      />
      <VTextField
        v-if="value.capability"
        v-model="value.subtype"
        clearable
        class="mb-4"
        :label="$t('Identifier or trigger')"
      />
      <VSelect
        v-model.number="value.action"
        clearable
        :items="actions"
      />
    </VSheet>
    <VSheet
      v-if="$slots.append"
      class="text-center"
      width="10%"
    >
      <slot name="append" />
    </VSheet>
  </VSheet>
</template>

<style scoped lang="scss">

</style>
