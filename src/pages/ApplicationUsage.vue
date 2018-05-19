<template lang="pug">
  item-details(:id="id", :schema="schema")
</template>

<script>
  import {getSchema} from '../schemas'
  export default {
    name: 'ApplicationUsage',
    props: ['id'],
    data () {
      return {
        schema: getSchema('applicationUsage')
      }
    }
  }
</script>

<style scoped>

</style>
