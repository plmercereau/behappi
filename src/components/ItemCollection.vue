<template lang="pug">
  v-container(fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, align-center)
      v-flex(xs12)
        tool-bar(:title="view.title", search, v-model="search")
        card-list
          v-card-actions(slot="actions")
            create-button(fab, :schema="schema")
          v-flex(d-flex xs12 sm6 md4, v-for="doc in filteredList" :key="doc.id")
            card-item(:doc="doc", :schema="schema", component="card")
              div(v-if="subtitle(doc, true)") {{subtitle(doc)}}
</template>

<script>
  import * as firebase from 'firebase'
  import {filterCollection, sortCollection, title} from '../schemas'
  // TODO create FAB button visible only under certain conditions described in the schema file
  export default {
    name: 'ItemCollection',
    props: ['schema', 'viewName'],
    data () {
      return {
        collection: [],
        search: '' // TODO search param in schema file
      }
    },
    methods: { // TODO export action and params in schema file
      subtitle (item, asValue = false) {
        return title(this.schema.collectionView.default.subtitle, this.schema, item, asValue)
      }
    },
    computed: {
      filteredList () {
        if (this.collection) {
          return this.collection.filter(doc => {
            let found = false
            if (!this.schema.searchProperties) found = true
            else {
              this.schema.searchProperties.forEach(propName => {
                found = doc[propName].toLowerCase().includes(this.search.toLowerCase())
              })
            }
            return found
          })
        } else return []
      },
      view () {
        return this.schema.collectionView[this.viewName || 'default']
      }
    },
    mounted () {
      this.$bind('collection', firebase.firestore().collection(this.schema.collection))
        .then((collection) => {
          this.collection = sortCollection(this.schema.collectionView.default.sort,
            filterCollection(this.schema.collectionView.default.filters, collection))
        })
        .catch((error) => {
          console.log('error in loading: ', error)
        })
    }
  }
</script>

<style scoped>
</style>
