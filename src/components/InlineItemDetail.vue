<template lang="pug">
   v-card(:to="view.item.uri.replace('{id}', doc.id)")
    v-card-media(v-if="view.item.media" height="200px")
      map-image(v-if="view.item.media.property && (schema.properties[view.item.media.property].type === 'area' || schema.properties[view.item.media.property].type === 'point') && doc[view.item.media.property]", :locationProperty="view.item.media.property", :schema="schema", :doc="doc")
    v-card-title(primary-title)
      div
        div(class="headline mb-0") {{title(doc, view.item.title)}}
        slot
      v-spacer
      i {{doc.status}}
</template>

<script>
  import {schemaMixin} from '../mixins'

  export default {
    props: ['doc', 'schema', 'viewName'],
    name: 'InlineItemDetail',
    mixins: [schemaMixin],
    computed: {
      view () {
        return this.schema.listViews[this.viewName || 'default']
      }
    }
    // TODO create a card-media that can be used in other cards (e.g. project or mission list)
  }
</script>

<style scoped>

</style>
