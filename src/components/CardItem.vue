<template lang="pug">
  v-card(:to="`/${doc._schema || schema.name}/${doc.id}`")
    v-card-media(v-if="view.media")
      map-image(v-if="view.media.property && (schema.properties[view.media.property].type === 'location') && doc[view.media.property]",
      :locationProperty="view.media.property",
      :schema="schema",
      :doc="doc")
    v-card-title(primary-title)
      div
        div(class="headline mb-0") {{title}}
        slot
      v-spacer
      i(v-if="schema.mixins && schema.mixins.includes('workflow')") {{doc.status}}
</template>

<script>
  import _ from 'lodash'

  export default {
    props: ['doc', 'schema'],
    name: 'CardItem',
    computed: {
      view () {
        return this.schema.collectionView['default']
      },
      title () { // TODO merge with other title methods?
        let title = _.template(this.schema.title)
        return _.isObject(this.doc) && this.doc.id ? title(this.doc) : ''
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
