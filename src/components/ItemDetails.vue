<template lang="pug">
  v-container(fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, align-center)
      v-flex(xs12)
        tool-bar(:title="doc.name", :actions="actions", :edit="editToggle")
          v-btn(v-show="!errors.any()" @click="saveItem()") Save
          v-btn(@click="reset") Reset
          v-btn(@click="cancel") Cancel
          v-dialog(v-model="deleteDialogToggle" max-width="500px")
            v-card
              v-card-title Are you sure you want to delete this document?
              v-card-actions
                v-btn(color="error" flat @click.stop="deleteItem") Delete
                v-btn(color="primary" flat @click.stop="deleteDialogToggle=false") Cancel
        v-tabs(v-model="tab")
          v-tab(v-for="sectionName in view.sectionsOrder" :key="sectionName" v-show="isActiveTab(sectionName)") {{title(doc, view.sections[sectionName].title)}}
        v-tabs-items(v-model="tab")
          v-tab-item(v-for="sectionName in view.sectionsOrder" :key="sectionName")
            v-card
              v-card-text(v-if="editToggle")
                form(novalidate @submit.prevent="saveItem")
                  template(v-for="name in view.sections[sectionName].edit")
                    div(v-if="schema.properties[name].type==='string'" class="caption") {{schema.properties[name].title ? schema.properties[name].title : '' }}
                      v-text-field(
                        autofocus,
                        v-model="form[name]",
                        :id="'form-' + name",
                        :label="schema.properties[name].placeholder",
                        v-validate="schema.properties[name].validation",
                        :doc-vv-name="'form-' + name")
                      <!--TODO required, doc-vv-name-->
                    div(v-if="schema.properties[name].type==='collection' && schema.properties[name].component!=='card' && schema.properties[name].unique") {{schema.properties[name].title ? schema.properties[name].title : '' }}
                      v-select(
                        autofocus,
                        :chips="schema.properties[name].component === 'chip'",
                        :autocomplete="schema.properties[name].autocomplete",
                        v-model="form[name]",
                        :items="form[name+'Collection']"
                        :label="schema.properties[name].placeholder",
                        single-line)
                    div(v-if="schema.properties[name].type==='collection' && schema.properties[name].component!=='card' && !schema.properties[name].unique") {{schema.properties[name].title ? schema.properties[name].title : '' }}
                      v-select(
                      multiple,
                      autofocus,
                      :tags="schema.properties[name].create",
                      :return-object="schema.properties[name].create",
                      :chips="schema.properties[name].component === 'chip'",
                      :deletable-chips="schema.properties[name].component === 'chip'",
                      :autocomplete="schema.properties[name].autocomplete",
                      v-model="form[name]",
                      :items="form[name+'Collection']"
                      :label="schema.properties[name].placeholder",
                      single-line)
                    v-container(v-if="schema.properties[name].type==='location'", fluid ,grid-list-md)
                      v-layout(row, wrap)
                        v-flex(d-flex xs12 sm6 md4)
                          v-container(fluid)
                            v-layout(row)
                              v-flex
                                div(class="caption") {{schema.properties[name].placeholder}}
                                v-text-field(
                                autofocus
                                type="number"
                                v-model.number="form['reported'+name].lat",
                                :id="'form-' + name + '-latitude'",
                                label="Latitude",
                                v-validate="",
                                @change="updateMapCenter(name)",
                                :doc-vv-name="'form-' + name + '-latitude'")
                                v-text-field(
                                autofocus
                                type="number"
                                v-model.number="form['reported'+name].lng",
                                :id="'form-' + name + '-latitude'",
                                label="Longitude",
                                v-validate="",
                                @change="updateMapCenter(name)",
                                :doc-vv-name="'form-' + name + '-latitude'")
                                v-slider(label="Zoom" :max="20" v-model="form[schema.properties[name].zoom]")
                        v-flex(d-flex xs12 sm6 md8)
                          gmap-map(
                          :center="form[name]"
                          @center_changed="updateCenter(name, $event)"
                          :zoom="form[schema.properties[name].zoom]"
                          @zoom_changed="updateField(schema.properties[name].zoom, $event)"
                          :map-type-id="mapType"
                          style="width: 320px; height: 200px")
                            gmap-marker(v-if="schema.properties[name].markers && schema.properties[name].markers.self" :position="form['reported'+name]")
              v-card-text(v-if="!editToggle")
                create-button(v-for="name in view.sections[sectionName].read",
                  v-if="schema.properties[name].component ==='card'",
                  :schema="schema.properties[name].schema", :parentData="doc") {{title(doc, schema.properties[name].schema.collectionView.card.create.title)}}
                div(v-for="name in view.sections[sectionName].read" v-if="doc[name]" :key="name")
                  div(:class="(view.sections[sectionName].subtitles && view.sections[sectionName].subtitles.includes(name)) ? 'title' : 'caption'") {{schema.properties[name].title ? schema.properties[name].title : '' }}
                  div(class="subheading")
                    div(v-if="schema.properties[name].type === 'string'") {{!schema.properties[name].enum ? doc[name]: doc[name] | labelEnum(schema.properties[name].enum)}}
                    div(v-if="schema.properties[name].type === 'date'") {{doc[name] | moment('DD-MM-YYYY HH:mm:ss')}}
                    router-link(v-else-if="schema.properties[name].type === 'collection' && schema.properties[name].schema && schema.properties[name].unique" :to="schema.properties[name].schema.collectionView.default.uri.replace('{id}', doc[name].id)") {{ title(doc[name], schema.properties[name].schema.title) }}
                    div(v-else-if="schema.properties[name].type === 'collection' && !schema.properties[name].schema && schema.properties[name].unique") {{ schema.properties[name].options[doc[name]] }}
                    template(v-else-if="schema.properties[name].type === 'collection' && schema.properties[name].schema && !schema.properties[name].unique")
                      v-container(v-if="schema.properties[name].component ==='card'" fluid, grid-list-md)
                        v-layout(row, wrap)
                          v-flex(dd-flex xs12 sm6 md4, v-for="doc in sortedCollection(name)" :key="doc.id")
                            card-item(:schema="schema.properties[name].schema", :doc="doc")
                      v-chip(v-else-if="schema.properties[name].component ==='chip'",
                        v-for="doc in sortedCollection(name)",
                        :key="doc.id") {{title(doc, schema.properties[name].schema.title)}}
                      v-list(v-else)
                        list-item(v-for="doc in sortedCollection(name)" :key="doc.id", :schema="schema.properties[name].schema", :doc="doc")
                    div(v-else-if="schema.properties[name].type === 'collection' && !schema.properties[name].schema && !schema.properties[name].unique")
                      v-chip(v-if="schema.properties[name].component ==='chip'",
                        v-for="val in sortedCollection(name)",
                        :key="name+val") {{schema.properties[name].options[val]}}
                      v-list(v-if="schema.properties[name].component ==='list'")
                        v-list-tile(v-for="val in sortedCollection(name)" :key="name+val")
                          v-list-tile-content
                            v-list-tile-title(primary-title) {{schema.properties[name].options[val]}}
                    v-card(v-else-if="schema.properties[name].type === 'location'")
                      v-card-media
                        map-image(
                          :schema="schema",
                          :doc="doc",
                          :locationProperty="name")
                  v-divider
