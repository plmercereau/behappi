<template lang="pug">
  page
    tool-bar(:title="application.name")
    item-details(collection="applications", :id="id", :schema="schema")
    card-list(:title="'Projects using ' + application.name")
      inline-item-detail(v-for="(usage, propName) in application.applicationUsages", :key="propName")
        template(slot="title")
          h3 {{usage.orgUnit && usage.orgUnit.name}}
          i description of the application usage
        template(slot="actions")
          v-btn(flat color="orange" :to="'/'") See configuration
          v-btn(flat color="orange" :to="'/projects/' + (usage.orgUnit && usage.orgUnit.id)") See project
</template>

<script>
  import * as firebase from 'firebase'
  import defaultSchema from '@/schemas/default'
  import schema from '@/schemas/application'
  import _ from 'lodash'
  export default {
    name: 'Application',
    props: ['id'],
    data () {
      return {
        projects: [],
        application: {},
        schemaMission: _.merge(schema, defaultSchema)
      }
    },
    firestore () {
      return {
        application: firebase.firestore().collection('applications').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
