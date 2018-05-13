<template lang="pug">
  v-container(fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, align-center)
      v-flex(xs12)
        slot
</template>

<script>
  export default {
    name: 'Page'
  }
</script>

<style scoped>

</style>
