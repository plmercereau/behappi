<template lang="pug">
  v-card
    v-card-title(primary-title)
      div
        h2 {{(schema.titleProperty && data[schema.titleProperty]) || schema.title || 'Item'}}
    v-card-actions
      v-btn(color="primary" v-show="editToggle && !errors.any()" @click="saveItem()") Save
      v-btn(color="primary" v-if="editToggle" @click="reset") Reset
      v-btn(color="primary" v-if="editToggle" @click="cancel") Cancel
      v-btn(color="primary" v-if="!loading && !editToggle" @click="edit") Edit
      v-btn(color="primary" v-if="!loading && !editToggle && schema.versionable" @click="") New version
      v-btn(color="primary" v-if="!loading && !editToggle" @click="deleteDialogToggle = !deleteDialogToggle") Delete
      v-dialog(v-model="deleteDialogToggle" max-width="500px")
        v-card
          v-card-title Are you sure you want to delete this {{((schema.titleProperty && data[schema.titleProperty]) || schema.title || 'Item') | lowercase}}?
          v-card-actions
            v-btn(color="error" flat @click.stop="deleteItem") Delete
            v-btn(color="primary" flat @click.stop="deleteDialogToggle=false") Cancel
    v-card-text(v-if="editToggle")
      form(novalidate @submit.prevent="saveItem")
        template(v-for="(field, name) in schema.properties")
          div(v-if="field.type==='string' && !field.enum" class="caption")
            v-text-field(
              autofocus,
              autocomplete,
              v-model="form[name]",
              :id="'form-' + name",
              :label="field.attrs.placeholder",
              v-validate="field.validation",
              :data-vv-name="'form-' + name")
            <!--TODO required, data-vv-name-->
          div(v-if="field.type==='string' && field.enum") {{field.attrs.title}}
            v-select(
              autofocus,
              autocomplete,
              v-model="form[name]",
              :items="field.enum",
              :label="field.attrs.placeholder",
              single-line)
          div(v-if="field.type==='ref'") {{field.attrs.title}}
            v-select(
              autofocus,
              autocomplete,
              v-model="form[name]",
              :items="form[name+'Collection']"
              :label="field.attrs.title",
              single-line)
          v-container(v-if="field.type==='area' || field.type==='point'", fluid ,grid-list-md)
            v-layout(row, wrap)
              v-flex(d-flex xs12 sm6 md4)
                v-container(fluid)
                  v-layout(row)
                    v-flex
                      div(class="caption") {{field.attrs.placeholder}}
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
                @zoom_changed="updateField(field.zoomProperty, $event)"
                :map-type-id="mapType"
                style="width: 320px; height: 200px")
                  gmap-marker(v-if="field.type==='point'" :position="form['reported'+name]")
    v-card-text(v-if="!editToggle")
      div(v-for="(field, name) in schema.properties" :key="name")
        div(class="caption" v-if="data[name]") {{field.attrs.title}}
        h3(class="subheading" v-if="data[name]")
          div(v-if="field.type === 'string'") {{!field.enum ? data[name]: getLabel(data[name], field.enum)}}
          div(v-else-if="field.type === 'ref'") {{data[name][field.titleProperty]}}
        map-image(v-if="data[name] && field.type === 'area'" :location="data[name]", :zoom="data[field.zoomProperty]")
        map-image(v-if="data[name] && field.type === 'point'" :location="data[name]", :zoom="data[field.zoomProperty]", :markers="[data[name]]")
        v-divider
</template>

<script>
  import {MAP_TYPE, DEFAULT_LOCATION, DEFAULT_ZOOM} from '../main'
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import {getFinalData} from '../helpers'
  export default {
    props: ['collection', 'id', 'schema'],
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
      updateMapCenter (fieldName) {
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
        let docRef = firebase.firestore().collection(this.collection).doc(this.id)
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
              val = firebase.firestore().collection(this.schema.properties[key].collectionRef).doc(this.form[key])
            } else {
              val = this.form[key]
            }
            if (!_.isEqual(this.data[key], val)) {
              form[key] = val
            }
          }
        })
        if (!_.isEmpty(form)) {
          docRef.set(getFinalData(form), { merge: true })
        }
        this.editToggle = false
      },
      deleteItem () {
        firebase.firestore().collection(this.collection).doc(this.id).delete().then(() => {
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
        Object.keys(this.schema.properties).map(key => {
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
            form[key] = form[key].id
            firebase.firestore().collection(this.schema.properties[key].collectionRef).get().then(snapshot => {
              snapshot.forEach(doc => {
                form[`${key}Collection`].push({
                  value: doc.id,
                  text: doc.data()[this.schema.properties[key].titleProperty]
                })
              })
            })
          }
        })
        this.form = Object.assign({}, this.form, form)
      },
      getLabel (value, enumeration) { // TODO convert into a pipeline/filter
        if (value) {
          let index = enumeration.findIndex((el) => {
            return (el.value === value)
          })
          return enumeration[index].text
        } else {
          return ''
        }
      }
    },
    watch: {
      data (newValue) {
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
    firestore () {
      return {
        data: firebase.firestore().collection(this.collection).doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
