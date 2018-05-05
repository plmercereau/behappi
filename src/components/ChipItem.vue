<template lang="pug">
  v-chip(:to="view.uri.replace('{id}', doc.id)") {{title(doc, schema.title)}}
</template>

<script>
  import {schemaMixin} from '../mixins'

  export default {
    props: ['doc', 'schema'],
    name: 'ListItem',
    mixins: [schemaMixin],
    computed: {
      view () {
        return this.schema.collectionView['chip'] || this.schema.collectionView['default']
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