</template>

<script>
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import {schemaMixin} from '../mixins'
  import {updateDocument} from '../schemas'
  import {DEFAULT_CHIP_PROPERTY, DEFAULT_LOCATION, DEFAULT_ZOOM, MAP_TYPE} from '../config'

  export default {
    props: ['id', 'schema', 'viewName'],
    name: 'ItemDetails',
    mixins: [schemaMixin],
    data () {
      return {
        form: {},
        editToggle: false,
        // tab: this.schema.itemView[this.viewName || 'default'].sectionsOrder[0] || 'main',
        tab: '0',
        deleteDialogToggle: false
      }
    },
    methods: {
      isActiveTab (sectionName) {
        let props = this.editToggle ? this.view.sections[sectionName].edit : this.view.sections[sectionName].read
        let show = false
        if (this.editToggle) {
          props.map(propName => {
            if (this.schema.properties[propName].component !== 'card' || !this.schema.properties[propName].create) {
              show = true
            }
          })
        } else {
          props.map(propName => {
            if (!_.isEmpty(this.doc[propName]) || (this.schema.properties[propName].component === 'card' && this.schema.properties[propName].create)) {
              show = true
            }
          })
        }
        return show
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
      },
      saveItem () { // TODO form action instead of $validator.validateAll() && saveItem()
        let docRef = firebase.firestore().collection(this.schema.collection).doc(this.id)
        let form = {}
        Object.keys(this.form).map(key => {
          if (this.schema.properties[key]) {
            let val = this.doc[key]
            if (this.schema.properties[key].type === 'location') {
              val = {
                latitude: this.form[`reported${key}`].lat,
                longitude: this.form[`reported${key}`].lng
              }
              const zoomProp = this.schema.properties[key].zoom
              if (!_.isEqual(this.doc[zoomProp], this.form[zoomProp])) {
                form[zoomProp] = this.form[zoomProp]
              }
            } else if (this.schema.properties[key].type !== 'collection') {
              val = this.form[key]
            }
            if (this.schema.properties[key].type === 'collection') {
              if (this.form[key]) {
                if (this.schema.properties[key].unique) {
                  if (this.schema.properties[key].schema) {
                    val = firebase.firestore().collection(this.schema.properties[key].schema.collection).doc(this.form[key])
                    if (((val || this.doc[key]) && (val !== this.doc[key])) || (!_.isEqual(val.id, this.doc[key].id))) form[key] = val
                  } else {
                    if (!_.isEqual(this.doc[key], this.form[key])) form[key] = this.form[key]
                  }
                } else {
                  val = this.form[key].reduce((obj, id) => {
                    let ref = true
                    if (this.schema.properties[key].schema) {
                      if (_.isObject(id)) {
                        ref = firebase.firestore().collection(this.schema.properties[key].schema.collection).doc(id.value)
                      } else if (this.schema.properties[key].component === 'chip') {
                        ref = firebase.firestore().collection(this.schema.properties[key].schema.collection).doc()
                        let properyName = (this.schema.properties[key].schema.title && this.schema.properties[key].schema.title.property) || DEFAULT_CHIP_PROPERTY
                        let newValue = { // TODO addDocument
                          [properyName]: id,
                          userId: this.$store.getters.user.id
                        }
                        ref.set(newValue)
                      } else {
                        ref = firebase.firestore().collection(this.schema.properties[key].schema.collection).doc(id)
                      }
                    }
                    obj[ref.id] = ref
                    return obj
                  }, {})
                  this.doc[key] && Object.keys(this.doc[key]).forEach(id => {
                    if (!val[id]) {
                      val[id] = firebase.firestore.FieldValue.delete()
                    } else {
                      delete val[id]
                    }
                  })
                  form[key] = val
                }
              }
            } else {
              if (!_.isEqual(this.doc[key], val)) form[key] = val
            }
          }
        })
        if (!_.isEmpty(form)) {
          updateDocument(docRef, form)
        }
        this.editToggle = false
      },
      deleteItem () {
        firebase.firestore().collection(this.schema.collection).doc(this.id).delete().then(() => {
          this.$router.go(-1)
        }).catch((error) => {
          console.log(error)
        })
      },
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
                snapshot.docs
                  .filter(doc => {
                    let test = true
                    if (_.isArray(this.schema.properties[key].filters)) {
                      console.log('TODO tester les filtres') // TODO tester davantage, et en faire une fonction
                      this.schema.properties[key].filters.forEach(filter => {
                        let docData = doc.data()
                        let [source, operator, destination] = filter
                        // let source = filter[0]
                        // let destination = filter[2]
                        // let operator = filter[1]
                        if (_.isString(source) && source.charAt(0) === ':') source = _.get(docData, source.substr(1))
                        if (_.isString(destination) && destination.charAt(0) === ':') destination = _.get(docData, destination.substr(1))
                        if (_.isString(destination) && destination === '{userId}') destination = this.$store.getters.user.id
                        switch (operator) {
                          case '==': test = (source === destination); break
                          case '!=': test = (source !== destination); break
                          case '>': test = (source > destination); break
                          case '>=': test = (source >= destination); break
                          case '<': test = (source < destination); break
                          case '<=': test = (source <= destination); break
                        }
                      })
                    }
                    return test
                  })
                  .forEach(doc => {
                    form[`${key}Collection`].push({
                      value: doc.id,
                      text: this.title(doc.data(), this.schema.properties[key].schema.title)
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
      }
    },
    computed: {
      mapType () {
        return MAP_TYPE
      },
      view () {
        return this.schema.itemView[this.viewName || 'default']
      },
      actions () {
        let readActions = [
          {
            title: 'Edit',
            method: () => this.edit()
          },
          {
            title: 'Delete',
            method: () => { this.deleteDialogToggle = !this.deleteDialogToggle }
          }
        ]
        if (this.schema.versionable) {
          readActions.push({
            title: 'New version',
            method: () => console.log('todo versionable')
          })
        }
        let editActions = []
        return [
          ...(this.editToggle ? editActions : readActions)
        ]
      }
    },
    deactivated () {
      this.editToggle = false
    },
    watch: {
      editToggle () {
        if (!this.isActiveTab(this.view.sectionsOrder[this.tab])) {
          this.tab = '0'
        }
      }
    },
    mounted () {
      this.$bind('doc', firebase.firestore().collection(this.schema.collection).doc(this.id))
        .then((doc) => {
          this.reset()
        })
        .catch((error) => {
          console.log('error in loading: ', error)
        })
    }
  }
</script>

<style scoped>

</style>
