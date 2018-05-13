<template lang="pug">
  item-details(:id="id", :schema="schema")
</template>

<script>
  import {getSchema} from '../schemas'
  export default {
    name: 'Application',
    props: ['id'],
    data () {
      return {
        schema: getSchema('application')
      }
    }
  }
</script>

<style scoped>

</style>
