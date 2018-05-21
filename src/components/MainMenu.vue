<template lang="pug">
  v-list
    slot
    v-list-tile(value="true", v-for="(item, i) in items", :key="i", :to="path(item)")
      v-list-tile-action(v-if="icons")
        v-icon(v-html="item.icon")
      v-list-tile-content
        v-list-tile-title(v-text="title(item)")
    v-list-tile(v-if="actions && userIsAuthenticated", @click="signOut", color="primary")
      v-list-tile-action(v-if="icons")
        v-icon exit_to_app
      v-list-tile-content
        v-list-tile-title Sign out
</template>

<script>
  import _ from 'lodash'
  import {MENU} from '../config'
  import {getSchema} from '../schemas'

  export default {
    name: 'MainMenu',
    props: ['icons', 'actions'],
    computed: {
      items () {
        return MENU
      },
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      }
    },
    methods: {
      signOut () {
        this.$store.dispatch('logout')
        this.$router.push('/')
      },
      path (item) {
        return item.schema ? `/${getSchema(item.schema).name}` : item.path
      },
      title (item) {
        return item.schema ? _.get(getSchema(item.schema), 'collectionView.default.title') : item.title
      }
    }
  }
</script>
