<script>
import ModalDialog from "@/components/chunks/ModalDialog.vue";
import {invoke} from "@tauri-apps/api/core";

export default {
  name: "BottomMenu",
  components: {ModalDialog},
  data(){
    return {
      bottom: false,
      loading: false,
      openShare: false
    }
  },
  computed:{
    devices(){
      return this.$store.getters['getDevices']
    },
    caps(){
      return this.$store.getters['getCapabilities']
    },
    activeDevice(){
      return this.$store.getters['getActiveDevice']
    },
    filteredDevices(){
      return this.devices.filter(d=>{
        return d.hostname !== this.activeDevice.hostname
      })
    },
    code(){
      return this.$store.getters['getPairCode']
    },
    systemInfo(){
      return this.$store.getters['getSystemInfo'];
    },
    hostname(){
      return this.$store.getters['getHostname']?.toUpperCase();
    },
    title(){
      return this.systemInfo?.title?.toUpperCase();
    },
    bottomNav(){
      return this.$store.getters['getBottomNav'];
    }
  },
  watch:{
    bottomNav(v){
      this.bottom = v
    },
    bottom(v){
      this.$store.commit('setBottomNav',v)
    }
  },
  methods:{
    toggle(){
      this.bottom = !this.bottom
    },
    goToIndex(){
      this.bottom = false
      this.$router.push({name:'home_panel'})
    },
    async trustPairGenerate(){
      this.loading = true
      await this.$store.dispatch('trustPairGenerate').finally(()=>{
        this.loading = false
      })
    },
    async copyText(){
      if(!this.code) return
      await navigator.clipboard.writeText(this.code)
        .catch( () => {
            this.$store.commit('error',this.$t('Error'))
          }
        )
      this.$store.commit('success',this.$t('Copied'))
    },
    async chooseDevice(){
      this.openShare = true
      await this.copyText()
      try {
        await invoke('start_mdns_discovery');
      } catch (err) {
        console.error("Ошибка mDNS:", err);
      }
    },
    async shareWith(device){
      this.loading = true
      if(!this.code) return
      const res = await this.$store.dispatch('trustPairConsume', {
        device: device,
        code: this.code
      }).finally(async ()=>{
        this.loading = false
        this.openShare = false
      })
      if(res){
        // Confirm
        this.$store.commit('success',this.$t('Success'))
        this.bottom = false
      }
    }
  }
}
</script>

<template>
  <VBottomSheet
    v-model="bottom"
    fullscreen
    persistent
    color="default"
    rounded="0"
  >
    <VCard
      rounded="0"
      color="primary"
      class="mx-auto"
      width="100%"
    >
      <VCardText class="d-flex align-center justify-space-between pa-0">
        <VSheet
          color="transparent"
          max-width="900"
          width="100%"
          class="mx-auto pa-8"
        >
          <div class="text-body-small opacity-70">
            {{ $t('Current device') }}
          </div>
          <div class="text-headline-medium">
            {{ title }}
          </div>
          <div class="text-body-medium">
            {{ hostname }}
          </div>
          <VBtn
            class="mt-2 mr-2"
            :text="$t('Scan devices')"
            color="default"
            variant="tonal"
            prepend-icon="mdi-swap-horizontal"
            density="comfortable"
            @click="$store.commit('setScanMode', true)"
          />
          <VBtn
            :text="$t('View')"
            class="mt-2"
            append-icon="mdi-chevron-right"
            variant="tonal"
            inline
            color="default"
            density="comfortable"
            @click="goToIndex"
          />
          <VSheet
            color="transparent"
            class="mt-8"
          >
            <VBtn
              :loading="loading"
              :disabled="loading"
              :text="$t('Share this device')"
              prepend-icon="mdi-share-variant"
              variant="flat"
              inline
              color="success"
              @click="trustPairGenerate"
            />
            <VSheet
              v-if="code"
              color="white"
              border
              class="mt-4 pa-4"
              width="100%"
            >
              <code>{{ code }}</code>
              <VSpacer />
              <VBtn
                class="mt-2"
                variant="tonal"
                density="comfortable"
                prepend-icon="mdi-content-copy"
                :text="$t('Copy')"
                @click="copyText"
              />
            </VSheet>
            <VBtn
              v-if="code"
              class="mt-2"
              :text="$t('Choose device')"
              append-icon="mdi-chevron-right"
              @click="chooseDevice"
            />
            <ModalDialog
              v-if="code"
              v-model="openShare"
              :title="$t('Share with device')"
            >
              <VProgressLinear
                v-if="loading"
                indeterminate
              />
              <VList v-if="filteredDevices">
                <VListItem
                  v-for="device in filteredDevices"
                  :key="device.hostname"
                  rounded="lg"
                  :disabled="!device.online || loading"
                  @click="shareWith(device)"
                >
                  <VListItemTitle>
                    {{ device.title }}
                  </VListItemTitle>
                  <VListItemSubtitle>
                    {{ device.hostname }}
                  </VListItemSubtitle>
                  <VListItemSubtitle class="opacity-50">
                    {{ device.ip }}
                  </VListItemSubtitle>
                </VListItem>
              </VList>
            </ModalDialog>
          </VSheet>
        </VSheet>
      </VCardText>
      <template #append>
        <VBtn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          color="default"
          @click="toggle"
        />
      </template>
    </VCard>
  </VBottomSheet>
</template>

<style scoped lang="scss">

</style>
