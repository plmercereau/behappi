<template lang="pug">
  v-menu(:close-on-content-click="false",
      v-model="menu",
      :nudge-right="40",
      lazy,
      transition="scale-transition",
      offset-y,
      full-width,
      max-width="290px",
      min-width="290px")
    v-text-field(slot="activator",
      v-model="date",
      :label="label",
      hint="DD/MM/YYYY format",
      persistent-hint,
      prepend-icon="event",
      :required="required",
      @blur="$emit('input', parseDate(date))",
      v-validate.initial="(required ? 'required|' : '') + 'date_format:DD/MM/YYYY'",
      :error-messages="errors.collect(label.toLowerCase())",
      :data-vv-name="label.toLowerCase()")
    v-date-picker(
      :value="value",
      @input="inputDate"
      no-title)
</template>

<script>
  export default {
    name: 'DateField',
    inject: [ 'parentValidator' ],
    props: ['value', 'label', 'required'],
    data () {
      return {
        date: null,
        menu: false
      }
    },
    methods: {
      inputDate (event) {
        this.$emit('input', event)
        this.menu = false
        this.date = this.formatDate(event)
      },
      formatDate (date) {
        if (!date) return null
        const [year, month, day] = date.split('-')
        return `${day}/${month}/${year}`
      },
      parseDate (date) {
        if (!date) return null
        const [day, month, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    },
    created () {
      this.$validator = this.parentValidator
    },
    mounted () {
      this.date = this.formatDate(this.value)
    }
  }
</script>

<style scoped>

</style>
