<template lang="pug">
  page
    item-detail(:title="application.name" save="$validator.validateAll() && save()")
      <!--text-field(-->
        <!--id="form-name"-->
        <!--:edit="editToggle"-->
        <!--label="Name"-->
        <!--v-model="formData.name"-->
        <!--v-validate="'required|min:3'",-->
        <!--)-->
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
    card-list(title="Projects using this application")
      inline-item-detail(v-for="(usage, propName) in application.applicationUsages", :key="propName")
        template(slot="title")
          h3 {{usage.orgUnit && usage.orgUnit.name}}
          i description of the application usage
        template(slot="actions")
          v-btn(flat color="orange" :to="'/'") See configuration
          v-btn(flat color="orange" :to="'/projects/' + (usage.orgUnit && usage.orgUnit.id)") See project
</template>

<script>
  import * as firebase from 'firebase'
  import _ from 'lodash'

  export default {
    name: 'Application',
    props: ['id'],
    data () {
      return {
        editToggle: false,
        projects: [],
        application: {},
        formData: {},
        headers: [
          {
            text: 'Location',
            align: 'left',
            sortable: true,
            value: 'orgUnit.name'
          },
          {
            text: 'Usage detail',
            align: 'left'
          }
        ]
      }
    },
    computed: {
      _ () {
        return _
      }
    },
    methods: {
      save () {
        let applicationRef = firebase.firestore().collection('applications').doc(this.id)
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
        application: firebase.firestore().collection('applications').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
