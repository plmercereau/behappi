<template lang="pug">
  div
    div(v-if="!edit") {{label}}: {{value}}
    v-text-field(
      v-if="edit",
      :value="value",
      @input="updateSelf($event)",
      :id="id",
      :label="label",
      v-validate="$attrs",
      :data-vv-name="id"
      )
</template>

<script>
  // TODO required

  export default {
    props: ['id', 'edit', 'label', 'value'],
    name: 'TextField',
    inheritAttrs: false,
    methods: {
      updateSelf (value) {
        this.$emit('input', value)
      }
    }
  }
</script>

<style scoped>

</style>
