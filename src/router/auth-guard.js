import {store} from '../store'

export default (to, from, next) => {
  if (!store) { // TODO if no persistence
    next('/login') // TODO if no persistence
  } else if (store.getters.user) {
    next()
  } else {
    next('/login')
  }
}
