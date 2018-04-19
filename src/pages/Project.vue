<template lang="pug">
  page
    tool-bar(:title="data.name")
    item-details(:id="id", :schema="schema")
</template>

<script>
  import * as firebase from 'firebase'
  import {getSchema} from '../schemas'
  export default {
    name: 'Project',
    props: ['id'],
    data () {
      return {
        data: {},
        schema: getSchema('project')
      }
    },
    firestore () {
      return {
        data: firebase.firestore().collection('orgUnits').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
