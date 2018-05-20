<template lang="pug">
  v-container(fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, align-center)
      v-flex(xs12)
        tool-bar(:title="view.title", search, v-model="search")
        card-list(v-if="!viewName || viewName === 'card' || viewName === 'default'")
          v-card-actions(slot="actions")
            create-button(fab, :parentSchema="schema")
          v-flex(d-flex xs12 sm6 md4, v-for="doc in filteredList" :key="doc.id")
            card-item(:doc="doc", :schema="schema", component="card")
              div {{subtitle(doc)}}
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
        fbCollection: [],
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
      collection () {
        if (this.fbCollection) {
          let initialCollection = sortCollection(this.schema.collectionView.default.sort,
            filterCollection(this.schema.collectionView.default.filters, this.fbCollection))
          return initialCollection.map(item => {
            return addComputedValues(this.schema, item)
          })
        } else return []
      },
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
        return this.schema.collectionView[this.viewName || 'default'] || this.schema.collectionView['default']
      }
    },
    firestore () {
      return {
        fbCollection: firebase.firestore().collection(this.schema.collection)
      }
    }
  }
</script>

<style scoped>
</style>
