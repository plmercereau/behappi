<template lang="pug">
  v-app
    v-navigation-drawer(v-if="userIsAuthenticated", persistent, v-model="$store.state.drawer", enable-resize-watcher, fixed, app)
      v-list
        v-list-tile(value="true", v-for="(item, i) in items", :key="i", :to="item.path")
          v-list-tile-action
            v-icon(v-html="item.icon")
          v-list-tile-content
            v-list-tile-title(v-text="item.title")
        v-list-tile(v-if="userIsAuthenticated", @click="signOut")
          v-list-tile-action
            v-icon exit_to_app
          v-list-tile-content
            v-list-tile-title Sign out
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
    data () {
      return {
        drawer: true,
        items: [
          {
            icon: 'home',
            title: 'Home',
            path: '/home'
          },
          {
            icon: 'map',
            title: 'Missions',
            path: '/missions'
          },
          {
            icon: 'local_hospital',
            title: 'Projects',
            path: '/projects'
          },
          {
            icon: 'apps',
            title: 'Applications',
            path: '/applications'
          }
        ]
      }
    },
    name: 'App',
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      }
    },
    methods: {
      signOut () {
        this.$store.dispatch('logout')
        this.$router.push('/')
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
