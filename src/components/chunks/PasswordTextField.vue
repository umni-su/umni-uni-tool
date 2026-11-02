<script>
export default {
  name: "PasswordTextField",
  data(){
    return {
      hidden: true
    }
  }
}
</script>

<template>
  <VTextField
    class="mt-4"
    :hide-details="$slots.text"
    :type="hidden ? 'password' : 'text'"
  >
    <template
      v-if="$slots.text"
      #details
    >
      <slot
        name="text"
      />
    </template>
    <template #append-inner>
      <VBtn
        variant="plain"
        density="compact"
        :icon="hidden? 'mdi-eye' : 'mdi-eye-off'"
        color="default"
        @click="hidden = !hidden"
      />
    </template>
  </VTextField>
</template>

<style scoped lang="scss">

</style>
