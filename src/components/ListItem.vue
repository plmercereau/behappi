<template lang="pug">
  v-list-tile(:to="`/${schema.name}/${doc.id}`")
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
      title () {
        let titleTemplate = _.template(this.property.title || this.schema.title)
        return _.isObject(this.doc) && this.doc.id ? titleTemplate(this.doc) : ''
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
