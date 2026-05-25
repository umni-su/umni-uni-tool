<script>

export default {
  name: 'DateTimeWidget',
  data(){
    return {
      showAllCaps: false
    }
  },
  computed: {
    sysinfo() {
      return this.$store.getters['getSystemInfo']
    },
    date() {
      return this.sysinfo !== null ? new Date(this.sysinfo?.date) : new Date()
    },
    hostname() {
      return this.$store.getters['getHostname'].toUpperCase()
    },
    title() {
      return this.sysinfo?.title
    },
    capabilities(){
      return this.$store.getters['getCapabilities']
    },
    day() {
      return this.date.getDate().toString().padStart(2, '0')
    },
    month() {
      return (this.date.getMonth() + 1).toString().padStart(2, '0')
    },
    capMaxLen(){
      return this.capabilities.length > 4 ? 4 : this.capabilities.length
    }
  }
}
</script>

<template>
  <VCard
    v-if="date"
    color="primary"
    height="100%"
    variant="tonal"
  >
    <VCardText class="datetime">
      <div class="text-headline-medium font-weight-black">
        {{ hostname }}
      </div>
      <div
        v-if="title"
        class="text-headline-small"
      >
        {{ title }}
      </div>
      <div class="text-body-small mt-1">
        {{ $t('Allowed capabilities') }}
      </div>
      <div class="text-center mt-4">
        <VChip
          v-for="cap in showAllCaps ? capabilities : capabilities.slice(0, capMaxLen)"
          :key="cap"
          size="small"
          class="mr-1 mb-1"
          :text="cap"
          rounded="pill"
        />
        <VChip
          v-if="capabilities.length >capMaxLen"
          size="small"
          :prepend-icon="showAllCaps ? 'mdi-chevron-left' : 'mdi-chevron-right'"
          class="mr-1 mb-1"
          :text="showAllCaps? $t('Less') : $t('More')"
          rounded="pill"
          @click="showAllCaps = !showAllCaps"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">
.datetime {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .time {
    font-size: 84px;
    line-height: 80px;
  }

  .date {
    color: var(--u-color-secondary);
    font-size: 24px;
  }

  .hostname {
    margin-top: 6px;
    font-weight: bold;
    color: var(--u-color-secondary)
  }
}
</style>
