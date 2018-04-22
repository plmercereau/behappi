export var listMixin = {
  data () {
    return {
      collection: [],
      search: ''
    }
  },
  computed: {
    view () {
      return this.schema.listViews[this.viewName || 'default']
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
      if (titleObject.property) return doc[titleObject.property]
      if (titleObject.text) return titleObject.text
      return titleObject
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
