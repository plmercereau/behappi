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
    template(v-for="(section, key) in schema.details")
      v-card(v-if="section.type ==='properties' && (!editToggle || section.edit)")
        v-card-title(primary-title)
          div
            h2 {{(section.titleProperty && data[section.titleProperty]) || section.title || (schema.titleProperty && data[schema.titleProperty]) || schema.title || 'Item'}}
        v-card-text(v-if="editToggle")
          form(novalidate @submit.prevent="saveItem")
            template(v-for="name in section.edit")
              div(v-if="schema.properties[name].type==='string' && !schema.properties[name].enum" class="caption")
                v-text-field(
                  autofocus,
                  v-model="form[name]",
                  :id="'form-' + name",
                  :label="schema.properties[name].placeholder",
                  v-validate="schema.properties[name].validation",
                  :data-vv-name="'form-' + name")
                <!--TODO required, data-vv-name-->
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
                          :data-vv-name="'form-' + name + '-latitude'")
                          v-text-field(
                          autofocus
                          type="number"
                          v-model.number="form['reported'+name].lng",
                          :id="'form-' + name + '-latitude'",
                          label="Longitude",
                          v-validate="",
                          @change="updateMapCenter(name)",
                          :data-vv-name="'form-' + name + '-latitude'")
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
          div(v-for="name in section.read" :key="name")
            div(class="caption" v-if="data[name]") {{schema.properties[name].title}}
            h3(class="subheading" v-if="data[name]")
              div(v-if="schema.properties[name].type === 'string'") {{!schema.properties[name].enum ? data[name]: data[name] | labelEnum(schema.properties[name].enum)}}
              div(v-if="schema.properties[name].type === 'date'") {{data[name] | moment('DD-MM-YYYY HH:mm:ss')}}
              div(v-else-if="schema.properties[name].type === 'ref'") {{data[name][schema.properties[name].schema.titleProperty]}}
              map-image(v-else-if="schema.properties[name].type === 'area' || schema.properties[name].type === 'point'",
                :schema="schema",
                :doc="data",
                :locationProperty="name")
            v-divider
      card-list(v-if="section.type ==='refCollection'" :title="schema.properties[section.property].schema.collectionTitle")
        v-card-actions(v-if="section.edit && !editToggle" slot="actions")
          create-button(:schema="schema.properties[section.property].schema", :parentData="data") {{schema.properties[section.property].schema.createTitle}}
        v-flex(d-flex xs12 sm6 md4, v-for="(doc, docId) in data[section.property]" :key="docId")
          inline-item-detail(:schema="schema.properties[section.property].schema", :doc="doc")
</template>

<script>
  import {MAP_TYPE, DEFAULT_LOCATION, DEFAULT_ZOOM} from '../main'
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import {updateDocument} from '../schemas'
  export default {
    props: ['id', 'schema'],
    name: 'ItemDetails',
    data () {
      return {
        form: {},
        data: {},
        editToggle: false,
        deleteDialogToggle: false,
        loading: true
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
            let val = this.data[key] // TODO revoir pour les references
            if (this.schema.properties[key].type === 'area' || this.schema.properties[key].type === 'point') {
              val = {
                latitude: this.form[`reported${key}`].lat,
                longitude: this.form[`reported${key}`].lng
              }
              form[this.schema.properties[key].zoomProperty] = this.form[this.schema.properties[key].zoomProperty]
            } else if (this.schema.properties[key].type === 'ref') {
              val = firebase.firestore().collection(this.schema.properties[key].schema.collection).doc(this.form[key])
            } else {
              val = this.form[key]
            }
            if (!_.isEqual(this.data[key], val)) {
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
        let form = Object.assign({}, this.data)
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
                    text: doc.data()[this.schema.properties[key].schema.titleProperty]
                  })
                })
              })
            }
          })
        this.form = Object.assign({}, this.form, form)
      }
    },
    watch: {
      data (newValue) {
        // if (newValue.location) this.defaultProject.location = newValue.location // TODO garder? generaliser?
        if (newValue.id) {
          this.loading = false
        }
      }
    },
    computed: {
      mapType () {
        return MAP_TYPE
      }
    },
    deactivated () {
      this.editToggle = false
    },
    firestore () {
      return {
        data: firebase.firestore().collection(this.schema.collection).doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
