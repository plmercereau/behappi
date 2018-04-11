<template lang="pug">
  page
    item-detail(:title="mission.name", save="$validator.validateAll() && save()")
      div(v-if="!editToggle") Name: {{mission.name}}
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
    card-list(title="Projects")
      v-flex(d-flex xs12 sm6 md4, v-for="project in projects" :key="project.id")
        v-card(flat, tile, :to="'/projects/'+project.id")
          v-card-media(height="200px")
            map-image(v-if="project.location", :location="project.location", :zoom="project.zoom")
          v-card-title(primary-title)
            div
              h3(class="headline mb-0") {{project.name}}
</template>

<script>
  import * as firebase from 'firebase'

  export default {
    name: 'Mission',
    props: ['id'],
    data () {
      return {
        editToggle: false,
        projects: [],
        mission: {},
        formData: {}
      }
    },
    methods: {
      save () {
        let missionRef = firebase.firestore().collection('missions').doc(this.id)
        missionRef.set(this.formData, { merge: true })
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
        this.formData = Object.assign({}, this.mission)
      }
    },
    firestore () {
      let missionRef = firebase.firestore().collection('missions').doc(this.id)
      return {
        mission: missionRef,
        projects: firebase.firestore().collection('orgUnits').where('mission', '==', missionRef).where('categories.project', '==', true).orderBy('name')
      }
    }
  }
</script>

<style scoped>

</style>
