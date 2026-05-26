<script>
import InputPort from "@/components/chunks/InputPort.vue";
import DebugCard from "@/components/chunks/DebugCard.vue";

export default {
  name: "InputsPanel",
  components: {DebugCard, InputPort},
  computed: {
    inputs(){
      return this.$store.getters['getInputs']
    },
    lastMessage(){
      return this.$store.getters['lastMessagePayload'];
    }
  },
  watch: {
    lastMessage:{
      deep: true,
      handler(v){
        console.log(v)
        if(v.data.capability === 'inputs'){
          try {
            const index = parseInt(v.data.identifier.replace('inp',''));
            const value = typeof v.data.value === "boolean" ? v.data.value : v.data.value === 1;
            this.$store.commit('updateInputState', {index, state: value});
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
  <VRow>
    <InputPort
      v-for="port in inputs"
      :key="port"
      :port="port"
    />
  </VRow>
  <DebugCard>
    {{ inputs }}
  </DebugCard>
</template>

<style scoped lang="scss">

</style>
