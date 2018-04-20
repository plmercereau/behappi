<template lang="pug">
  v-card(:to="schema.uri.replace('{id}', doc.id)")
    v-card-media(height="200px")
      map-image(v-if="schema.media.type === 'map' && doc[schema.media.property]", :locationProperty="schema.media.property", :schema="schema", :doc="doc")
    v-card-title(primary-title)
      div
        div(class="headline mb-0") {{doc.name}}
        slot
      v-spacer
      i {{doc.status}}
</template>

<script>
  export default {
    props: ['schema', 'doc'],
    name: 'InlineItemDetail'
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
