<template lang="pug">
  v-container(fluid)
      v-layout(row, align-center)
        v-flex(xs12)
          v-card
            v-card-title(primary-title)
              div
                h2 Missions
            v-container(fluid ,grid-list-md)
                v-layout(row, wrap)
                  v-flex(xs4, v-for="mission in missions" :key="mission.id")
                    v-card(flat, tile, :to="'/missions/'+mission.id")
                      v-card-media(height="200px")
                        map-image(v-if="mission.location", :location="mission.location", :zoom="mission.zoom")
                      v-card-title(primary-title)
                        div
                          h3(class="headline mb-0") {{mission.name}}
                      <!--v-card-actions-->
                        <!--v-btn(flat icon)-->
                          <!--v-icon favorite-->
                        <!--v-btn(flat icon)-->
                          <!--v-icon bookmark-->
                        <!--v-btn(flat icon)-->
                          <!--v-icon share-->
</template>

<script>
  import { db } from '../main'
  import MapImage from './MapImage'

  export default {
    name: 'Missions',
    components: {MapImage},
    data () {
      return {
        missions: []
      }
    },
    firestore () {
      return {
        missions: db.collection('missions').orderBy('name')
      }
    }
  }
</script>

<style scoped>

</style>
