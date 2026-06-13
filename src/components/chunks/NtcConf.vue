<script>
import NtcConfCard from "@/components/chunks/NtcConfCard.vue";

export default {
  name: "NtcConf",
  components: {NtcConfCard},

  computed:{
    ntc1() {
      return this.$store.getters.getState('ntc1')
    },
    ntc2() {
      return this.$store.getters.getState('ntc2')
    },
    ntcConf(){
      return this.$store.getters['getNtcConf']
    }
  },
  methods:{
    getChannelData(key){
      switch(key){
        case 'ntc1':
          return this.ntc1
        case 'ntc2':
          return this.ntc2
        default:
          return null
      }
    },
  }

}
</script>

<template>
  <VSheet>
    <VContainer fluid>
      <VRow>
        <VCol
          v-for="(ntc,i) in ntcConf.channels"
          :key="ntc"
          cols="12"
          md="6"
        >
          <NtcConfCard
            :ntc="ntc"
            :index="i + 1"
          />
        </VCol>
      </VRow>
    </VContainer>
  </VSheet>
</template>

<style scoped lang="scss">

</style>
