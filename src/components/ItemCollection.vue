<template lang="pug">
  v-container(fill-height fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, justify-center)
      v-flex(xs12)
        tool-bar(:title="view.title", search, v-model="search", :actions="actions")
        create-button(v-if="view.create" fab, :parentSchema="schema")
        loading(v-if="loading")
        template(v-else-if="collection.length > 0")
          card-list
            v-flex(d-flex xs12 sm6 md4, v-for="doc in filteredList" :key="doc.id")
              card-item(:doc="doc", :schema="schema", component="card")
                div {{subtitle(doc)}}
        v-alert(v-else :value="collection.length === 0" type="info") Empty collection
</template>

<script>
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import XLSX from 'xlsx'
  import {addComputedValues, filterCollection, sortCollection} from '../schemas'
  // TODO create FAB button visible only under certain conditions described in the schema file
  export default {
    name: 'ItemCollection',
    props: ['schema', 'viewName'],
    data () {
      return {
        loading: true,
        fbCollection: [],
        search: '' // TODO search param in schema file
      }
    },
    methods: {
      subtitle (item) {
        let template = this.schema.collectionView.default.subtitle || ''
        return _.template(template)(item)
      },
      denormalizeDocument (sheets, schema, doc, recursive = true) {
        // TODO forget about recursive param and test if doc already present in 'sheets'?
        // TODO in this case (and maybe in any case) test if the firestore document is loaded already (i.e. load doc instead of ref)
        if (!doc || !schema || !sheets) return
        let fields = schema.collectionView.default.export || Object.keys(schema.properties)
        if (!sheets[schema.name] || !sheets[schema.name].data) {
          sheets[schema.name] = {
            data: {},
            headers: this.denormalizeHeaders(schema)
          }
        }
        let obj = {}
        fields.filter(field => doc[field]).forEach(field => {
          let property = schema.properties[field]
          switch (property.type) {
            case 'location':
              obj[field + '_latitude'] = doc[field].latitude
              obj[field + '_longitude'] = doc[field].longitude
              obj[schema.properties[field].zoom] = doc[schema.properties[field].zoom]
              break
            case 'collection':
              if (property.unique) {
                if (property.schema && recursive) { // TODO change scenario according to param
                  this.denormalizeDocument(sheets, property.schema, doc[field], false)
                }
                obj[field] = doc[field].id || doc[field].value || doc[field]
              } else if (property.schema && recursive) {
                Object.keys(doc[field]).forEach(childDoc => {
                  this.denormalizeDocument(sheets, property.schema, doc[field][childDoc], false)
                })
              }
              break
            default:
              obj[field] = doc[field]
              break
          }
        })
        obj.id = doc.id || doc.value || doc
        sheets[schema.name].data[obj.id] = obj
      },
      denormalizeHeaders (schema) {
        return this.exportFields(schema).reduce((obj, fieldName) => {
          if (schema.properties[fieldName].type === 'collection') {
            if (schema.properties[fieldName].unique) {
              obj.push(fieldName)
            }
          } else if (schema.properties[fieldName].type === 'location') {
            obj.push(fieldName + '_latitude')
            obj.push(fieldName + '_longitude')
            obj.push(schema.properties[fieldName].zoom)
          } else {
            obj.push(fieldName)
          }
          return obj
        }, ['id'])
      },
      exportFields (schema) {
        return schema.collectionView.default.export || Object.keys(schema.properties)
      },
      excelExport () { // TODO put some parameters
        let sheets = {}
        let arrayCollection = (_.isArray(this.collection)) ? this.collection : Object.keys(this.collection).map(name => {
          return {id: name, ...this.collection[name]}
        })
        arrayCollection.forEach(doc => {
          this.denormalizeDocument(sheets, this.schema, doc)
        })
        const wb = XLSX.utils.book_new()
        Object.keys(sheets).forEach(name => {
          const ws = XLSX.utils.json_to_sheet(Object.keys(sheets[name].data).map(id => sheets[name].data[id]), {header: sheets[name].headers})
          XLSX.utils.book_append_sheet(wb, ws, name)
        })
        XLSX.writeFile(wb, `${this.schema.name}.xlsx`)
      }
    },
    computed: {
      collection () {
        return sortCollection(this.schema.collectionView.default.sort,
          filterCollection(this.schema.collectionView.default.filters, this.fbCollection))
          .map(item => {
            return addComputedValues(this.schema, item)
          })
      },
      filteredList () {
        if (!_.isEmpty(this.collection)) {
          return this.collection.filter(doc => {
            let found = false
            if (!this.schema.searchProperties) found = true
            else {
              this.schema.searchProperties
                .filter(path => _.get(doc, path))
                .forEach(path => {
                  if (_.deburr(_.get(doc, path).toLowerCase()).includes(_.deburr(this.search.toLowerCase()))) found = true
                })
            }
            return found
          })
        } else return []
      },
      view () {
        let role = this.$store.getters.user ? this.$store.getters.user.role : 'public'
        return _.merge(this.schema.collectionView.default || {}, this.schema.collectionView[role] || {})
      },
      actions () {
        return !this.loading && [
          {
            title: 'Export to Excel',
            method: () => this.excelExport()
          }
        ]
      }
    },
    firestore () {
      return {
        fbCollection: firebase.firestore().collection(this.schema.collection)
      }
    },
    mounted () {
      this.$bind('fbCollection', firebase.firestore().collection(this.schema.collection))
        .then((col) => {
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
