<template lang="pug">
  page
    tool-bar(:title="project.name")
    item-details(collection="orgUnits", :id="id", :params="params")
    card-list(title="Applications in use")
      inline-item-detail(v-for="(usage, propName) in project.applicationUsages", :key="propName")
        template(slot="title")
          h3 {{usage.application && usage.application.name}}
          i description of the application usage
        template(slot="actions")
          v-btn(flat color="orange" :to="'/'") See configuration
          v-btn(flat color="orange" :to="'/applications/' + (usage.application && usage.application.id)") See application
</template>

<script>
  import * as firebase from 'firebase'

  export default {
    name: 'Project',
    props: ['id'],
    data () {
      return {
        project: {},
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
        project: firebase.firestore().collection('orgUnits').doc(this.id)
      }
    }
  }
</script>

<style scoped>

</style>
