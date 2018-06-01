import * as firebase from 'firebase'

function setUserData (commit, payload) {
  commit('setUser', {
    id: payload.uid,
    name: payload.displayName,
    email: payload.email,
    role: 'member',
    photoUrl: payload.photoURL
  })
  firebase.firestore().collection('users').doc(payload.uid).get().then(res => {
    if (res.exists) {
      let user = {
        id: payload.uid,
        ...res.data()
      }
      commit('setUser', user)
    }
  })
}

export default {
  state: {
    user: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    signUserUp ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            setUserData(commit, user)
            commit('showDrawer')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserIn ({commit}, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            commit('setLoading', false)
            setUserData(commit, user)
            commit('showDrawer')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInGoogle ({commit}) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(
          user => {
            commit('setLoading', false)
            setUserData(commit, user)
            commit('showDrawer')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInFacebook ({commit}) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(
          user => {
            commit('setLoading', false)
            setUserData(commit, user)
            commit('showDrawer')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInGithub ({commit}) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider())
        .then(
          user => {
            commit('setLoading', false)
            setUserData(commit, user)
            commit('showDrawer')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserInTwitter ({commit}) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider())
        .then(
          user => {
            commit('setLoading', false)
            setUserData(commit, user)
            commit('showDrawer')
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    autoSignIn ({commit}, payload) {
      setUserData(commit, payload)
      commit('showDrawer')
    },
    logout ({commit}) {
      firebase.auth().signOut()
      commit('setUser', null)
      commit('hideDrawer')
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}
