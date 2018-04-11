// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueFire from 'vuefire'
import firebase from 'firebase'
import 'firebase/firestore'
import VeeValidate from 'vee-validate'
import { store } from './store'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

// https://github.com/chrisvfritz/vue-enterprise-boilerplate/blob/master/src/components/_globals.js
const requireComponent = require.context(
  './components', // The relative path of the components folder
  false, // Whether or not to look in subfolders
  /[A-Z]\w+\.(vue|js)$/ // The regular expression used to match base component filenames
)

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)
  const componentName = upperFirst(camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, '$1')))
  Vue.component(componentName, componentConfig.default || componentConfig)
})

Vue.use(VeeValidate)

Vue.use(Vuetify)

Vue.config.productionTip = false

Vue.use(VueFire)

let app
let config = {
  apiKey: 'AIzaSyCfj8achA-ffNGdvIvAwz7xIzVq-Q20nXo',
  authDomain: 'behappi-ocb.firebaseapp.com',
  databaseURL: 'https://behappi-ocb.firebaseio.com',
  projectId: 'behappi-ocb',
  storageBucket: 'behappi-ocb.appspot.com',
  messagingSenderId: '248401610335'
}

firebase.initializeApp(config)
firebase.auth().onAuthStateChanged((user) => {
  if (!app) {
    if (user) {
      store.dispatch('autoSignIn', user)
    }
    app = new Vue({
      el: '#app',
      router,
      store,
      template: '<App/>',
      components: {App}
    })
  }
})

// firebase.firestore().enablePersistence()
//   .then(() => {
//     // Initialize Cloud Firestore through firebase
//     // const rightDB = firebase.firestore()
//     // console.log(rightDB)
//   })
//   .catch((err) => {
//     if (err.code === 'failed-precondition') {
//       // Multiple tabs open, persistence can only be enabled
//       // in one tab at a a time.
//       console.log('failed-precondition')
//     } else if (err.code === 'unimplemented') {
//       // The current browser does not support all of the
//       // features required to enable persistence
//       console.log('unimplemented')
//     }
//   })
// export const db = firebase.firestore()
