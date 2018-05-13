<template lang="pug">
  item-details(:id="id", :schema="schema")
</template>

<script>
  import {getSchema} from '../schemas'
  export default {
    name: 'Project',
    props: ['id'],
    data () {
      return {
        schema: getSchema('project')
      }
    }
  }
</script>

<style scoped>

</style>
