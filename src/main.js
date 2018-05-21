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
import {store} from './store'
import * as VueGoogleMaps from 'vue2-google-maps'
import Vue2Filters from 'vue2-filters'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import VueMoment from 'vue-moment'
import {GOOGLE_API_KEY, VUETIFY_THEME} from './config'

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

Vue.use(Vue2Filters)

Vue.use(VueMoment)

Vue.use(VeeValidate)

Vue.use(Vuetify, {theme: VUETIFY_THEME})

Vue.config.productionTip = false

Vue.use(VueFire)

Vue.use(VueGoogleMaps, {
  load: {
    key: GOOGLE_API_KEY,
    libraries: 'places' // This is required if you use the Autocomplete plugin
    // OR: libraries: 'places,drawing'
    // OR: libraries: 'places,drawing,visualization'
    // (as you require)
  }
})

let app
let config = {
  apiKey: 'AIzaSyCfj8achA-ffNGdvIvAwz7xIzVq-Q20nXo',
  authDomain: 'behappi-ocb.firebaseapp.com',
  databaseURL: 'https://behappi-ocb.firebaseio.com',
  projectId: 'behappi-ocb',
  storageBucket: 'behappi-ocb.appspot.com',
  messagingSenderId: '248401610335'
}

Vue.filter('labelEnum', function (value, enumeration) {
  if (value && enumeration) {
    let index = enumeration.findIndex((el) => {
      return (el.value === value)
    })
    return enumeration[index].text
  } else {
    return value || ''
  }
})

function initApp (withError = false) {
  let error = withError ? {data: {error: withError}} : {}
  app = new Vue({
    el: '#app',
    router,
    store,
    ...error,
    template: '<App/>',
    components: {App}
  })
}

firebase.initializeApp(config)
firebase.firestore().enablePersistence()
  .then(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (!app) {
        if (user) {
          store.dispatch('autoSignIn', user)
        }
        initApp()
      }
    })
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a a time.
      initApp('BeHappI only works on one single tab')
    } else if (err.code === 'unimplemented') {
      initApp('Offline mode is not supported by this browser')
    }
  })
