<template lang="pug">
  v-card
    v-card-title(v-if="title" primary-title)
      div
        h2 {{title}}
    slot(name="actions")
    v-card-text(fluid, grid-list-md)
      v-layout(row, wrap)
        slot
</template>

<script>
  export default {
    name: 'CardList',
    props: ['title']
  }
</script>

<style scoped>

</style>
