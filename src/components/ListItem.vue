<template lang="pug">
  v-list-tile(:to="view.uri.replace('{id}', doc.id)")
    v-list-tile-content
      v-list-tile-title(primary-title) {{title}}
      v-list-tile-sub-title
        slot
</template>

<script>
  import _ from 'lodash'

  export default {
    props: ['doc', 'schema', 'property'],
    name: 'ListItem',
    computed: {
      view () {
        return this.property.schema.collectionView['default'] || this.schema.collectionView['default']
      },
      title () {
        let titleString = this.property.title || this.schema.title
        let titleTemplate = _.template(titleString)
        return _.isObject(this.doc) && this.doc.id ? titleTemplate(this.doc) : ''
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
