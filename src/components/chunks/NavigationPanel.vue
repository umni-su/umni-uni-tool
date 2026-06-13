<script>
import DebugSwitcher from "@/components/chunks/DebugSwitcher.vue";
import {invoke} from "@tauri-apps/api/core";

export default {
  name: "NavigationPanel" ,
  components: {DebugSwitcher},
  data(){
    return {
      rail: true,
      open:true,
      scanHandler: null
    }
  },
  computed:{
    isOpen(){
      return this.$store.getters['isSidebarOpen']
    },

  },
  watch:{
    isOpen(v){
      this.open=v;
    },
    open(v){
      this.$store.commit('setSidebarOpen', v);
    }
  },
  unmounted() {
    clearInterval(this.scanHandler)
  },
  created() {
    this.scanHandler = setInterval(async () => {
      await invoke('start_mdns_discovery');
    }, 60000)
    this.rail = this.mobile
    this.open = this.isOpen
  },
  methods:{
    async startScan(){
      await this.initScanner()
    },
    async initScanner() {
      this.$store.commit('setScanMode', true);
      try {
        await invoke('start_mdns_discovery');
      } catch (err) {
        console.error("Ошибка mDNS:", err);
      }
    },
  },
  mobile(){
    return this.$vuetify.display.mobile
  }
}
</script>

<template>
  <VNavigationDrawer
    v-model="open"
    :rail="rail"
    width="300"
    rounded="0"
  >
    <VList>
      <VListSubheader>
        {{ $t('Devices') }}
      </VListSubheader>
      <VListItem
        prepend-icon="mdi-memory"
        :title="$t('My devices')"
        :to="{name: 'devices'}"
      />
      <VListSubheader>
        {{ $t('Advanced') }}
      </VListSubheader>
      <VListItem
        prepend-icon="mdi-arrow-decision-auto"
        :title="$t('Automations')"
        :to="{name: 'automations'}"
      />
      <VListItem
        prepend-icon="mdi-cog"
        :to="{name: 'settings'}"
        :title="$t('Settings')"
      />

      <DebugSwitcher
        as-list-item
      />
    </VList>
    <template #append>
      <VSheet
        class="pa-4"
        color="transparent"
      >
        <VBtn
          block
          prepend-icon="mdi-refresh"
          :text="$t('Scan devices')"
          @click="startScan"
        />
      </VSheet>
    </template>
  </VNavigationDrawer>
</template>

<style scoped lang="scss">

</style>
