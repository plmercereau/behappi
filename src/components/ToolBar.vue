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
  export default {
    name: 'ToolBar',
    data () {
      return {
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
      isOnline (newVal, oldVal) {
        if (oldVal !== newVal) {
          this.snackbar = true
        }
      },
      searchInput (val) {
        this.$emit('input', val)
      }
    },
    methods: {
      toggleDrawer () {
        this.$store.commit('toggleDrawer')
      }
    }
  }
</script>

<style scoped>

</style>
