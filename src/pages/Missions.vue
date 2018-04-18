<template lang="pug">
  page
    tool-bar(title="Missions", search, v-model="search")
    card-list
      create-button(fab, collection="missions", :schema="schema", to="/missions")
      v-flex(d-flex xs12 sm6 md4, v-for="mission in filteredList" :key="mission.id")
        v-card(:to="'/missions/'+mission.id")
          v-card-media(height="200px")
            map-image(v-if="mission.location", :location="mission.location", :zoom="mission.zoom", :markers="markersProjects(mission)")
          v-card-title(primary-title)
            div
              div(class="headline") {{mission.name}}
              div(v-if="nbProjects(mission)") {{nbProjects(mission)}} {{nbProjects(mission) | pluralize('project')}}
            v-spacer
            i {{mission.status}}
</template>

<script>
  import * as firebase from 'firebase'
  import defaultSchema from '@/schemas/default'
  import schema from '@/schemas/mission'
  import _ from 'lodash'

  export default {
    name: 'Missions',
    data () {
      return {
        missions: [],
        search: '',
        schema: _.merge(schema, defaultSchema)
      }
    },
    methods: {
      nbProjects (mission) {
        return mission.projects && Object.keys(mission.projects).length
      },
      markersProjects (mission) {
        if (mission && mission.projects) {
          let res = Object.keys(mission.projects).filter(key => {
            return (mission.projects[key].location)
          }).map(key => {
            return mission.projects[key].location
          })
          return res
        } else {
          return []
        }
      }
    },
    computed: {
      filteredList () {
        if (this.missions) {
          return this.missions.filter(mission => {
            return mission.name.toLowerCase().includes(this.search.toLowerCase())
          })
        } else return []
      }
    },
    firestore () {
      return {
        missions: firebase.firestore().collection('missions').orderBy('name')
      }
    }
  }
</script>

<style scoped>
</style>
