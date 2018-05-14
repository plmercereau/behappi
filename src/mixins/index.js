import {sortCollection, title} from '../schemas'

export var schemaMixin = {
  data () {
    let doc = this.doc ? {} : {doc: {}} // do not declare doc if there is already a doc prop
    return {
      ...doc,
      loading: true
    }
  },
  methods: {
    title (doc, titleObject) { // TODO convert into a filter?
      return title(titleObject, this.schema, doc)
    },
    sortedCollection (collectionName) {
      // TODO other than string compare
      let sortProperties = this.schema.properties[collectionName].schema.collectionView.default.sort
      let collection = []
      if (this.schema.properties[collectionName].schema) {
        collection = sortCollection(sortProperties, this.doc[collectionName])
      } else {
        // TODO for enum
        collection = Object.keys(this.doc[collectionName]).map(id => id)
      }
      return collection
    }
  },
  watch: {
    doc (newValue) {
      // if (newValue.location) this.defaultProject.location = newValue.location // TODO garder et generaliser?
      if (newValue.id) {
        this.loading = false
      }
    }
  }
}
