<template lang="pug">
  v-container(fluid)
    v-layout(row, align-center)
      v-flex(xs12 sm6 offset-sm3)
        v-alert(:value="true" type="error") Page not found
</template>

<script>
  export default {
    name: 'PageNotFound'
  }
</script>

<style scoped>

</style>
