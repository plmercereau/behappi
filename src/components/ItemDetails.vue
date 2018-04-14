<template lang="pug">
  v-card
    v-card-title(primary-title)
      div
        h2 {{data[schema.title]}}
    v-card-text
      v-container
        v-container(v-if="editToggle")
          form(novalidate @submit.prevent="save")
            template(v-for="(field, name) in schema.properties")
              v-text-field(
                autofocus
                v-if="field.type==='string' && !field.enum"
                v-model="form[name]",
                :id="'form-' + name",
                :label="field.attrs.placeholder",
                v-validate="field.validation",
                :data-vv-name="'form-' + name")
              <!--TODO required, data-vv-name-->
              v-select(
                autofocus
                v-if="field.type==='string' && field.enum"
                v-model="form[name]",
                :items="field.enum"
                :label="field.attrs.placeholder",
                single-line)
        v-list(v-if="!editToggle")
          v-list-tile(v-for="(field, name) in schema.properties" :key="name")
            v-list-tile-content
              v-list-tile-sub-title {{field.attrs.placeholder}}
              v-list-tile-title(v-if="!field.enum") {{data[name]}}
              v-list-tile-title(v-if="field.enum") {{getLabel(data[name], field.enum)}}
              v-divider
    v-card-actions
      v-btn(v-show="editToggle && !errors.any()" @click="$validator.validateAll() && save()") Save
      v-btn(v-if="editToggle" @click="reset") Reset
      v-btn(v-if="editToggle" @click="cancel") Cancel
      v-btn(v-if="!editToggle" @click="edit") Edit

</template>

<script>
  import * as firebase from 'firebase'
  export default {
    props: ['collection', 'id', 'schema'],
    name: 'ItemDetails',
    data () {
      return {
        form: {},
        data: {},
        editToggle: false
      }
    },
    methods: {
      save () {
        let docRef = firebase.firestore().collection(this.collection).doc(this.id)
        let diff = {}
        Object.keys(this.form).map((key, index) => {
          if (this.form[key] !== this.data[key]) {
            diff[key] = this.form[key]
          }
        })
        docRef.set(diff, { merge: true })
        this.editToggle = false
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
        this.form = Object.assign({}, this.data)
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
    firestore () {
      return {
        data: firebase.firestore().collection(this.collection).doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
