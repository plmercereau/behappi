<template lang="pug">
  div
    v-btn(:fab="isFab" :fixed="isFab" :dark="isFab" :bottom="isFab" :left="isFab" :color="isFab ? 'orange': 'primary'" @click.stop="toggleDialog = !toggleDialog")
      v-icon(v-if="isFab") add
      slot
    v-dialog(v-model="toggleDialog" max-width="500px")
      v-card
        v-card-title {{ schema.titleCreate || schema.title || 'Create'}}
        v-card-text
          form(novalidate @submit.prevent="create")
            template(v-for="(field, name) in schema.properties")
              v-text-field(
              autofocus
              v-if="field.type==='string' && !field.enum && (schema.requiredCreate ? schema.requiredCreate.indexOf(name) > -1 : true)"
              v-model="form[name]",
              :id="'form-' + name",
              :label="field.attrs.placeholder",
              v-validate="field.validation",
              :data-vv-name="'form-' + name")
              <!--TODO required, data-vv-name-->
              v-select(
              autofocus
              v-if="field.type==='string' && field.enum && (schema.requiredCreate ? schema.requiredCreate.indexOf(name) > -1 : true)"
              v-model="form[name]",
              :items="field.enum"
              :label="field.attrs.placeholder",
              single-line)
        v-card-actions
          v-btn(color="primary" flat @click.stop="$validator.validateAll() && create()") Create
          v-btn(color="primary" flat @click.stop="toggleDialog=false") Cancel

</template>

<script>
  import * as firebase from 'firebase'
  import _ from 'lodash'
  import {getFinalData} from '../helpers'
  export default {
    props: ['collection', 'schema', 'default', 'to', 'fab'],
    name: 'CreateButton',
    data () {
      return {
        form: {},
        toggleDialog: false
      }
    },
    methods: {
      create () { // TODO submit action, rather than $validator.validateAll() && create()
        let values = _.merge(this.default || {}, this.form)
        firebase.firestore().collection(this.collection).add(getFinalData(values)).then((docRef) => {
          this.$router.push(`${this.to}/${docRef.id}`) // TODO add / if not in the base url
        }).catch(error => {
          console.log(error)
        })
        this.toggleDialog = false
      },
      cancel () {
        this.form = {} // Object.assign({}, this.data)
        this.toggleDialog = false
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
    computed: {
      isFab () {
        return Boolean(this.fab)
      }
    }
  }
</script>

<style scoped>

</style>
