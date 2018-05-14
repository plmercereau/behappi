<template lang="pug">
  item-collection(:schema="schema")
</template>

<script>
  import {getSchema} from '../schemas'
  export default {
    name: 'Missions',
    data () {
      return {
        schema: getSchema('mission')
      }
    }
  }
</script>

<style scoped>
</style>
