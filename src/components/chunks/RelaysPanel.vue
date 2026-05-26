<script>
import DebugCard from "@/components/chunks/DebugCard.vue";
import OutputPort from "@/components/chunks/OutputPort.vue";
import InputPort from "@/components/chunks/InputPort.vue";

export default {
  name: "RelaysPanel",
  components: {OutputPort, DebugCard},
  computed:{
    outputs(){
      return this.$store.getters['getOutputs']
    },
    lastMessage(){
      return this.$store.getters['lastMessagePayload']
    }
  },
  watch:{
    lastMessage:{
      deep: true,
      handler(v){
        if(v.data.capability === 'outputs'){
          try {
            const index = parseInt(v.data.identifier.replace('out',''));
            const value = typeof v.data.value === "boolean" ? v.data.value : v.data.value === 1;
            this.$store.commit('updateRelayState', {index, state: value});
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
  <VContainer
    v-if="outputs"
    fluid
  >
    <VRow>
      <OutputPort
        v-for="port in outputs"
        :key="port"
        capability="outputs"
        :port="port"
      />
    </VRow>
    <VRow>
      <DebugCard>
        {{ outputs }}
      </DebugCard>
    </VRow>
  </VContainer>
</template>

<style scoped lang="scss">

</style>
