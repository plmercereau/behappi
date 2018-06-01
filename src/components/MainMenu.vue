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
        let role = this.userRole
        if (role === 'admin') return MENU
        return MENU.filter(item => {
          if (item.schema) {
            let schema = getSchema(item.schema)
            if (schema.collectionView[role]) return true
            else return false
          } else return true
        })
      },
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      },
      userRole () {
        if (this.userIsAuthenticated) {
          return this.$store.getters.user.role
        } else return 'public'
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
