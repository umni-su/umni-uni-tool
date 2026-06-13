<script>
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import ThenElseField from "@/components/chunks/automations/ThenElseField.vue";
import DebugCard from "@/components/chunks/DebugCard.vue";

export default {
  name: "AutomationModal",
  components: {
    DebugCard,
    ThenElseField,
    ModalDialog
  },
  props:{
    modelValue:{
      type:Boolean,
      required:true
    }
  },
emits: ['update:model-value'],
  data(){
    return {
      automation: null,
      baseAction: {
        capability: null,
        subtype: null,
        action: null,
      },
      baseAutomation: {
        if: {
          capability: null,
          subtype: null,
          op: null,
          value: null,
        },
        then: [],
        else: []
      },
      open: false,
      comparisons: [
        {
          title: this.$t('More'),
          value: '>'
        },
        {
          title: this.$t('Less'),
          value: '<'
        },
        {
          title: this.$t('Equals'),
          value: '=='
        },
        {
          title: this.$t('More or equals'),
          value: '>='
        },
        {
          title: this.$t('Less or equals'),
          value: '<='
        }
      ]
    }
  },
  computed:{
    whenFailed(){
      return Object.values(this.automation.if).indexOf(null) > -1
    },
    thenFailed(){
      const then = this.automation.then || []
      const filtered = then.filter(item => {
        return Object.values(item).indexOf(null) > -1
      })
      return filtered?.length > 0
    },
    disabled(){
      return !this.automation || (this.automation.then.length < 1 || this.whenFailed)
    },
    activeAutomation(){
      return this.$store.getters['getActiveAutomation'];
    },
    capabilities(){
        return this.$store.getters['getAutomationsCapabilities']
    },
    thenConditions(){
      return this.automation?.then || []
    },
    elseConditions(){
      return this.automation.else || []
    }
  },
  watch:{
    open(v){
      this.$emit('update:model-value', v)
    },
    modelValue(v){
      this.open = v
    },
    activeAutomation:{
      deep: true,
      handler(v){
        this.automation = v
      }
    }
  },
  created(){
    this.baseAutomation.then.push(this.baseAction)
    this.automation = this.baseAutomation
    if(!this.automation.then){
      this.automation.then = []
    }
    if(!this.automation.else){
      this.automation.else = []
    }
  },
  methods:{
    show(){
      this.open = true;
    },
    hide(){
      this.open = false;
    },
    addThen(){
      if(this.thenConditions.length < 5) {
        this.automation.then.push({...{},...this.baseAction})
      }
    },
    removeThen(c,i){
      if(!this.automation.then){
        this.automation.then = []
      }
      this.automation.then = this.automation.then.filter((item, index) => {
        return i !== index
      })
    },
    addElse(){
      if(!this.automation.else){
        this.automation.else = []
      }
      if(this.elseConditions.length < 5) {
        this.automation.else.push({...{},...this.baseAction})
      }
    },
    removeElse(c,i){
      this.automation.else = this.automation.else.filter((item, index) => {
        return i !== index
      })
    },
    async save(){
      let res
      if(this.automation?.id > 0){
        res = await this.$store.dispatch('updateAutomation', this.automation)
      } else {
        res = await this.$store.dispatch('addAutomation', this.automation)
      }
      if(res){
        this.open = false
        this.$store.commit('success', this.$t('Saved'))
      }
    }
  }
}
</script>

<template>
  <ModalDialog v-model="open">
    <div class="text-headline-small text-secondary font-weight-bold">
      {{ $t('When') }}
    </div>
    <VSelect
      v-model="automation.if.capability"
      class="mt-4"
      :label="$t('Capability')"
      :items="capabilities"
    />
    <VTextField
      v-model="automation.if.subtype"
      class="mt-4"
      clearable
      :label="$t('Identifier or trigger')"
    />
    <VSelect
      v-model="automation.if.op"
      :label="$t('Comparison')"
      class="mt-4"
      :items="comparisons"
    />
    <VTextField
      v-model.number="automation.if.value"
      class="mt-4"
      :label="$t('Value')"
    />
    <VDivider class="my-4" />
    <div class="text-headline-small text-secondary font-weight-bold d-flex justify-space-between">
      {{ $t('Then') }}
      <VBtn
        density="comfortable"
        icon="mdi-plus"
        rounded="pill"
        variant="elevated"
        @click="addThen"
      />
    </div>

    <ThenElseField
      v-for="(condition, i) in thenConditions"
      :key="i"
      class="my-4"
      :model-value="condition"
    >
      <template #append>
        <VBtn
          icon="mdi-trash-can"
          density="comfortable"
          color="secondary"
          variant="plain"
          @click="removeThen(condition,i)"
        />
      </template>
    </ThenElseField>

    <VDivider class="my-4" />
    <div class="text-headline-small text-secondary font-weight-bold mt-4 d-flex justify-space-between">
      {{ $t('Else') }}
      <VBtn
        density="comfortable"
        icon="mdi-plus"
        rounded="pill"
        variant="elevated"
        @click="addElse"
      />
    </div>
    <ThenElseField
      v-for="(condition, i) in elseConditions"
      :key="i"
      class="my-4"
      :model-value="condition"
    >
      <template #append>
        <VBtn
          icon="mdi-trash-can"
          density="comfortable"
          color="secondary"
          variant="plain"
          @click="removeElse(condition,i)"
        />
      </template>
    </ThenElseField>
    <template #actions>
      <VBtn
        :disabled="disabled"
        :text="$t('Save')"
        prepend-icon="mdi-content-save"
        @click="save"
      />
    </template>
    <DebugCard>
      {{ automation }}
    </DebugCard>
  </ModalDialog>
</template>

<style scoped lang="scss">

</style>
