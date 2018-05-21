<template lang="pug">
  v-container(fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, align-center)
      v-flex(xs12)
        tool-bar(:title="docTitle", :actions="actions", :edit="editToggle")
          v-btn(@click="saveItem()") Save
          v-btn(@click="reset") Reset
          v-btn(@click="cancel") Cancel
        v-dialog(v-model="deleteDialogToggle" max-width="500px")
          v-card
            v-card-title Are you sure you want to delete this document?
            v-card-actions
              v-btn(color="error" flat @click.stop="deleteItem") Delete
              v-btn(color="primary" flat @click.stop="deleteDialogToggle=false") Cancel
        loading(v-if="loading")
        template(v-else)
          v-tabs(v-model="tab")
            v-tab(v-for="sectionName in view.sectionsOrder" :key="sectionName" v-show="isActiveTab(sectionName)") {{view.sections[sectionName].title}}
          v-tabs-items(v-model="tab")
            v-tab-item(v-for="sectionName in view.sectionsOrder" :key="sectionName")
              v-card
                v-card-text(v-if="editToggle")
                  form(novalidate @submit.prevent="saveItem")
                    template(v-for="name in view.sections[sectionName].edit")
                      div(v-if="schema.properties[name].type==='string'" class="caption") {{schema.properties[name].label || '' }}
                        v-text-field(
                          autofocus,
                          v-model="form[name]",
                          :id="'form-' + name",
                          :label="schema.properties[name].placeholder",
                          v-validate="schema.properties[name].validation",
                          :doc-vv-name="'form-' + name")
                        <!--TODO required, doc-vv-name-->
                      div(v-if="schema.properties[name].type==='collection' && schema.properties[name].component!=='card' && schema.properties[name].unique") {{schema.properties[name].label || '' }}
                        v-select(
                          autofocus,
                          :chips="schema.properties[name].component === 'chip'",
                          :autocomplete="schema.properties[name].autocomplete",
                          v-model="form[name]",
                          :items="form[name+'Collection']"
                          :label="schema.properties[name].placeholder",
                          single-line)
                      div(v-if="schema.properties[name].type==='collection' && schema.properties[name].component!=='card' && !schema.properties[name].unique") {{schema.properties[name].label || '' }}
                        v-select(
                        multiple,
                        autofocus,
                        :tags="exists(schema.properties[name].create)",
                        :return-object="exists(schema.properties[name].create)",
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
                            style="width: 480px; height: 300px")
                              gmap-marker(v-if="schema.properties[name].markers && schema.properties[name].markers.self" :position="form['reported'+name]")
                v-card-text(v-if="!editToggle")
                  create-button(v-for="name in view.sections[sectionName].read",
                    :key="`create-button-${name}`"
                    fab,
                    v-if="schema.properties[name].create && (schema.properties[name].component ==='card' || schema.properties[name].component ==='list')",
                    :parentData="doc", :propertyName="name", :parentSchema="schema")
                  div(v-for="name in view.sections[sectionName].read" v-if="doc[name]" :key="name")
                    div(:class="(view.sections[sectionName].subtitles && view.sections[sectionName].subtitles.includes(name)) ? 'title' : 'caption'") {{schema.properties[name].label || '' }}
                    div(class="subheading")
                      div(v-if="schema.properties[name].type === 'string'") {{!schema.properties[name].enum ? doc[name]: doc[name] | labelEnum(schema.properties[name].enum)}}
                      div(v-if="schema.properties[name].type === 'date'") {{doc[name] | moment('DD-MM-YYYY HH:mm:ss')}}
                      router-link(v-else-if="schema.properties[name].type === 'collection' && schema.properties[name].schema && schema.properties[name].unique" :to="`/${schema.properties[name].schema.name}/${doc[name].id}`") {{ title(name) }}
                      div(v-else-if="schema.properties[name].type === 'collection' && !schema.properties[name].schema && schema.properties[name].unique") {{ schema.properties[name].options[doc[name]] }}
                      template(v-else-if="schema.properties[name].type === 'collection' && schema.properties[name].schema && !schema.properties[name].unique")
                        v-container(v-if="schema.properties[name].component ==='card'" fluid, grid-list-md)
                          v-layout(row, wrap)
                            v-flex(dd-flex xs12 sm6 md4, v-for="doc in sortedCollection(name)" :key="doc.id")
                              card-item(:schema="schema.properties[name].schema", :doc="doc")
                        v-chip(v-else-if="schema.properties[name].component ==='chip'",
                          v-for="doc in sortedCollection(name)",
                          :key="doc.id") {{title(name)}}
                        v-list(v-else)
                          list-item(v-for="doc in sortedCollection(name)" :key="doc.id", :property="schema.properties[name]", :doc="doc")
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
  import {formMixin, schemaMixin} from '../mixins'
  import {updateDocument} from '../schemas'
  import {MAP_TYPE} from '../config'

  export default {
    props: ['id', 'schema', 'viewName'],
    name: 'ItemDetails',
    mixins: [schemaMixin, formMixin],
    data () {
      return {
        loading: true,
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
            if (!_.isEmpty(this.doc[propName]) || (this.schema.properties[propName].create && (this.schema.properties[propName].component === 'card' || this.schema.properties[propName].component === 'list'))) {
              show = true
            }
          })
        }
        return show
      },
      saveItem () { // TODO form action instead of $validator.validateAll() && saveItem()
        let docRef = firebase.firestore().collection(this.schema.collection).doc(this.id)
        let form = this.constructDataWithProperties(Object.keys(this.schema.properties))
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
      title (propertyName) {
        let fromRootDoc = Boolean(this.schema.properties[propertyName].title)
        let titleString = fromRootDoc ? this.schema.properties[propertyName].title : this.schema.properties[propertyName].schema.title
        let titleTemplate = _.template(titleString)
        return _.isObject(this.doc) && this.doc.id ? titleTemplate(fromRootDoc ? this.doc : this.doc[propertyName]) : ''
      }
    },
    computed: {
      mapType () {
        return MAP_TYPE
      },
      view () {
        return this.schema.itemView[this.viewName || 'default'] || this.schema.itemView['default']
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
    firestore () {
      return {
        fbDoc: firebase.firestore().collection(this.schema.collection).doc(this.id)
      }
    },
    mounted () {
      this.$bind('fbDoc', firebase.firestore().collection(this.schema.collection).doc(this.id))
        .then((doc) => {
          this.reset()
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
