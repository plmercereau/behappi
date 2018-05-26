<template lang="pug">
  v-container(fluid ,grid-list-md)
    v-layout(row, wrap)
      v-flex(d-flex xs12 sm6 md4)
        v-container(fluid)
          v-layout(row)
            v-flex
              div(class="caption") {{schema.properties[name].label}}{{schema.properties[name].required && '*'}}
              v-text-field(
              type="number"
              v-model.number="form['reported'+name].lat",
              :id="'form-' + name + '-latitude'",
              label="Latitude",
              :required="schema.properties[name].validation && schema.properties[name].validation.required",
              :error-messages="errors.collect(name+ '-latitude')",
              :data-vv-name="name+ '-latitude'",
              v-validate.initial="((schema.properties[name].validation && schema.properties[name].validation.required) ? 'required|' : '')+'decimal'",
              @change="updateMapCenter(name)")
              v-text-field(
              type="number"
              v-model.number="form['reported'+name].lng",
              :id="'form-' + name + '-longitude'",
              label="Longitude",
              :required="schema.properties[name].validation && schema.properties[name].validation.required",
              :error-messages="errors.collect(name+ '-longitude')",
              v-validate.initial="((schema.properties[name].validation && schema.properties[name].validation.required) ? 'required|' : '')+'decimal'",
              :data-vv-name="name + '-longitude'",
              @change="updateMapCenter(name)")
              v-slider(label="Zoom" :max="20" v-model="form[schema.properties[name].zoom]")
      v-flex(d-flex xs12 sm6 md8)
        gmap-map(
        :center="form[name]"
        @center_changed="updateCenter(name, $event)"
        :zoom="form[schema.properties[name].zoom]"
        @zoom_changed="updateField(schema.properties[name].zoom, $event)"
        :map-type-id="mapType"
        style="width: 480px; height: 300px")
          gmap-marker(v-if="schema.properties[name].markers && schema.properties[name].markers.self" :position="form['reported'+name]")
</template>

<script>
  export default {
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
