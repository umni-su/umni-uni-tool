<script>
import DebugCard from "@/components/chunks/DebugCard.vue";
import OutputPort from "@/components/chunks/OutputPort.vue";

export default {
  name: "OpenollectorsPanel",
  components: {DebugCard, OutputPort},
  computed:{
    openCollectors(){
      return this.$store.getters['getOpenCollectors']
    },
    lastMessage(){
      return this.$store.getters['lastMessagePayload'];
    }
  },
  watch:{
    lastMessage:{
      deep: true,
      handler(v){
        if(v.data.capability === 'oc'){
          try {
            const index = parseInt(v.data.identifier.replace('oc',''));
            const value = typeof v.data.value === "boolean" ? v.data.value : v.data.value === 1;
            this.$store.commit('updateOcState', {
              index: index - 1, // case OC1 OC2, but index 0,1
              state: value
            });
          } catch(err){
            console.log(err)
          }
        }
      }
    },
  }
}
</script>

<template>
  <VContainer fluid>
    <VRow>
      <OutputPort
        v-for="port in openCollectors"
        :key="port"
        capability="opencollectors"
        :port="port"
      />
    </VRow>
    <VRow>
      <DebugCard>
        {{ openCollectors }}
      </DebugCard>
    </VRow>
  </VContainer>
</template>

<style scoped lang="scss">

</style>
