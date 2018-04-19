<template lang="pug">
  page
    tool-bar(:title="data.name")
    item-details(:id="id", :schema="schema")
</template>

<script>
  import * as firebase from 'firebase'
  import {getSchema} from '../schemas'
  export default {
    name: 'Mission',
    props: ['id'],
    data () {
      return {
        data: {},
        schema: getSchema('mission')
      }
    },
    firestore () {
      return {
        data: firebase.firestore().collection('missions').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
