<template lang="pug">
  v-toolbar(app)
    v-toolbar-side-icon(v-if="userIsAuthenticated", @click.stop="toggleDrawer")
    v-toolbar-title {{title}}
    v-spacer
    v-text-field(v-if="search" prepend-icon="search" v-model="searchInput" hide-details single-line)
</template>

<script>
  export default {
    name: 'ToolBar',
    data () {
      return {
        searchInput: this.value
      }
    },
    props: ['value', 'search', 'title'],
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      }
    },
    watch: {
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
