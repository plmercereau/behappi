import _ from 'lodash'
import {store} from '../store'
import defaultSchema from './default'
import * as firebase from 'firebase'
import {DEFAULT_LOCATION, DEFAULT_ZOOM} from '../main'

function mergeCustomizer (objValue, srcValue) { // TODO not necessarly the best merge rule
  if (_.isArray(objValue)) {
    // return srcValue.concat(objValue)
    return _.union(srcValue, objValue)
  }
}

const requireSchemas = require.context(
  './documents', // Relative path
  false, // Whether or not to look in subfolders
  /\.json$/ // The regular expression used to match filenames
)

const allSchemas = requireSchemas.keys().reduce((obj, item) => {
  const schema = requireSchemas(item)
  obj[schema.name] = _.mergeWith(schema, defaultSchema, mergeCustomizer)
  return obj
}, {})

let docSchemas = {}
Object.keys(allSchemas)
  .filter(name => { return (allSchemas[name].type === 'document') })
  .map(name => {
    let schema = _.cloneDeep(defaultSchema)
    allSchemas[name].mixins && allSchemas[name].mixins.map(mixinName => {
      _.mergeWith(schema, allSchemas[mixinName], mergeCustomizer)
    })
    _.mergeWith(schema, allSchemas[name], mergeCustomizer)
    // merge viewItem and collectionItem from their respective default values
    const tabs = ['itemView', 'collectionView']
    tabs.map(attr => {
      schema[attr] && Object.keys(schema[attr])
        .filter(key => { return schema[attr][key] !== 'default' })
        .map(key => {
          _.mergeWith(schema[attr][key], schema[attr].default)
        })
    })
    Object.keys(schema.itemView).map(name => { // remove all unknown sections wrongly declared in sectionsOrder
      schema.itemView[name].sectionsOrder = schema.itemView[name].sectionsOrder.filter(sectionName => { return schema.itemView[name].sections[sectionName] })
    })
    docSchemas[name] = schema
  })

const createSchema = function (schemaName) {
  let schema = docSchemas[schemaName]
  if (!schema) return
  let properties = schema.properties
  Object.keys(properties).map(propName => {
    let property = properties[propName]
    _.isString(property.schemaName) && Object.defineProperty(schema.properties[propName], 'schema', {
      configurable: true,
      get: function () {
        return createSchema(property.schemaName)
      }
    })
  })
  // TODO do the same with collectionView?
  // schema.itemViews = Object.keys(schema.itemViews).reduce((obj, viewName) => {
  //   let view = schema.itemViews[viewName]
  //   let sections = !view.sectionsOrder ? view : view.sectionsOrder.reduce((obj, sectionName) => {
  //     let section = view.sections[sectionName]
  //     section.read = _.isArray(section.read) && section.read.map(propertyName => {
  //       let property = schema.properties[propertyName]
  //       if (property.schemaName) {
  //         Object.defineProperty(property, 'schema', {
  //           configurable: true,
  //           get: function () {
  //             return createSchema(property.schemaName)
  //           }
  //         })
  //       }
  //       return property
  //     })
  //     section.edit = _.isArray(section.edit) && section.edit.map(propertyName => {
  //       let property = schema.properties[propertyName]
  //       if (property.schemaName) {
  //         Object.defineProperty(property, 'schema', {
  //           configurable: true,
  //           get: function () {
  //             return createSchema(property.schemaName)
  //           }
  //         })
  //       }
  //       return property
  //     })
  //     obj[sectionName] = section
  //     return obj
  //   }, {})
  //   obj[viewName] = sections
  //   return obj
  // }, {})
  return schema
}

Object.keys(docSchemas).map(schemaName => {
  docSchemas[schemaName] = createSchema(schemaName)
})

function getSystemData (data) {
  let initialData = {
    userId: store.getters.user.id
  }
  return _.mergeWith(initialData, data, mergeCustomizer)
}

function getInitialDefaultData (schema, data, view = 'default') {
  let res = getSystemData(data)
  if (res._parentData) {
    const parentProperty = schema.collectionView[view].create.parentProperty
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
      } else if (schema.collectionView[view].create.default[propName]) {
        res[propName] = schema.collectionView[view].create.default[propName]
      }
    })
  return res
}

export function getSchema (schemaName) {
  return docSchemas[schemaName] || {}
}

export function updateDocument (docRef, data) {
  return docRef.set(getSystemData(data), { merge: true })
}

export function addDocument (schema, data) {
  return firebase.firestore().collection(schema.collection).add(getInitialDefaultData(schema, data))
}
