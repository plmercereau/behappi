<template lang="pug">
  v-chip(:to="`/${doc._schema || schema.name}/${doc.id}`") {{doc[schema.title.property]}}
</template>

<script>
  export default {
    props: ['doc', 'schema'],
    name: 'ListItem'
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
