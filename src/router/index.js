import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Missions from '@/components/Missions'
import Mission from '@/components/Mission'
import Projects from '@/components/Projects'
import Login from '@/components/Login'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/missions',
      name: 'Missions',
      component: Missions,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/missions/:id',
      name: 'Mission',
      component: Mission,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  let currentUser = firebase.auth().currentUser
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !currentUser) next('login')
  else if (!requiresAuth && currentUser) next('home') // TODO why?
  else next()
})

export default router
