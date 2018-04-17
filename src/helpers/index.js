import _ from 'lodash'
import {store} from '../store'

export function getFinalData (data) {
  let initialData = {
    user: store.getters.user.id
  }
  return _.merge(initialData, data)
}
