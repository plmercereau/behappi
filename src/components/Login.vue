<template lang="pug">
  v-container(fluid)
    h3 Sign In
    input(type="text", v-model="email", placeholder="Email")
    input(type="password", v-model="password", placeholder="Password")
    button(v-on:click="signIn") Connection
    p You don't have an account? You can create one
</template>

<script>
  import firebase from 'firebase'
  export default {
    name: 'login',
    data () {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      signIn () {
        firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
          this.$router.replace('/home')
        }).catch(() => {
          alert('erreur')
        })
      }
    }
  }
</script>

<style scoped>

</style>
