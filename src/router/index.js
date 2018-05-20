import Vue from 'vue'
import Router from 'vue-router'
import ItemCollection from '@/components/ItemCollection'
import ItemDetails from '@/components/ItemDetails'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import PageNotFound from '@/pages/PageNotFound'
import AuthGuard from './auth-guard'
import {getSchemas} from '@/schemas'

Vue.use(Router)

function schemaRoutes () {
  let schemas = getSchemas()
  return Object.keys(schemas).reduce((obj, schemaName) => {
    let schema = schemas[schemaName]
    obj.push({
      path: `/${schemaName}`,
      name: schemaName,
      component: ItemCollection,
      props: { schema },
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    })
    obj.push({
      path: `/${schemaName}/:id`,
      name: `/${schemaName}Item`,
      component: ItemDetails,
      props: (route) => ({id: route.params.id, schema}),
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    })
    return obj
  }, [])
}

let router = new Router({
  routes: [
    ...schemaRoutes(),
    {
      path: '*',
      redirect: '/page-not-found'
    },
    {
      path: '/page-not-found',
      name: 'PageNotFound',
      component: PageNotFound
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    }
  ]
})

// router.beforeEach((to, from, next) => {
// let currentUser = firebase.auth().currentUser
// console.log(currentUser)
// let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
// if (requiresAuth && !currentUser) next('login')
// else next()
// console.log(requiresAuth)
// })

export default router
