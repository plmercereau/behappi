<template lang="pug">
  v-container(fluid)
    v-slide-y-transition(mode="out-in")
      v-layout(column, align-center)
        img(src="@/assets/logo.png", alt="Vuetify.js", class="mb-5")
        blockquote &#8220;First, solve the problem. Then, write the code.&#8221;
          footer
            small
              em &mdash;John Johnson
        div(v-for="(application, idx) in applications" :key="idx") {{application.name}}
</template>
<script>
  import { db } from '../main'
  export default {
    name: 'Home',
    data () {
      return {
        applications: []
      }
    },
    firestore () {
      return {
        applications: db.collection('applications').orderBy('name')
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
