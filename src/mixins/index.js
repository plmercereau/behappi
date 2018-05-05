import _ from 'lodash'

export var listMixin = {
  data () {
    return {
      collection: [],
      search: ''
    }
  },
  computed: {
    view () {
      return this.schema.collectionView[this.viewName || 'default']
    }
  }
}

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
      if (!titleObject) return ''
      if (titleObject.property) return doc[titleObject.property]
      if (titleObject.text) return titleObject.text
      return titleObject
    },
    sortedCollection (collectionName) { // TODO other than string compare
      let sortProperties = this.schema.properties[collectionName].sort
      let collection = []
      if (this.schema.properties[collectionName].schema) {
        collection = Object.keys(this.doc[collectionName]).map(key => { return this.doc[collectionName][key] })
        if (_.isArray(sortProperties)) {
          sortProperties.forEach(sortProp => {
            collection = collection.sort((a, b) => {
              let sA = a[sortProp[0]]
              let sB = b[sortProp[0]]
              if (_.isString(sA) && _.isString(sB)) return sA.localeCompare(sB) * (sortProp[1] === 'ASC' ? 1 : -1)
              else return 0
            })
          })
        }
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
