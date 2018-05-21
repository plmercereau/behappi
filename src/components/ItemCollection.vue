<template lang="pug">
  v-container(fill-height fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, justify-center)
      v-flex(xs12)
        tool-bar(:title="view.title", search, v-model="search")
        create-button(fab, :parentSchema="schema")
        loading(v-if="loading")
        template(v-else)
          card-list(v-if="collection.length > 0 && (!viewName || viewName === 'card' || viewName === 'default')")
            v-flex(d-flex xs12 sm6 md4, v-for="doc in filteredList" :key="doc.id")
              card-item(:doc="doc", :schema="schema", component="card")
                div {{subtitle(doc)}}
          v-alert(:value="collection.length === 0" type="info") Empty collection
</template>

<script>
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import {addComputedValues, filterCollection, sortCollection} from '../schemas'
  // TODO create FAB button visible only under certain conditions described in the schema file
  export default {
    name: 'ItemCollection',
    props: ['schema', 'viewName'],
    data () {
      return {
        loading: true,
        collection: [],
        search: '' // TODO search param in schema file
      }
    },
    methods: {
      subtitle (item) {
        let template = this.schema.collectionView.default.subtitle || ''
        return _.template(template)(item)
      }
    },
    computed: {
      filteredList () {
        if (!_.isEmpty(this.collection)) {
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
        .then((col) => {
          this.collection = sortCollection(this.schema.collectionView.default.sort,
            filterCollection(this.schema.collectionView.default.filters, col))
            .map(item => {
              return addComputedValues(this.schema, item)
            })
          this.loading = false
        })
        .catch((error) => {
          console.log('error in loading: ', error)
        })
    }
  }
</script>

<style scoped>
</style>
