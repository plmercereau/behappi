import _ from 'lodash'
import {store} from '../store'
import defaultSchema from './default'
import * as firebase from 'firebase'
import {DEFAULT_LOCATION, DEFAULT_ZOOM} from '../main'

const requireSchemas = require.context(
  './documents', // Relative path
  false, // Whether or not to look in subfolders
  /\.json$/ // The regular expression used to match filenames
)
const schemas = requireSchemas.keys().reduce((obj, item) => {
  const schema = requireSchemas(item)
  obj[schema.name] = _.merge(schema, defaultSchema)
  return obj
}, {})

function getSystemData (data) {
  let initialData = {
    userId: store.getters.user.id
  }
  return _.merge(initialData, data)
}

function getInitialDefaultData (schema, data, view = 'default') {
  let res = getSystemData(data)
  if (res._parentData) {
    const parentProperty = schema.listViews[view].create.parentProperty
    const parentSchema = getSchema(parentProperty)
    let parentRef = firebase.firestore().collection(parentSchema.collection).doc(data._parentData.id)
    res[parentProperty] = parentRef
    delete res._parentData.id
    Object.keys(res._parentData).map(attrName => {
      res[attrName] = data._parentData[attrName]
    })
    delete res._parentData
  }
  Object.keys(schema.properties)
    .filter(propName => { return (!res[propName]) })
    .map(propName => {
      if (schema.properties[propName].type === 'area' || schema.properties[propName].type === 'point') {
        // if (schema.listViews[view].create.default[propName]) {
        //   res[propName] = schema.properties[propName].default.coordinates
        //   res[schema.properties[propName].zoomProperty] = schema.properties[propName].default.zoom
        // } else {
        res[propName] = DEFAULT_LOCATION
        res[schema.properties[propName].zoomProperty] = DEFAULT_ZOOM
        // }
      } else if (schema.listViews[view].create.default[propName]) {
        res[propName] = schema.listViews[view].create.default[propName]
      }
    })
  return res
}

export function getSchema (schemaName) {
  if (schemaName && schemas[schemaName]) {
    let schema = _.merge({}, defaultSchema, schemas[schemaName])
    Object.keys(schema.properties).map(propName => {
      let prop = schema.properties[propName]
      if (prop && (prop.type === 'ref' || prop.type === 'refCollection')) {
        prop.schema = schemas[prop.schemaName]
      }
    })
    return schema
  } else return {}
}

export function updateDocument (docRef, data) {
  return docRef.set(getSystemData(data), { merge: true })
}

export function addDocument (schema, data) {
  return firebase.firestore().collection(schema.collection).add(getInitialDefaultData(schema, data))
}
