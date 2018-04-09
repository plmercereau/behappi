<template lang="pug">
  v-container(fluid)
    v-slide-y-transition(mode="out-in")
      v-layout(column, align-center)
        img(src="@/assets/logo.png", alt="Vuetify.js", class="mb-5")
        h1 Welcome to the Brussels eHealth Applications Initiative
        v-btn(v-if="!isAuth", to="/login") Sign In
        v-list
          v-subheader Roadmap
          v-list-tile CRUD to all concepts: Missions, Projects, Applications, Usages
          v-list-tile Medical activities
          v-list-tile When submitting a form, select only fields to update, not all of them (especially the ref values as they are replaced by an object)
          v-list-tile Remove all usages when we delete an application
          v-list-tile Complete the Excel exports
          v-list-tile Define four permission levels: public (done), authenticated (done), manager (todo), superuser (todo)
          v-list-tile Bug: the 'Sign out' button does not appear after sign up - only when we reload the page
</template>
<script>
  import { db } from '../main'
  import firebase from 'firebase'
  export default {
    name: 'Home',
    data () {
      return {
        applications: []
      }
    },
    computed: {
      isAuth () {
        return firebase.auth().currentUser
      }
    },
    firestore () {
      return {
        applications: db.collection('applications').orderBy('name')
      }
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
