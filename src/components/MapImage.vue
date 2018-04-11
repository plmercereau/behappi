<template lang="pug">
  img(:src="url()")
</template>

<script>
  // TODO https://stackoverflow.com/questions/22385483/width-full-image-maintain-aspect-ratio-and-keep-in-center-horizontally-and-ver
  const googleMapsBaseUrl = 'https://maps.googleapis.com/maps/api/staticmap'
  const GOOGLE_API_KEY = 'AIzaSyAzTKuGAzcoIwJ31pCktzJ2I8hcqwHOPJs'
  const MAP_TYPE = 'roadmap' // https://developers.google.com/maps/documentation/javascript/maptypes?hl=fr
  const DEFAULT_LOCATION = {
    latitude: 50.833349,
    longitude: 4.364177
  }
  const DEFAULT_ZOOM = 5
  export default {
    name: 'MapImage',
    props: ['location', 'zoom'],
    methods: {
      url () {
        let lng = this.location ? this.location.longitude || DEFAULT_LOCATION.longitude : DEFAULT_LOCATION.longitude
        let lat = this.location ? this.location.latitude || DEFAULT_LOCATION.latitude : DEFAULT_LOCATION.latitude
        let zoom = this.zoom || DEFAULT_ZOOM
        // &markers={% for project in mission.get_children %}color:brown%7C{{ project.specific.location.y}},{{ project.specific.location.x}}{% if not forloop.last%}|{% endif %}|{% endfor %}" width="100%" height="100%" border="0" alt="">
        return `${googleMapsBaseUrl}?center=${lat},${lng}&zoom=${zoom}&size=320x200&maptype=${MAP_TYPE}&key=${GOOGLE_API_KEY}`
      }
    }
  }
</script>

<style scoped>
  img {
    max-width:320px;
    max-height:200px;
    width:auto;
    height:auto;
  }
</style>
