<template lang="pug">
  page
    tool-bar(:title="application.name")
    item-details(collection="applications", :id="id", :params="params")
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
  export default {
    name: 'Application',
    props: ['id'],
    data () {
      return {
        projects: [],
        application: {},
        params: {
          titleAttribute: 'name',
          fields: [
            {
              attribute: 'name',
              label: 'Name',
              validation: 'required|min:3'
            }
          ]
        }
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
