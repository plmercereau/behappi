<template lang="pug">
  v-flex(xs12)
    v-card
      v-card-title(primary-title)
        div
          slot(name="title")
      v-card-actions
        slot(name="actions")
</template>

<script>
  export default {
    name: 'InlineItemDetail'
    // TODO remove component - too basic => useless
  }
</script>

<style scoped>

</style>
