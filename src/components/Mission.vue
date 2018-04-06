<template lang="pug">
  v-container(fluid)
      v-layout(row, align-center)
        v-flex(xs12)
          v-card
            v-card-title(primary-title)
              div
                h2 {{mission.name}}
            form(novalidate @submit.prevent="$validator.validateAll() && save()")
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
          v-card
            v-card-title(primary-title)
              div
                h2 Projects
            v-container(fluid ,grid-list-md)
              v-layout(row, wrap)
                v-flex(xs4, v-for="project in projects" :key="project.id")
                  v-card(flat, tile, :to="'/projects/'+project.id")
                    v-card-media(height="200px")
                      map-image(v-if="project.location", :location="project.location", :zoom="project.zoom")
                    v-card-title(primary-title)
                      div
                        h3(class="headline mb-0") {{project.name}}
</template>

<script>
  import { db } from '../main'
  import MapImage from './MapImage'

  export default {
    name: 'Mission',
    props: ['id'],
    components: {MapImage},
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
        let missionRef = db.collection('missions').doc(this.id)
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
      let missionRef = db.collection('missions').doc(this.id)
      return {
        mission: missionRef,
        projects: db.collection('projects').where('mission', '==', missionRef) // EcKP1msiCVhfZD4PTNy1
      }
    }
  }
</script>

<style scoped>

</style>
