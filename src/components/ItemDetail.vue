<template lang="pug">
  v-card
    v-card-title(primary-title)
      form(novalidate @submit.prevent="save")
        div
          h2 {{title}}
          slot
</template>

<script>
  export default {
    name: 'ItemDetail',
    props: ['title', 'save']
  }
</script>

<style scoped>

</style>
