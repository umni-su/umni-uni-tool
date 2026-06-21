<script>
import formatBytes from "@/helpers/formatBytes.js";
import ConfirmationDialog from "@/components/chunks/ConfirmationDialog.vue";

export default {
  name: "MaintenanceCard",
  components: {ConfirmationDialog},
  data(){
    return {
      loading: false,
      file: null,
      message: null,
      progress: 0,
    }
  },
  computed: {
    //{ "id": 1781955744655, "data": { "data": { "progress": 100 }, "event": "fw_update" }, "timestamp": "20.06.2026, 14:42:24" }
    lastMessage(){
      return this.$store.getters['lastMessage']
    },
    size(){
      return formatBytes(this.file?.size)
    },
    canUpload(){
      return this.size?.val < 1.9 && this.size?.sizes === 'Mb' && this.file?.name?.startsWith("umni-uni")
    }
  },
  watch:{
    lastMessage:{
      deep: true,
      handler(v){
        if(v?.data?.event === 'fw_update'){
          this.message = this.lastMessage.data?.data
        }
      }
    },
    message:{
      deep: true,
      handler(v){
        if(v?.progress && v.progress <=100){
          this.progress = v.progress
          if(v.progress === 100){
            setTimeout(()=>{
              this.loading = false
              this.progress = 0
              this.$store.commit('setReboot', true)
            }, 1000)
          }
        }
      }
    }
  },
  methods: {
    async flashDevice(){
      const ok = await this.$refs.confirm.show({
        title: this.$t('Flash device'),
        message: this.$t('Do not disconnect the device. If it doesn\'t work after 5 minutes, flash the device directly via the USB cable!'),
        okText: this.$t('Flash'),
        okIcon: 'mdi-send',
        okColor: 'success'
      })
      if(ok){
        this.loading = true
        await this.$store.dispatch('flashDevice', this.file)
      }

    }
  }
}
</script>

<template>
  <VSheet>
    <VAlert
      variant="tonal"
      color="primary"
      icon="mdi-information"
      class="mb-4"
    >
      {{ $t('The file name must begin with umni-uni') }}
    </VAlert>
    <VFileInput
      v-model="file"
      :label="$t('Choose firmware')"
      accept=".bin"
    >
      <template
        v-if="canUpload"
        #append-inner
      >
        <VChip
          rounded
          :color="canUpload ? 'success' : 'error'"
          :text="`${size.val}${size.sizes}`"
        />
      </template>
    </VFileInput>
    <div
      v-if="file"
    >
      <VBtn
        v-if="canUpload"
        :loading="loading"
        :disabled="loading"
        class="mt-4"
        prepend-icon="mdi-send"
        :text="$t('Flash')"
        @click="flashDevice"
      />

      <VSpacer />

      <VProgressLinear
        v-if="progress && loading"
        color="primary"
        :max="100"
        :model-value="progress"
        class="mt-4"
      />
    </div>
    <ConfirmationDialog ref="confirm" />
  </VSheet>
</template>

<style scoped lang="scss">

</style>
