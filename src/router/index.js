import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Missions from '@/pages/Missions'
import Mission from '@/pages/Mission'
import Projects from '@/pages/Projects'
import Project from '@/pages/Project'
import Applications from '@/pages/Applications'
import Application from '@/pages/Application'
import Login from '@/pages/Login'
// import firebase from 'firebase'
import AuthGuard from './auth-guard'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/login'
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
      path: '/missions',
      name: 'Missions',
      component: Missions,
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    },
    {
      path: '/missions/:id',
      name: 'Mission',
      component: Mission,
      props: true,
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects,
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    },
    {
      path: '/projects/:id',
      name: 'Project',
      component: Project,
      props: true,
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    },
    {
      path: '/applications',
      name: 'Applications',
      component: Applications,
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
    },
    {
      path: '/applications/:id',
      name: 'Application',
      component: Application,
      props: true,
      meta: {
        keepAlive: true
      },
      beforeEnter: AuthGuard
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
