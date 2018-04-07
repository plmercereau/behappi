<template>
  <v-app>
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
          :to="item.path"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isAuth" icon @click.stop="signOut">
        <v-icon>exit_to_app</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
        <keep-alive>
          <router-view :key="$route.fullPath" v-if="$route.meta.keepAlive" />
        </keep-alive>
        <router-view :key="$route.fullPath" v-if="!$route.meta.keepAlive" />
    </v-content>
    <v-footer app>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
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
        title: 'BeHAppI'
      }
    },
    name: 'App',
    computed: {
      isAuth () {
        return firebase.auth().currentUser
      }
    },
    methods: {
      signOut () {
        if (firebase.auth().currentUser) {
          firebase.auth().signOut().then(() => {
            console.log('logged out')
            this.$router.replace('/')
          })
        }
        // firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
        //   this.$router.replace('/home')
        // }).catch((e) => {
        //   console.error(firebase)
        //   console.error(e)
        //   alert('erreur')
        // })
      }
    }

  }
</script>
