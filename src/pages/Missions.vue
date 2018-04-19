<template lang="pug">
  page
    tool-bar(:title="schema.collectionTitle", search, v-model="search")
    card-list
      v-card-actions(slot="actions")
        create-button(fab, :schema="schema", to="/missions")
      v-flex(d-flex xs12 sm6 md4, v-for="doc in filteredList" :key="doc.id")
        inline-item-detail(:doc="doc", :schema="schema")
          div(v-if="nbProjects(doc)") {{nbProjects(doc)}} {{nbProjects(doc) | pluralize('project')}}
</template>

<script>
  import * as firebase from 'firebase'
  import {getSchema} from '../schemas'

  export default {
    name: 'Missions',
    data () {
      return {
        missions: [],
        search: '',
        schema: getSchema('mission')
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
