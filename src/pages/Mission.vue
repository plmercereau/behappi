<template lang="pug">
  item-details(:id="id", :schema="schema")
</template>

<script>
  import {getSchema} from '../schemas'
  export default {
    name: 'Mission',
    props: ['id'],
    data () {
      return {
        schema: getSchema('mission')
      }
    }
  }
</script>

<style scoped>

</style>
