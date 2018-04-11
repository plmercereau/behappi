<template lang="pug">
  page
    item-detail(:title="project.name", save="$validator.validateAll() && save()")
      div(v-if="!editToggle") Name: {{project.name}}
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
    card-list(title="Applications in use")
      inline-item-detail(v-for="(usage, propName) in project.applicationUsages", :key="propName")
        template(slot="title")
          h3 {{usage.application && usage.application.name}}
          i description of the application usage
        template(slot="actions")
          v-btn(flat color="orange" :to="'/'") See configuration
          v-btn(flat color="orange" :to="'/applications/' + (usage.application && usage.application.id)") See application
</template>

<script>
  import * as firebase from 'firebase'

  export default {
    name: 'Project',
    props: ['id'],
    data () {
      return {
        editToggle: false,
        project: {},
        formData: {}
      }
    },
    methods: {
      save () {
        let projectRef = firebase.firestore().collection('orgUnits').doc(this.id)
        projectRef.set(this.formData, { merge: true })
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
        this.formData = Object.assign({}, this.project)
      }
    },
    firestore () {
      return {
        project: firebase.firestore().collection('orgUnits').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
