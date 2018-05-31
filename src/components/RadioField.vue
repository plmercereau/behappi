<template lang="pug">
  v-radio-group(v-if="property.unique",
  :label="property.label",
  :value="value",
  @change="inputValue"
  :required="property.validation && property.validation.required",
  v-validate.initial="property.validation",
  :error-messages="errorMessages",
  :data-vv-name="dataVvName")
    v-radio(v-for="item in collection" :key="item.value" :label="item.text" :value="item.value")
</template>

<script>
  export default { // TODO does not take the initial value into account
    name: 'RadioField',
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
