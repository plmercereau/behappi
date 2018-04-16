<template lang="pug">
  page
    tool-bar(:title="mission.name")
    item-details(collection="missions", :id="id", :schema="schemaMission")
    card-list(title="Projects")
      template(slot="actions")
        create-button(collection="orgUnits", :schema="schemaProject", :default="defaultProject" to="/projects") New project
      v-flex(d-flex xs12 sm6 md4, v-for="(project, projectId) in mission.projects" :key="projectId")
        v-card(flat, tile, :to="'/projects/'+project.id")
          v-card-media(height="200px")
            map-image(v-if="project.location", :location="project.location", :zoom="project.zoom", :markers="[project.location]")
          v-card-title(primary-title)
            div
              h3(class="headline mb-0") {{project.name}}
</template>

<script>
  import * as firebase from 'firebase'
  import defaultSchema from '@/schemas/default'
  import schemaProject from '@/schemas/project'
  import schemaMission from '@/schemas/mission'
  import _ from 'lodash'
  import {DEFAULT_LOCATION} from '../main'
  export default {
    name: 'Mission',
    props: ['id'],
    data () {
      return {
        mission: {},
        schemaMission: _.merge(schemaMission, defaultSchema),
        schemaProject: _.merge(schemaProject, defaultSchema),
        defaultProject: {
          status: 'draft',
          categories: {
            project: true
          },
          mission: firebase.firestore().collection('missions').doc(this.id),
          location: DEFAULT_LOCATION
        }
      }
    },
    firestore () {
      return {
        mission: firebase.firestore().collection('missions').doc(this.id)
      }
    },
    watch: {
      mission (val) {
        if (val.location) this.defaultProject.location = val.location
      }
    }
  }
</script>

<style scoped>

</style>
