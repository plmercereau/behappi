<template lang="pug">
  v-app
    v-navigation-drawer(v-if="userIsAuthenticated", persistent, v-model="$store.state.drawer", enable-resize-watcher, fixed, app)
      v-list
        v-list-tile(value="true", v-for="(item, i) in items", :key="i", :to="item.path")
          v-list-tile-action
            v-icon(v-html="item.icon")
          v-list-tile-content
            v-list-tile-title(v-text="item.title")
    v-toolbar(app)
      v-toolbar-side-icon(v-if="userIsAuthenticated", @click.stop="toggleDrawer")
      v-toolbar-title(v-text="title")
      v-spacer
      v-btn(v-if="userIsAuthenticated", icon, @click="signOut")
        v-icon exit_to_app
    v-content
        keep-alive
          router-view(:key="$route.fullPath", v-if="$route.meta.keepAlive")
        router-view(:key="$route.fullPath", v-if="!$route.meta.keepAlive")
    v-footer(app)
      span &copy; 2018
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
        ],
        title: 'Behappi'
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
        // firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
        //   this.$router.replace('/home')
        // }).catch((e) => {
        //   console.error(firebase)
        //   console.error(e)
        //   alert('erreur')
        // })
      },
      toggleDrawer () {
        this.$store.commit('toggleDrawer')
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
