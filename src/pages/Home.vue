<template lang="pug">
  v-container(fluid)
    v-slide-y-transition(mode="out-in")
      v-layout(column, align-center)
        img(src="@/assets/logo.png", alt="Vuetify.js", class="mb-5")
        h1 Welcome to the Brussels eHealth Applications Initiative
        v-btn(v-if="!userIsAuthenticated", to="/login") Sign In
        a(href="https://trello.com/b/25y0sBq2/behappi") Roadmap
</template>
<script>
  export default {
    name: 'Home',
    data () {
      return {
        applications: []
      }
    },
    computed: {
      userIsAuthenticated () {
        return this.$store.getters.user !== null && this.$store.getters.user !== undefined
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
