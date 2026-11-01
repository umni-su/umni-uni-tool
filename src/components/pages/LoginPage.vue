<script>
import UmniLogo from "@/components/chunks/UmniLogo.vue";

export default {
  name: "LoginPage",
  components: {UmniLogo},
  data() {
    return {
      token: '',
      saving: false,
      error: ''
    }
  },
  computed: {
    devices() {
      return this.$store.getters['getDevices']
    },
    activeDevice() {
      return this.devices.find(device => device.active)
    },
    loading() {
      return this.saving || this.$store.getters['isLoading']
    },
    theme() {
      return this.$store.getters['getTheme']
    },
  },
  methods: {
    async submitToken(){
      const token = this.token.trim()
      if(!token || this.loading) return

      this.saving = true
      this.error = ''
      try {
        await this.$store.dispatch('loginWithToken', token)
        this.token = ''
      } catch (error) {
        // 401 приходит и при расхождении токена, и при рассинхроне часов с устройством
        this.error = error?.status === 401
          ? this.$t('Invalid token or unsynchronized clock')
          : this.$t('Error')
        console.error('loginWithToken error:', error)
      } finally {
        this.saving = false
      }
    },
    scanDevices(){
      this.$store.commit('setScanMode', true)
    }
  }
}
</script>

<template>
  <VSheet
    color="primary"
    width="100%"
    rounded="0"
    class="fill-height d-flex align-center justify-center"
  >
    <VCard
      variant="text"
      max-width="360"
      width="100%"
    >
      <VCardText class="text-center">
        <UmniLogo
          :width="160"
          class="opacity-70"
        />

        <VSheet
          color="transparent"
          class="my-4 text-center"
        >
          <div class="text-body-small opacity-70 mb-4">
            {{ $t('The device has an access token that does not match the token saved in the application. Enter the device token to continue.') }}
          </div>

          <div
            v-if="activeDevice"
            class="text-caption opacity-70 mb-2"
          >
            {{ activeDevice.title || activeDevice.name }} · {{ activeDevice.ip }}
          </div>

          <VTextField
            v-model="token"
            :label="$t('Access token')"
            :disabled="!activeDevice || loading"
            :error-messages="error"
            autocomplete="off"
            :autofocus="false"
            bg-color="primary-darken"
            single-line
            density="compact"
            @keyup.enter="submitToken"
          >
            <template #append-inner>
              <VBtn
                color="default"
                size="small"
                variant="plain"
                density="comfortable"
                icon="mdi-chevron-right"
                :loading="loading"
                :disabled="!activeDevice"
                @click="submitToken"
              />
            </template>
          </VTextField>

          <div
            v-if="!activeDevice"
            class="text-body-small opacity-70 mt-4"
          >
            {{ $t('Select a device to continue') }}
          </div>

          <VSheet
            color="transparent"
            class="mt-4"
          >
            <VDivider class="my-6" />

            <VBtn
              :text="$t('Scan devices')"
              color="green"
              variant="flat"
              prepend-icon="mdi-swap-horizontal"
              density="comfortable"
              @click="scanDevices"
            />
          </VSheet>
        </VSheet>
      </VCardText>
    </VCard>
  </VSheet>
</template>

<style scoped>

</style>
