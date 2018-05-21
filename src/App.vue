<template lang="pug">
  v-app
    v-navigation-drawer(v-if="!$root.$data.error && userIsAuthenticated", persistent, v-model="$store.state.drawer", enable-resize-watcher, fixed, app)
      main-menu(icons, actions)
    v-content(v-if="!$root.$data.error")
        keep-alive
          router-view(:key="$route.fullPath", v-if="$route.meta.keepAlive")
        router-view(:key="$route.fullPath", v-if="!$route.meta.keepAlive")
    v-alert(v-else error value) {{$root.$data.error}}
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
        if (this.$route) {
          return this.$store.getters.user !== null && this.$store.getters.user !== undefined
        } else return false
      }
    },
    created () {
      if (this.$route) {
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            this.$store.dispatch('autoSignIn', user)
          }
        })
      }
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
