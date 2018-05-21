<template lang="pug">
  v-container
    v-flex(xs12 class="text-xs-center")
      v-progress-circular(:size="50" :width="3" indeterminate color="red")
</template>

<script>
  export default {
    name: 'Loading'
  }
</script>

<style scoped>

</style>
