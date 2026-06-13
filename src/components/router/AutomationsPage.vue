<script>

import AutomationModal from "@/components/chunks/automations/AutomationModal.vue";
import AutomationListItem from "@/components/chunks/automations/AutomationListItem.vue";

export default {
  name: "AutomationsPage",
  components: {AutomationListItem, AutomationModal},
  data(){
    return {
      open:false
    }
  },
  computed: {
    automations(){
      return this.$store.getters['getAutomations']
    }
  },
  async created() {
  await this.getAutomations();
  },
  methods:{
    async getAutomations(){
      await this.$store.dispatch('getAutomations');
    },
    onClickAutomation(a){
      this.$store.commit('setActiveAutomation',a);
      this.open = true
    },
    async onDeleteAutomation(e){
      const res = await this.$store.dispatch('deleteAutomation', e.id)
      if(res){
        this.$store.commit('success', this.$t('Success'))
      }
    }
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
        <VBtn
          v-if="automations.length <= 20"
          density="comfortable"
          variant="elevated"
          icon="mdi-plus"
          rounded="pill"
          @click="open = !open"
        />
      </template>
      <template #title>
        {{ $t('Automations') }}
      </template>
      <VCardText>
        <VList>
          <AutomationListItem
            v-for="automation in automations"
            :key="automation.id"
            :automation="automation"
            @on-click-automation="onClickAutomation($event)"
            @on-delete-automation="onDeleteAutomation($event)"
          />
        </VList>
      </VCardText>
    </VCard>
    <AutomationModal v-model="open" />
  </VSheet>
</template>

<style scoped lang="scss">

</style>
