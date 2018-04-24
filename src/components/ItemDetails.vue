<template lang="pug">
  v-flex(xs12)
    v-card-actions
      v-btn(color="primary" v-show="editToggle && !errors.any()" @click="saveItem()") Save
      v-btn(color="primary" v-if="editToggle" @click="reset") Reset
      v-btn(color="primary" v-if="editToggle" @click="cancel") Cancel
      v-btn(color="primary" v-if="!loading && !editToggle" @click="edit") Edit
      v-btn(color="primary" v-if="!loading && !editToggle && schema.versionable" @click="") New version
      v-btn(color="primary" v-if="!loading && !editToggle" @click="deleteDialogToggle = !deleteDialogToggle") Delete
      v-dialog(v-model="deleteDialogToggle" max-width="500px")
        v-card
          v-card-title Are you sure you want to delete this document?
          v-card-actions
            v-btn(color="error" flat @click.stop="deleteItem") Delete
            v-btn(color="primary" flat @click.stop="deleteDialogToggle=false") Cancel
    template(v-for="sectionName in view.sectionsOrder")
      v-card(v-if="view.sections[sectionName].type ==='properties' && view.sections[sectionName].read && (!editToggle || view.sections[sectionName].edit)")
        v-card-title(primary-title)
          h2 {{title(doc, view.sections[sectionName].title)}}
        v-card-text(v-if="editToggle")
          form(novalidate @submit.prevent="saveItem")
            template(v-for="name in view.sections[sectionName].edit")
              div(v-if="schema.properties[name].type==='string' && !schema.properties[name].enum" class="caption")
                v-text-field(
                  autofocus,
                  v-model="form[name]",
                  :id="'form-' + name",
                  :label="schema.properties[name].placeholder",
                  v-validate="schema.properties[name].validation",
                  :doc-vv-name="'form-' + name")
                <!--TODO required, doc-vv-name-->
              div(v-if="schema.properties[name].type==='string' && schema.properties[name].enum") {{schema.properties[name].title}}
                v-select(
                  autofocus,
                  :autocomplete="schema.properties[name].autocomplete",
                  v-model="form[name]",
                  :items="schema.properties[name].enum",
                  :label="schema.properties[name].placeholder",
                  single-line)
              div(v-if="schema.properties[name].type==='ref'") {{schema.properties[name].title}}
                v-select(
                  autofocus,
                  :autocomplete="schema.properties[name].autocomplete",
                  v-model="form[name]",
                  :items="form[name+'Collection']"
                  :label="schema.properties[name].title",
                  single-line)
              v-container(v-if="schema.properties[name].type==='area' || schema.properties[name].type==='point'", fluid ,grid-list-md)
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
                          v-slider(label="Zoom" :max="20" v-model="form[schema.properties[name].zoomProperty]")
                  v-flex(d-flex xs12 sm6 md8)
                    gmap-map(
                    :center="form[name]"
                    @center_changed="updateCenter(name, $event)"
                    :zoom="form[schema.properties[name].zoomProperty]"
                    @zoom_changed="updateField(schema.properties[name].zoomProperty, $event)"
                    :map-type-id="mapType"
                    style="width: 320px; height: 200px")
                      gmap-marker(v-if="schema.properties[name].type==='point'" :position="form['reported'+name]")
        v-card-text(v-if="!editToggle")
          div(v-for="name in view.sections[sectionName].read" :key="name")
            div(class="caption" v-if="doc[name]") {{schema.properties[name].title}}
            h3(class="subheading" v-if="doc[name]")
              div(v-if="schema.properties[name].type === 'string'") {{!schema.properties[name].enum ? doc[name]: doc[name] | labelEnum(schema.properties[name].enum)}}
              div(v-if="schema.properties[name].type === 'date'") {{doc[name] | moment('DD-MM-YYYY HH:mm:ss')}}
              div(v-else-if="schema.properties[name].type === 'ref'") {{title(doc[name], schema.properties[name].schema.title)}}
              map-image(v-else-if="schema.properties[name].type === 'area' || schema.properties[name].type === 'point'",
                :schema="schema",
                :doc="doc",
                :locationProperty="name")
            v-divider
      card-list(v-if="view.sections[sectionName].type ==='refCollection'" :title="title(doc, schema.properties[view.sections[sectionName].property].title)")
        v-card-actions(v-if="view.sections[sectionName].edit && !editToggle" slot="actions")
          create-button(:schema="schema.properties[view.sections[sectionName].property].schema", :parentData="doc") {{title(doc, schema.properties[view.sections[sectionName].property].schema.listViews.default.create.title)}}
        v-flex(d-flex xs12 sm6 md4, v-for="(doc, docId) in doc[view.sections[sectionName].property]" :key="docId")
          inline-item-detail(:schema="schema.properties[view.sections[sectionName].property].schema", :doc="doc")
</template>

<script>
  import {MAP_TYPE, DEFAULT_LOCATION, DEFAULT_ZOOM} from '../main'
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import {schemaMixin} from '../mixins'
  import {updateDocument} from '../schemas'

  export default {
    props: ['id', 'schema', 'viewName'],
    name: 'ItemDetails',
    mixins: [schemaMixin],
    data () {
      return {
        form: {},
        editToggle: false,
        deleteDialogToggle: false
      }
    },
    methods: {
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
        Object.keys(this.form).map((key, index) => {
          if (this.schema.properties[key]) {
            let val = this.doc[key]
            if (this.schema.properties[key].type === 'area' || this.schema.properties[key].type === 'point') {
              val = {
                latitude: this.form[`reported${key}`].lat,
                longitude: this.form[`reported${key}`].lng
              }
              const zoomProp = this.schema.properties[key].zoomProperty
              if (!_.isEqual(this.doc[zoomProp], this.form[zoomProp])) {
                form[zoomProp] = this.form[zoomProp]
              }
            } else if (this.schema.properties[key].type === 'ref') {
              val = firebase.firestore().collection(this.schema.properties[key].schema.collection).doc(this.form[key])
            } else {
              val = this.form[key]
            }
            if (
              (this.schema.properties[key].type !== 'ref' && !_.isEqual(this.doc[key], val)) ||
              (this.schema.properties[key].type === 'ref' && !_.isEqual(val.id, this.doc[key].id))) {
              form[key] = val
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
        this.reset()
        this.editToggle = true
      },
      cancel () {
        this.reset()
        this.editToggle = false
      },
      reset () {
        let form = Object.assign({}, this.doc)
        Object.keys(this.schema.properties)
          .filter(key => {
            return (this.schema.properties[key].type !== 'refCollection')
          })
          .map(key => {
            if (this.schema.properties[key].type === 'area' || this.schema.properties[key].type === 'point') {
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
              if (!form[this.schema.properties[key].zoomProperty]) {
                form[this.schema.properties[key].zoomProperty] = DEFAULT_ZOOM
              }
              form[key] = googleLocation
              form[`reported${key}`] = googleLocation
            } else if (this.schema.properties[key].type === 'ref') {
              form[`${key}Collection`] = []
              if (form[key]) form[key] = form[key].id
              firebase.firestore().collection(this.schema.properties[key].schema.collection).get().then(snapshot => {
                snapshot.forEach(doc => {
                  form[`${key}Collection`].push({
                    value: doc.id,
                    text: this.title(doc.data(), this.schema.properties[key].schema.title)
                  })
                })
              })
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
        return this.schema.itemViews[this.viewName || 'default']
      }
    },
    deactivated () {
      this.editToggle = false
    },
    firestore () {
      return {
        doc: firebase.firestore().collection(this.schema.collection).doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
