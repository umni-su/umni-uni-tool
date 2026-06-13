<script>
export default {
  name: "AppLoader",
  computed: {
    loading() {
      return this.$store.getters['isLoading']
    },
    theme() {
      return this.$store.getters['getTheme']
    }
  }
}
</script>

<template>
  <VProgressCircular
    v-if="loading"
    indeterminate
    :theme="theme"
    color="primary"
    class="loader opacity-50"
  />
</template>

<style scoped lang="scss">
.loader {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 10;
}
</style>
