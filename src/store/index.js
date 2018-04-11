import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import shared from './shared'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    user: user,
    shared: shared
  },
  state: {
    drawer: false
  },
  mutations: {
    toggleDrawer (state) {
      state.drawer = !state.drawer
    },
    hideDrawer (state) {
      state.drawer = false
    },
    showDrawer (state) {
      state.drawer = true
    }
  }

})
