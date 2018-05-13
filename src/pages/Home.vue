<template lang="pug">
  v-container(fluid)
    tool-bar(title="Home")
    v-slide-y-transition(mode="out-in")
      v-layout(column, align-center)
        v-flex(xs12 sm6)
          h1 Welcome to the Brussels eHealth Applications Initiative
          v-btn(v-if="!userIsAuthenticated", to="/login") Sign In
          v-list(v-if="userIsAuthenticated")
            v-list-tile(value="true", v-for="(item, i) in menu", :key="i", :to="item.path")
              v-list-tile-content
                v-list-tile-title(v-text="item.title")
            v-list-tile(value="true", key="roadmap", href="https://trello.com/b/25y0sBq2/behappi", target="_blank")
              v-list-tile-content
                v-list-tile-title Roadmap on Trello
</template>
<script>
  import {MENU} from '../config'
  import _ from 'lodash'
  export default {
    name: 'Home',
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
      },
      menu () {
        let m = _.clone(MENU)
        m.splice(0, 1)
        return m
      }
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
