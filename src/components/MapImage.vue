<template lang="pug">
  v-container(fill-height fluid :class="{'pa-0': $vuetify.breakpoint.xsOnly }")
    v-layout(fill-height)
      v-flex(xs12 align-end flexbox)
        img(:src="url()")
</template>

<script>
  // TODO https://stackoverflow.com/questions/22385483/width-full-image-maintain-aspect-ratio-and-keep-in-center-horizontally-and-ver
  import _ from 'lodash'
  import {MARKER_COLOR, DEFAULT_LOCATION, DEFAULT_ZOOM, GOOGLE_API_KEY, MAP_TYPE} from '../config'
  const googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  export default {
    name: 'MapImage',
    props: ['schema', 'doc', 'locationProperty'],
    methods: {
      getMarkers () {
        let markers = []
        let locationProp = this.schema.properties[this.locationProperty]
        let markerProp = locationProp.markers
        if (markerProp && markerProp.collection && this.doc[markerProp.collection]) {
          let refCollection = this.doc[markerProp.collection]
          Object.keys(refCollection).map(key => {
            if (refCollection[key]) {
              let location = refCollection[key][markerProp.property]
              if (location) markers.push(location)
            }
          })
        }
        if (markerProp && markerProp.self) {
          markers.push(this.doc[this.locationProperty])
        }
        return markers
      },
      url () {
        let lat = this.doc[this.locationProperty] ? this.doc[this.locationProperty].latitude || DEFAULT_LOCATION.longitude : DEFAULT_LOCATION.longitude
        let lng = this.doc[this.locationProperty] ? this.doc[this.locationProperty].longitude || DEFAULT_LOCATION.longitude : DEFAULT_LOCATION.longitude
        let zoom = this.doc[this.schema.properties[this.locationProperty].zoom] || DEFAULT_ZOOM
        let markers = this.getMarkers()
        let markersStr = (!_.isEmpty(markers)) ? `&markers=color:${MARKER_COLOR}|` + markers.map(m => { return `${m.latitude},${m.longitude}` }).join('|') : ''
        return `${googleMapsBaseUrl}?center=${lat},${lng}&zoom=${zoom}&size=480x300&maptype=${MAP_TYPE}&key=${GOOGLE_API_KEY}` + markersStr
      }
    }
  }
</script>

<style scoped>
  img {
    max-width:480px;
    max-height:300px;
  }
</style>
