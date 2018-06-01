<template lang="pug">
  v-container
    v-layout(row v-if="error")
      v-flex(xs12 sm6 offset-sm3)
        app-alert(@dismissed="onDismissed" :text="error.message")
    v-layout(row)
      v-flex(xs12 sm6 offset-sm3)
        v-card
          v-card-text
            v-container
              form(@submit.prevent="signIn")
                v-layout(row)
                  v-flex(xs12)
                    i Hint: the public, generic account is&nbsp;
                      nobr ocb-oops@ocb-oops.com&nbsp;
                      | with the usual OCB oops password
                v-layout(row)
                  v-flex(xs12)
                    v-text-field(name="email" label="Mail" id="email" v-model="email" type="email" required)
                v-layout(row)
                  v-flex(xs12)
                    v-text-field(name="password" label="Password" id="password" v-model="password" type="password" required)
                v-layout(row)
                  v-flex(xs12 class="text-xs-center")
                    v-btn(round type="submit" :disabled="loading" :loading="loading") Sign in
                      v-icon(right) lock_open
                      span(slot="loader" class="custom-loader")
                        v-icon(light) cached
                v-layout(row)
                  v-flex(xs12 class="text-xs-center")
                    v-btn(round @click="$router.go(-1)") Cancel
    <!--p You don't have an account? You can create one-->
</template>

<script>
  export default {
    name: 'login',
    data () {
      return {
        email: '',
        password: ''
      }
    },
    computed: {
      user () {
        return this.$store.getters.user
      },
      error () {
        return this.$store.getters.error
      },
      loading () {
        return this.$store.getters.loading
      }
    },
    watch: {
      user (value) {
        if (value !== null && value !== undefined) {
          this.$router.push('/home')
        }
      }
    },
    methods: {
      signIn () {
        this.$store.dispatch('signUserIn', {email: this.email, password: this.password})
        // firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(() => {
        //   this.$router.replace('/missions')
        // }).catch((e) => {
        //   console.error(e)
        //   alert('Error - you might want to use another browser than Chrome')
        // })
      },
      onDismissed () {
        this.$store.dispatch('clearError')
      }
    }
  }
</script>

<style scoped>

</style>
