<template lang="pug">
  img(:src="url()")
</template>

<script>
  // TODO https://stackoverflow.com/questions/22385483/width-full-image-maintain-aspect-ratio-and-keep-in-center-horizontally-and-ver
  import {GOOGLE_API_KEY, MARKER_COLOR, MAP_TYPE, DEFAULT_LOCATION, DEFAULT_ZOOM} from '../main'
  const googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  export default {
    name: 'MapImage',
    props: ['location', 'zoom', 'markers'],
    methods: {
      url () {
        let lng = this.location ? this.location.longitude || DEFAULT_LOCATION.longitude : DEFAULT_LOCATION.longitude
        let lat = this.location ? this.location.latitude || DEFAULT_LOCATION.latitude : DEFAULT_LOCATION.latitude
        let zoom = this.zoom || DEFAULT_ZOOM
        let markers = this.markers ? `&markers=color:${MARKER_COLOR}|` + this.markers.map(m => { return `${m.latitude},${m.longitude}` }).join('|') : ''
        return `${googleMapsBaseUrl}?center=${lat},${lng}&zoom=${zoom}&size=320x200&maptype=${MAP_TYPE}&key=${GOOGLE_API_KEY}` + markers
      }
    }
  }
</script>

<style scoped>
  img {
    max-width:320px;
    max-height:200px;
  }
</style>
