<template lang="pug">
  v-app
    v-navigation-drawer(v-if="userIsAuthenticated", persistent, v-model="$store.state.drawer", enable-resize-watcher, fixed, app)
      main-menu(icons, actions)
    v-content
        keep-alive
          router-view(:key="$route.fullPath", v-if="$route.meta.keepAlive")
        router-view(:key="$route.fullPath", v-if="!$route.meta.keepAlive")
    <!--v-footer(app)-->
      <!--span &copy; 2018-->
</template>

<script>
  import firebase from 'firebase'

  export default {
    name: 'App',
    data () {
      return {
        drawer: true
      }
    },
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      }
    },
    created () {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.$store.dispatch('autoSignIn', user)
        }
      })
    }
  }
</script>
<style scoped>
  .footer {
    position: fixed;
    bottom: 0;
  }
  .large {
    width: 100%;
  }
</style>
