<template lang="pug">
  v-container(fluid ,grid-list-md)
    v-layout(row, wrap)
      v-flex(d-flex xs12 sm6 md4)
        v-container(fluid)
          v-layout(row)
            v-flex
              div(class="caption") {{property.label}}{{property.required && '*'}}
              v-text-field(
              type="number"
              v-model.number="form['reported'+name].lat",
              :id="'form-' + name + '-latitude'",
              label="Latitude",
              :required="property.validation && property.validation.required",
              :error-messages="errors.collect(name+ '-latitude')",
              :data-vv-name="name+ '-latitude'",
              v-validate.initial="((property.validation && property.validation.required) ? 'required|' : '')+'decimal'",
              @change="updateMapCenter(name)")
              v-text-field(
              type="number"
              v-model.number="form['reported'+name].lng",
              :id="'form-' + name + '-longitude'",
              label="Longitude",
              :required="property.validation && property.validation.required",
              :error-messages="errors.collect(name+ '-longitude')",
              v-validate.initial="((property.validation && property.validation.required) ? 'required|' : '')+'decimal'",
              :data-vv-name="name + '-longitude'",
              @change="updateMapCenter(name)")
              v-slider(label="Zoom" :max="20" v-model="form[property.zoom]")
      v-flex(d-flex xs12 sm6 md8)
        gmap-map(
        :center="form[name]"
        @center_changed="updateCenter(name, $event)"
        :zoom="form[property.zoom]"
        @zoom_changed="updateField(property.zoom, $event)"
        :map-type-id="mapType"
        style="width: 480px; height: 300px")
          gmap-marker(v-if="property.markers && property.markers.self" :position="form['reported'+name]")
</template>

<script>
  export default {
    // TODO incomplete component
    name: 'LocationField',
    props: ['property', 'collection', 'value', 'errorMessages', 'dataVvName'],
    methods: {
      inputValue (event) {
        this.$emit('input', event)
      }
    }
  }
</script>

<style scoped>

</style>
