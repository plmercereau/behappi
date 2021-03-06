<template lang="pug">
  v-container(fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(row, align-center)
      v-flex(xs12)
        tool-bar(:title="docTitle", :actions="actions", :edit="editToggle")
          v-tooltip(bottom :disabled="errors.items.length === 0")
            v-btn(slot="activator" @click="saveItem()" :disabled="errors.items.length > 0") Save
            span You have to fill in all the form correctly before you can save the document
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
          create-button(
            v-for="sectionName in view.sectionsOrder",
            :key="'actions-' + sectionName",
            v-if="!editToggle && view.sections[sectionName].create"
            :showButton="activeTab === sectionName",
            fab,
            :parentData="doc", :propertyName="view.sections[sectionName].create", :parentSchema="schema")
          v-tabs(v-model="tab", slider-color="primary")
            v-tab(v-for="sectionName in view.sectionsOrder",
              :key="'tab-'+sectionName",
              v-show="isActiveTab(sectionName)",
              :class="sectionErrors(sectionName) ? 'error--text' : ''"
            ) {{sectionTitle(sectionName)}}
          v-tabs-items(v-model="tab")
            v-tab-item(v-for="sectionName in view.sectionsOrder" :key="'tab-item-'+sectionName")
              v-card
                v-card-text(v-if="editToggle")
                  form(@submit.prevent="saveItem")
                    template(v-for="name in view.sections[sectionName].edit" v-if="isVisibleField(name)")
                      v-text-field(v-if="schema.properties[name].type==='string'",
                        :hint="schema.properties[name].description",
                        v-model="form[name]",
                        :id="'form-' + name",
                        :label="schema.properties[name].label",
                        :required="schema.properties[name].validation && schema.properties[name].validation.required",
                        v-validate.initial="schema.properties[name].validation",
                        :error-messages="errors.collect(name)",
                        :data-vv-name="name")
                      v-radio-group(v-else-if="schema.properties[name].type==='boolean'",
                        :label="schema.properties[name].label",
                        v-model="form[name]",
                        :required="schema.properties[name].validation && schema.properties[name].validation.required",
                        v-validate.initial="schema.properties[name].validation",
                        :error-messages="errors.collect(name)",
                        :data-vv-name="name")
                        v-radio(key="true" :label="schema.properties[name].options['true'] || 'True'" :value="true")
                        v-radio(key="false" :label="schema.properties[name].options['false'] || 'False'" :value="false")
                      link-field(v-else-if="schema.properties[name].type==='link'",
                        :required="schema.properties[name].required",
                        v-model="form[name]",
                        :label="schema.properties[name].label")
                      date-field(v-else-if="schema.properties[name].type==='date'",
                        :required="schema.properties[name].required",
                        v-model="form[name]",
                        :label="schema.properties[name].label")
                      template(v-else-if="schema.properties[name].type==='collection'")
                        template(v-if="schema.properties[name].component==='select'")
                          v-radio-group(v-if="schema.properties[name].unique",
                          :label="schema.properties[name].label",
                          v-model="form[name]",
                          :required="schema.properties[name].validation && schema.properties[name].validation.required",
                          v-validate.initial="schema.properties[name].validation",
                          :error-messages="errors.collect(name)",
                          :data-vv-name="name")
                            v-radio(v-for="item in options(name)" :key="item.value" :label="item.text" :value="item.value")
                          div(v-else) {{schema.properties[name].label || '' }}
                            v-checkbox(v-for="item in options(name)",
                              :key="name + (item.value || item)",
                              :label="item.text || schema.properties[name].options[item]",
                              :required="schema.properties[name].validation && schema.properties[name].validation.required",
                              v-validate.initial="schema.properties[name].validation",
                              :error-messages="errors.collect(name)",
                              :data-vv-name="name",
                              :value="item.value || item",
                              type="checkbox",
                              v-model="form[name]")
                        v-select(v-else,
                          :hint="schema.properties[name].description"
                          :multiple="!schema.properties[name].unique",
                          :tags="(!exists(schema.properties[name].unique) || !schema.properties[name].unique) && exists(schema.properties[name].create)",
                          return-object,
                          :chips="schema.properties[name].component === 'chip' && !schema.properties[name].unique",
                          :deletable-chips="schema.properties[name].component === 'chip'",
                          :autocomplete="exists(schema.properties[name].autocomplete) ? schema.properties[name].autocomplete : true",
                          v-model="form[name]",
                          :items="options(name)"
                          :label="schema.properties[name].label",
                          :required="schema.properties[name].validation && schema.properties[name].validation.required",
                          :clearable="!(schema.properties[name].validation && schema.properties[name].validation.required)",
                          v-validate.initial="schema.properties[name].validation",
                          :error-messages="errors.collect(name)",
                          :data-vv-name="name")
                      v-container(v-else-if="schema.properties[name].type==='location'", fluid, grid-list-md)
                        v-layout(row, wrap)
                          v-flex(d-flex xs12 sm6 md4)
                            v-container(fluid)
                              v-layout(row)
                                v-flex
                                  v-subheader {{schema.properties[name].label}}{{schema.properties[name].required && '*'}}
                                  v-text-field(
                                  type="number"
                                  v-model.number="form['reported'+name].lat",
                                  :id="'form-' + name + '-latitude'",
                                  label="Latitude",
                                  :required="schema.properties[name].validation && schema.properties[name].validation.required",
                                  :error-messages="errors.collect(name+ '-latitude')",
                                  :data-vv-name="name+ '-latitude'",
                                  v-validate.initial="((schema.properties[name].validation && schema.properties[name].validation.required) ? 'required|' : '')+'decimal'",
                                  @change="updateMapCenter(name)")
                                  v-text-field(
                                  type="number"
                                  v-model.number="form['reported'+name].lng",
                                  :id="'form-' + name + '-longitude'",
                                  label="Longitude",
                                  :required="schema.properties[name].validation && schema.properties[name].validation.required",
                                  :error-messages="errors.collect(name+ '-longitude')",
                                  v-validate.initial="((schema.properties[name].validation && schema.properties[name].validation.required) ? 'required|' : '')+'decimal'",
                                  :data-vv-name="name + '-longitude'",
                                  @change="updateMapCenter(name)")
                                  v-slider(label="Zoom" :max="20" v-model="form[schema.properties[name].zoom]")
                          v-flex(d-flex xs12 sm6 md8)
                            gmap-map(
                            :center="form[name]"
                            @center_changed="updateCenter(name, $event)"
                            :zoom="form[schema.properties[name].zoom]"
                            @zoom_changed="updateField(schema.properties[name].zoom, $event)"
                            :map-type-id="mapType"
                            style="width: 480px; height: 300px")
                              gmap-marker(v-if="schema.properties[name].markers && (typeof schema.properties[name].markers.self === 'boolean')" :position="form['reported'+name]")
                v-card-text(v-else)
                  div(v-for="name in view.sections[sectionName].read" v-if="typeof doc[name] !== 'undefined'" :key="name")
                    div(v-if="!(view.sections[sectionName].hideLabels && view.sections[sectionName].hideLabels.includes(name))" class="grey--text") {{schema.properties[name].label || '' }}
                    div(class="subheading")
                      div(v-if="schema.properties[name].type === 'string'") {{doc[name]}}
                      div(v-else-if="schema.properties[name].type === 'number'") {{doc[name]}}
                      div(v-else-if="schema.properties[name].type === 'boolean'") {{doc[name] ? schema.properties[name].options['true'] || 'True' : schema.properties[name].options['false'] || 'False'}}
                      a(v-else-if="schema.properties[name].type === 'link'" :href="doc[name].value" target="_blank") {{doc[name].text}}
                      div(v-else-if="schema.properties[name].type === 'date'") {{doc[name] | moment('DD/MM/YYYY')}}
                      template(v-else-if="schema.properties[name].type === 'collection'")
                        template(v-if="schema.properties[name].unique")
                          v-container(v-if="schema.properties[name].component ==='card'" fluid, grid-list-md)
                            v-layout(row, wrap)
                              v-flex(dd-flex xs12 sm6 md4, v-for="doc in sortedCollection(name)" :key="doc.id")
                                card-item(:schema="schema.properties[name]", :doc="doc")
                                  div {{subtitle(schema.properties[name].schema, doc)}}
                          router-link(v-else-if="doc[name].id" :to="`/${doc[name]._schema || schema.properties[name].schema.name}/${doc[name].id}`") {{title(name)}}
                          div(v-else) {{title(name)}}
                        v-list(v-else-if="schema.properties[name].component === 'dropdown'")
                          <!--TODO merge two components below-->
                          list-item(v-if="schema.properties[name].schema" v-for="doc in sortedCollection(name)" :schema="schema.properties[name].schema" :key="doc.id", :property="schema.properties[name]", :doc="doc")
                          v-list-tile(v-else v-for="(item, index) in sortedCollection(name)" :key="name + index")
                            v-list-tile-content {{title(name, item)}}
                        v-chip(v-else-if="schema.properties[name].component === 'chip' || schema.properties[name].component === 'select'",
                          v-for="(val, index) in sortedCollection(name)",
                          :key="name + index") {{title(name, val)}}
                        v-container(v-else-if="schema.properties[name].component === 'card'" fluid, grid-list-md)
                          v-layout(row, wrap)
                            v-flex(dd-flex xs12 sm6 md4, v-for="doc in sortedCollection(name)" :key="doc.id")
                              card-item(:schema="schema.properties[name].schema", :doc="doc")
                                div {{subtitle(schema.properties[name], doc)}}
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
  import {formMixin} from '../mixins'
  import {addComputedValues, sortCollection, testDocConditions, updateDocument} from '../schemas'
  import {MAP_TYPE} from '../config'

  export default {
    provide () {
      return { parentValidator: this.$validator }
    },
    props: ['id', 'schema'],
    name: 'ItemDetails',
    mixins: [formMixin],
    data () {
      return {
        fbDoc: {},
        loading: true,
        tab: '0',
        deleteDialogToggle: false
      }
    },
    methods: {
      sortedCollection (collectionName) { // TODO other than string compare
        let collection = []
        if (this.schema.properties[collectionName].schema) {
          let sortProperties = _.get(this.schema.properties[collectionName].schema, 'collectionView.default.sort')
          if (sortProperties) {
            collection = sortCollection(sortProperties, this.doc[collectionName])
          } else {
            collection = this.doc[collectionName]
          }
        } else {
          // TODO for enum
          collection = Object.keys(this.doc[collectionName]).map(id => id)
        }
        return collection
      },
      exists (object) {
        return Boolean(object)
      },
      isActiveTab (sectionName) {
        let props = this.editToggle ? this.view.sections[sectionName].edit : this.view.sections[sectionName].read
        let show = false
        if (this.editToggle) {
          props && props.map(propName => {
            if (this.schema.properties[propName].component !== 'card' || !this.schema.properties[propName].create) {
              show = true
            }
          })
        } else {
          show = true
        }
        return show
      },
      fabActions (sectionName) { // TODO
        return sectionName
      },
      saveItem () {
        this.$validator.validateAll().then((result) => {
          if (result) {
            let docRef = firebase.firestore().collection(this.schema.collection).doc(this.id)
            let form = this.constructDataWithProperties(Object.keys(this.schema.properties))
            if (!_.isEmpty(form)) {
              updateDocument(docRef, form).then(() => {
                this.reset()
              })
            }
            this.editToggle = false
          } else {
            alert('Some inputs of the form are not valid. Please correct them before saving the document')
          }
        })
      },
      isVisibleField (fieldName) {
        if (_.get(this.schema, `properties[${fieldName}].computed`)) return false
        return testDocConditions(this.form, this.schema.properties[fieldName].showConditions)
      },
      deleteItem () {
        firebase.firestore().collection(this.schema.collection).doc(this.id).delete().then(() => {
          this.$router.go(-1)
        }).catch((error) => {
          console.log(error)
        })
      },
      title (propertyName, value) { // TODO set as a filter value | title(property) and include boolean components
        if (this.schema.properties[propertyName].schema) { // TODO a bit messy and not correct for options
          let fromRootDoc = Boolean(this.schema.properties[propertyName].title)
          let titleString = fromRootDoc ? this.schema.properties[propertyName].title : _.get(this.schema.properties[propertyName], 'schema.title')
          let titleTemplate = _.template(titleString)
          return titleTemplate({doc: value ? this.doc[propertyName][value.id || value] : (fromRootDoc ? this.doc : this.doc[propertyName])})
        } else if (this.schema.properties[propertyName].options) {
          return value ? this.schema.properties[propertyName].options[value.id || value] : this.schema.properties[propertyName].options[this.doc[propertyName]]
        } else return this.doc[propertyName]
      },
      subtitle (property, doc) {
        let withComputed = addComputedValues(property.schema, doc)
        let template = _.has(property, 'subtitle') ? property.subtitle : property.schema.collectionView.default.subtitle || ''
        return _.template(template)({doc: withComputed})
      },
      sectionTitle (tabName) {
        return _.isObject(this.doc) && this.doc.id ? _.template(this.view.sections[tabName].title)({doc: this.doc}) : ''
      },
      sectionErrors (tabName) {
        let properties = _.isObject(this.doc) && this.doc.id && this.view.sections[tabName].edit
        if (this.editToggle && properties && this.errors.items) {
          return this.errors.items.some(item => properties.includes(item.field))
        }
        return false
      }
    },
    computed: {
      docTitle () {
        return _.isObject(this.doc) && this.doc.id ? _.template(this.schema.title)({doc: this.doc}) : ''
      },
      activeTab () {
        return this.view.sectionsOrder[Number(this.tab)]
      },
      doc () {
        return addComputedValues(this.schema, this.fbDoc)
      },
      mapType () {
        return MAP_TYPE
      },
      actions () {
        let role = this.$store.getters.user ? this.$store.getters.user.role : 'public'
        let readActions = []
        if (this.schema.itemView[role]) {
          if (this.schema.itemView[role].edit) {
            readActions.push({
              title: 'Edit',
              method: () => this.edit()
            })
          }
          if (this.schema.itemView[role].delete) {
            readActions.push({
              title: 'Delete',
              method: () => { this.deleteDialogToggle = !this.deleteDialogToggle }
            })
          }
        }
        // if (this.schema.versionable) {
        //   readActions.push({
        //     title: 'New version',
        //     method: () => console.log('todo versionable')
        //   })
        // }
        let editActions = []
        return [
          ...(this.editToggle ? editActions : readActions)
        ]
      }
    },
    deactivated () {
      this.editToggle = false
    },
    activated () {
      this.reset()
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
