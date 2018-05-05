<template lang="pug">
  v-list-tile(:to="view.uri.replace('{id}', doc.id)")
    v-list-tile-content
      v-list-tile-title(primary-title) {{title(doc, schema.title)}}
      v-list-tile-sub-title
        slot
</template>

<script>
  import {schemaMixin} from '../mixins'

  export default {
    props: ['doc', 'schema'],
    name: 'ListItem',
    mixins: [schemaMixin],
    computed: {
      view () {
        return this.schema.collectionView['list'] || this.schema.collectionView['default']
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
