<script>
export default {
  name: "ProfilePage",
  computed:{
    user(){
      return this.$store.getters['getUser']
    }
  }
}
</script>

<template>
</template>

<style scoped lang="scss">

</style>
