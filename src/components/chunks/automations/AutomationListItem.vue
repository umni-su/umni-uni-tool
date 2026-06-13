<script>
export default {
  name: "AutomationListItem",
  props: {
    automation: {
      type: Object,
      required: true
    }
  },
emits: ['on-click-automation', 'on-delete-automation'],
  computed: {
    automationIf(){
      return this.automation?.if
    },
    automationOp(){
      return this.automationIf?.op
    },
    automationValue(){
      return this.automationIf?.value
    },
    automationCapability(){
      return this.automationIf?.capability
    },
    automationSubtype(){
      return this.automationIf?.subtype || ''
    },
    triggerText(){
      return `${this.automationCapability} ${this.automationSubtype} ${this.automationOp} ${this.automationValue}`
    }
  }
}
</script>

<template>
  <VListItem
    v-if="automation"
    class="mb-4"
  >
    <template #prepend>
      <VChip
        variant="elevated"
        rounded="pill"
        color="primary"
        :text="`ID #${automation.id}`"
      />
    </template>
    <template #title>
      <VChip
        rounded="pill"
        class="ml-4"
        :text="triggerText"
      />
    </template>
    <template #append>
      <VBtn
        density="comfortable"
        icon="mdi-pencil"
        color="secondary"
        variant="plain"
        @click="$emit('on-click-automation', automation)"
      />
      <VBtn
        density="comfortable"
        icon="mdi-trash-can"
        variant="plain"
        color="error"
        @click="$emit('on-delete-automation', automation)"
      />
    </template>
  </VListItem>
</template>

<style scoped lang="scss">

</style>
