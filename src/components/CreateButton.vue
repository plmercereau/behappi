<template lang="pug">
  div
    v-btn(:fab="isFab" :fixed="isFab" :dark="isFab" :bottom="isFab" :right="isFab" :color="isFab ? 'secondary': 'primary'" @click.stop="edit")
      v-icon(v-if="isFab") add
      slot
    v-dialog(v-model="editToggle" max-width="500px")
      v-card
        v-card-title {{ createParams.title || schema.title || 'Create'}}
        v-card-text
          form(novalidate @submit.prevent="create")
            template(v-for="(name) in createParams.properties")
              v-text-field(
              autofocus
              v-if="schema.properties[name].type==='string'"
              v-model="form[name]",
              :id="'form-' + name",
              :label="schema.properties[name].placeholder || schema.properties[name].label",
              v-validate="schema.properties[name].validation",
              :data-vv-name="'form-' + name")
              <!--TODO required, data-vv-name-->
              v-select(
              autofocus
              v-if="schema.properties[name].type==='collection'"
              v-model="form[name]",
              :items="form[name+'Collection']"
              :label="schema.properties[name].placeholder || schema.properties[name].label",
              single-line)
        v-card-actions
          v-btn(color="primary" flat @click.stop="$validator.validateAll() && create()") Create
          v-btn(color="primary" flat @click.stop="editToggle=false") Cancel

</template>

<script>
  import {addDocument} from '../schemas'
  import {formMixin} from '../mixins'
  export default {
    props: ['parentSchema', 'propertyName', 'parentData', 'fab'],
    name: 'CreateButton',
    mixins: [formMixin],
    methods: {
      create () { // TODO submit action, rather than $validator.validateAll() && create()
        let cleanForm = this.constructDataWithProperties(this.createParams.properties)
        if (this.createParams.parentProperty && this.parentData) {
          const parentProperties = this.createParams.inheritedProperties
          let filteredParentData = parentProperties ? parentProperties.reduce((obj, name) => {
            obj[name] = this.parentData[name]
            return obj
          }, {}) : {}
          cleanForm['_parentData'] = {
            id: this.parentData.id,
            ...filteredParentData
          }
        }
        addDocument(this.schema, cleanForm, this.parentSchema.properties[this.propertyName]).then((docRef) => {
          this.$router.push(`/${this.schema.name}/${docRef.id}`)
        }).catch(error => {
          console.log(error)
        })
        this.editToggle = false
      },
      cancel () {
        this.editToggle = false
      }
    },
    watch: {
      editToggle (newValue) {
        if (!newValue) {
          this.form = {}
        }
      }
    },
    computed: {
      createParams () {
        if (this.propertyName) {
          return this.parentSchema.properties[this.propertyName].create || this.schema.collectionView.default.create
        } else {
          return this.schema.collectionView.default.create
        }
      },
      isFab () {
        return Boolean(this.fab)
      },
      schema () {
        if (this.propertyName) {
          return this.parentSchema.properties[this.propertyName].schema
        } else {
          return this.parentSchema
        }
      }
    },
    mounted () {
      this.reset()
    }
  }
</script>

<style scoped>

</style>
