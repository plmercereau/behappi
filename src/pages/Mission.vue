<template lang="pug">
  page
    tool-bar(:title="mission.name")
    item-details(collection="missions", :id="id", :schema="schema")
    card-list(title="Projects" v-if="mission.projects")
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
  import schema from '@/schemas/mission'
  import _ from 'lodash'
  export default {
    name: 'Mission',
    props: ['id'],
    data () {
      return {
        mission: {},
        schema: _.merge(schema, defaultSchema)
      }
    },
    firestore () {
      return {
        mission: firebase.firestore().collection('missions').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
