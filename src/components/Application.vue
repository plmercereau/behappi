<template lang="pug">
  v-container(fluid)
      v-layout(row, align-center)
        v-flex(xs12)
          v-card
            v-card-title(primary-title)
              div
                h2 {{application.name}}
            form(novalidate @submit.prevent="$validator.validateAll() && save()")
              div(v-if="!editToggle") Name: {{application.name}}
              v-text-field(
                v-if="editToggle",
                v-model="formData.name",
                id="form-name",
                label="Name",
                v-validate="'required|min:3'",
                required
                data-vv-name="form-name")
              v-btn(v-show="editToggle && !errors.any()" @click="$validator.validateAll() && save()") Save
              v-btn(v-if="editToggle" @click="reset") Reset
              v-btn(v-if="editToggle" @click="cancel") Cancel
              v-btn(v-if="!editToggle" @click="edit") Edit
          v-card
            v-card-title(primary-title)
              div
                h2 Projects using it
            v-container(fluid ,grid-list-md)
              v-list
                v-list-tile(v-for="usage in application.applicationUsages", :key="usage.orgUnit.id", :to="'/projects/'+usage.orgUnit.id")
                  v-list-tile-content
                    v-list-tile-title {{usage.orgUnit.name}}
</template>

<script>
  import { db } from '../main'
  import MapImage from './MapImage'

  export default {
    name: 'Application',
    props: ['id'],
    components: {MapImage},
    data () {
      return {
        editToggle: false,
        projects: [],
        application: {},
        formData: {}
      }
    },
    methods: {
      save () {
        let applicationRef = db.collection('applications').doc(this.id)
        applicationRef.set(this.formData, { merge: true })
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
        this.formData = Object.assign({}, this.application)
      }
    },
    firestore () {
      return {
        application: db.collection('applications').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
