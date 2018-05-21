<template lang="pug">
  v-toolbar(app, :extended="edit")
    v-snackbar(top :timeout="3000" v-model="snackbar") {{snackbarMessage}}
      v-btn(flat @click.native="snackbar = false") Close
    v-toolbar-side-icon(v-if="userIsAuthenticated", @click.stop="toggleDrawer")
    v-toolbar-title {{title}}
    v-spacer
    v-text-field(v-if="search" prepend-icon="search" v-model="searchInput" hide-details single-line)
    v-tooltip(bottom)
      span(slot="activator")
        v-icon(v-if="isOnline" color="success") link
        v-icon(v-else color="warning") link_off
      span {{snackbarMessage}}
    v-menu(v-if="actions" bottom left)
      v-btn(icon slot="activator")
        v-icon more_vert
      v-list
        v-list-tile(v-for="(action, index) in actions" :key="index" @click="action.method")
          v-list-tile-title {{action.title}}
    div(slot="extension", v-if="edit")
      slot
</template>

<script>
  const EVENTS = ['online', 'offline', 'load']
  export default {
    name: 'ToolBar',
    data () {
      return {
        isOnline: navigator.onLine || false,
        snackbar: false,
        searchInput: this.value
      }
    },
    props: ['value', 'search', 'title', 'actions', 'edit'],
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      },
      snackbarMessage () {
        return this.isOnline ? 'You are now online' : 'You are offline'
      }
    },
    watch: {
      searchInput (val) {
        this.$emit('input', val)
      }
    },
    methods: {
      updateOnlineStatus() {
        let isOnline = this.isOnline
        this.isOnline = navigator.onLine || false
        this.$emit('detected-condition', this.isOnline)
        if (isOnline !== this.isOnline) {
          this.snackbar = true
        }
      },
      toggleDrawer () {
        this.$store.commit('toggleDrawer')
      }
    },
    mounted () {
      EVENTS.forEach(event => window.addEventListener(event, this.updateOnlineStatus))
    },
    beforeDestroy() {
      EVENTS.forEach(event => window.removeEventListener(event, this.updateOnlineStatus))
    }
  }
</script>

<style scoped>

</style>
