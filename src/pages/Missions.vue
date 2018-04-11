<template lang="pug">
  page
    card-list(title="Missions")
      v-flex(d-flex xs12 sm6 md4, v-for="mission in missions" :key="mission.id")
        v-card(:to="'/missions/'+mission.id")
          v-card-media(height="200px")
            map-image(v-if="mission.location", :location="mission.location", :zoom="mission.zoom")
          v-card-title(primary-title)
            div
              h3(class="headline mb-0") {{mission.name}}
</template>

<script>
  import * as firebase from 'firebase'

  export default {
    name: 'Missions',
    data () {
      return {
        missions: []
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
