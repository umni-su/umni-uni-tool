<script>
import ConfirmationDialog from "@/components/chunks/ConfirmationDialog.vue";

export default {
  name: "RebootConfirmation",
  components: {ConfirmationDialog},
  computed: {
    activeDevice(){
      return this.$store.getters['getActiveDevice'];
    }
  },
  methods:{
    async reboot(){
      const ok = await this.$refs.conf.show({
        title: this.$t('Reboot needed'),
        message: this.$t('After changing the configuration, you need to reboot the device'),
        okText: this.$t('Reboot'),
        okIcon: 'mdi-restart',
        okColor: 'success'
      })
      if(ok && this.activeDevice?.ip){
        await this.$store.dispatch('rebootDevice')
      }
    }
  }
}
</script>

<template>
  <ConfirmationDialog ref="conf" />
</template>

<style scoped lang="scss">

</style>
