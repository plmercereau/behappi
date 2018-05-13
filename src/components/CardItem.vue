<template lang="pug">
  v-card(:to="view.uri.replace('{id}', doc.id)")
    v-card-media(v-if="view.media")
      map-image(v-if="view.media.property && (schema.properties[view.media.property].type === 'location') && doc[view.media.property]",
      :locationProperty="view.media.property",
      :schema="schema",
      :doc="doc")
    v-card-title(primary-title)
      div
        div(class="headline mb-0") {{title(doc, schema.title)}}
        slot
      v-spacer
      i {{doc.status}}
</template>

<script>
  import {schemaMixin} from '../mixins'

  export default {
    props: ['doc', 'schema'],
    name: 'CardItem',
    mixins: [schemaMixin],
    computed: {
      view () {
        return this.schema.collectionView['card'] || this.schema.collectionView['default']
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
