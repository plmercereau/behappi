import {addComputedValues, filterCollection, sortCollection} from '../schemas'
import * as firebase from 'firebase'
import _ from 'lodash'
import {DEFAULT_CHIP_PROPERTY, DEFAULT_LOCATION, DEFAULT_ZOOM} from '../config'

export var schemaMixin = {
  data () {
    let fbDoc = this.fbDoc ? {} : {fbDoc: {}} // do not declare doc if there is already a doc prop
    return {
      ...fbDoc,
      loading: true
    }
  },
  methods: {
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
    },
    exists (object) {
      return Boolean(object)
    }
  },
  watch: {
    doc (newValue) {
      if (newValue.id) {
        this.loading = false
      }
    }
  },
  computed: {
    docTitle () { // TODO merge other title functions, and take computed properties into consideration
      let titleTemplate = _.template(this.schema.title)
      return _.isObject(this.doc) && this.doc.id ? titleTemplate(this.doc) : ''
    },
    doc () {
      return addComputedValues(this.schema, this.fbDoc)
    }
  }
}

export var formMixin = {
  data () {
    return {
      form: {},
      editToggle: false
    }
  },
  methods: {
    edit () {
      this.editToggle = true
    },
    cancel () {
      this.editToggle = false
      this.reset()
    },
    reset () {
      let form = Object.assign({}, this.doc)
      Object.keys(this.schema.properties).map(key => {
        if (this.schema.properties[key].type === 'location') {
          let googleLocation = {
            lat: DEFAULT_LOCATION.latitude,
            lng: DEFAULT_LOCATION.longitude
          }
          if (form[key]) {
            googleLocation = {
              lat: form[key].latitude,
              lng: form[key].longitude
            }
          }
          if (!form[this.schema.properties[key].zoom]) {
            form[this.schema.properties[key].zoom] = DEFAULT_ZOOM
          }
          form[key] = googleLocation
          form[`reported${key}`] = googleLocation
        } else if (this.schema.properties[key].type === 'collection') {
          form[`${key}Collection`] = []
          if (this.schema.properties[key].unique) {
            if (this.schema.properties[key].schema) {
              form[key] = form[key] && form[key].id
            }
          } else {
            form[key] = form[key] && Object.keys(form[key]).map(id => {
              if (this.schema.properties[key].schema) {
                let properyName = (this.schema.properties[key].schema.title && this.schema.properties[key].schema.title.property) || DEFAULT_CHIP_PROPERTY
                return {value: id, text: form[key][id][properyName]}
              } else return id
            })
          }
          if (this.schema.properties[key].schema) {
            firebase.firestore().collection(this.schema.properties[key].schema.collection).get().then(snapshot => {
              let titleTemplate = _.template(this.schema.properties[key].schema.title)
              filterCollection(this.schema.properties[key].schema.collectionView.default.filters, snapshot.docs)
                .forEach(doc => {
                  // TODO doc.data() ne charge pas les references firebase a l'interieur de doc.data()
                  form[`${key}Collection`].push({
                    value: doc.id,
                    text: titleTemplate(doc.data())
                  })
                })
            })
          } else if (this.schema.properties[key].options) {
            form[`${key}Collection`] = Object.keys(this.schema.properties[key].options).map(cursor => {
              return {value: cursor, text: this.schema.properties[key].options[cursor]}
            })
          }
        }
      })
      this.form = Object.assign({}, this.form, form)
    },
    constructDataWithProperties (maskedProperties) {
      let cleanedForm = {}
      let initialForm = this.form
      let schema = this.schema
      let doc = this.doc || {}
      Object.keys(initialForm)
        .filter(key => (maskedProperties.indexOf(key) > -1))
        .map(key => {
          let val = doc[key]
          if (schema.properties[key].type === 'location') {
            val = {
              latitude: initialForm[`reported${key}`].lat,
              longitude: initialForm[`reported${key}`].lng
            }
            const zoomProp = schema.properties[key].zoom
            if (!_.isEqual(doc[zoomProp], initialForm[zoomProp])) {
              cleanedForm[zoomProp] = initialForm[zoomProp]
            }
          } else if (schema.properties[key].type !== 'collection') {
            val = initialForm[key]
          }
          if (schema.properties[key].type === 'collection') {
            if (initialForm[key]) {
              if (schema.properties[key].unique) {
                if (schema.properties[key].schema) {
                  val = firebase.firestore().collection(schema.properties[key].schema.collection).doc(initialForm[key])
                  if (((val || doc[key]) && (val !== doc[key])) || (!_.isEqual(val.id, doc[key].id))) cleanedForm[key] = val
                } else {
                  if (!_.isEqual(doc[key], initialForm[key])) cleanedForm[key] = initialForm[key]
                }
              } else {
                val = initialForm[key].reduce((obj, id) => {
                  let ref = true
                  if (schema.properties[key].schema) {
                    if (_.isObject(id)) {
                      ref = firebase.firestore().collection(schema.properties[key].schema.collection).doc(id.value)
                    } else if (schema.properties[key].component === 'chip') {
                      ref = firebase.firestore().collection(schema.properties[key].schema.collection).doc()
                      let properyName = (schema.properties[key].schema.title && schema.properties[key].schema.title.property) || DEFAULT_CHIP_PROPERTY
                      let newValue = { // TODO addDocument
                        [properyName]: id,
                        userId: this.$store.getters.user.id
                      }
                      ref.set(newValue)
                    } else {
                      ref = firebase.firestore().collection(schema.properties[key].schema.collection).doc(id)
                    }
                  }
                  obj[ref.id] = ref
                  return obj
                }, {})
                doc[key] && Object.keys(doc[key]).forEach(id => {
                  if (!val[id]) {
                    val[id] = firebase.firestore.FieldValue.delete()
                  } else {
                    delete val[id]
                  }
                })
                cleanedForm[key] = val
              }
            }
          } else {
            if (!_.isEqual(doc[key], val)) cleanedForm[key] = val
          }
        })
      return cleanedForm
    },
    updateMapCenter (fieldName) { // TODO move map editor into a dedicated component
      this.form[fieldName] = _.clone(this.form[`reported${fieldName}`])
    },
    updateCenter (field, event) {
      this.form[`reported${field}`] = {
        lat: event.lat(),
        lng: event.lng()
      }
    },
    updateField (field, event) {
      this.$set(this.form, field, event)
    }
  }
}
