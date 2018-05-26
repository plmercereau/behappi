<template lang="pug">
  v-layout(row wrap)
    v-flex(xs12 sm12)
      v-subheader {{label}}{{required ? '*' : ''}}
    v-flex(xs12 sm5)
      v-text-field(:value="value.text",
        @input="updateText",
        label="Link title",
        v-validate.initial="(required ? 'required|' : '') + 'min:3'",
        :error-messages="errors.collect(label.toLowerCase() + ' title')",
        :data-vv-name="label.toLowerCase() + ' title'")
    v-flex(xs12 sm7)
      v-text-field(:value="value.value",
        @input="updateValue",
        label="URL",
        v-validate.initial="(required ? 'required|' : '') + 'url'",
        :error-messages="errors.collect(label.toLowerCase() + ' url')",
        :data-vv-name="label.toLowerCase() + ' url'")
</template>

<script>
  export default {
    name: 'LinkField',
    inject: [ 'parentValidator' ],
    props: {
      value: {
        default: {},
        type: Object
      },
      label: {
        default: 'Link',
        type: String
      },
      required: {
        default: false,
        type: Boolean
      }
    },
    methods: {
      updateText (event) {
        this.$emit('input', {
          value: this.value.value,
          text: event
        })
      },
      updateValue (event) {
        this.$emit('input', {
          value: event,
          text: this.value.text
        })
      }
    },
    created () {
      this.$validator = this.parentValidator
    }
  }
</script>
