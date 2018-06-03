import _ from 'lodash'
import {store} from '../store'
import defaultSchema from './default'
import * as firebase from 'firebase'
import {DEFAULT_LOCATION, DEFAULT_ZOOM} from '../config'

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
      _.merge(schema, allSchemas[mixinName])
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

function getInitialDefaultData (schema, data, property) {
  let res = getSystemData(data)
  let schemaCreate = schema.collectionView.default.create
  let propertyCreate = property && property.create
  let create = (schemaCreate && propertyCreate) ? _.mergeWith(schemaCreate, propertyCreate, mergeCustomizer)
    : propertyCreate || schemaCreate
  let propNames = property ? create.properties : Object.keys(schema.properties)
  propNames
    .filter(propName => !res[propName])
    .map(propName => {
      if (schema.properties[propName].type === 'location') {
        res[propName] = DEFAULT_LOCATION
        res[schema.properties[propName].zoom] = DEFAULT_ZOOM
      }
    })
  if (create.default) {
    _.mergeWith(res, create.default, mergeCustomizer)
  }
  if (res._parentData) {
    const parentProperty = create.parentProperty
    const parentSchema = schema.properties[parentProperty].schema
    let parentRef = firebase.firestore().collection(parentSchema.collection).doc(data._parentData.id)
    res[parentProperty] = parentRef
    delete res._parentData.id
    Object.keys(res._parentData).map(attrName => {
      res[attrName] = data._parentData[attrName]
    })
    delete res._parentData
  }
  res._schema = schema.name
  return res
}

export function getSchema (schemaName) {
  return docSchemas[schemaName] || {}
}

export function getSchemas () {
  return docSchemas
}

export function updateDocument (docRef, data) {
  return docRef.set(getSystemData(data), { merge: true })
}

export function addDocument (schema, data, property) {
  return firebase.firestore().collection(schema.collection).add(getInitialDefaultData(schema, data, property))
}

function testCondition (source, operator, destination) {
  const op = operator.toLowerCase()
  const operations = {
    '==': (src, dest) => (src === dest),
    '': (src, dest) => (src !== dest),
    '>': (src, dest) => (src > dest),
    '>=': (src, dest) => (src >= dest),
    '<': (src, dest) => (src < dest),
    '<=': (src, dest) => (src <= dest),
    'in': (src, dest) => (_.includes(dest, src))
  }
  return operations[op] ? operations[op](source, destination) : true
}

export function testDocCondition (doc, condition) {
  let [source, operator, destination] = condition
  if (_.isString(source) && source.charAt(0) === ':') source = _.get(doc, source.substr(1))
  if (_.isString(destination) && destination.charAt(0) === ':') destination = _.get(doc, destination.substr(1))
  if (_.isString(destination) && destination === '{userId}') destination = this.$store.getters.user.id
  return testCondition(source, operator, destination)
}

export function testDocConditions (doc, conditions) {
  if (_.isArray(conditions)) {
    return conditions.some(filter => testDocCondition(doc, filter))
  } else return true
}

export function filterCollection (filters, collection) {
  return _.isArray(collection) ? collection.filter(doc => {
    let docData = _.isFunction(doc.data) ? doc.data() : doc
    return testDocConditions(docData, filters)
  }) : []
}

export function sortCollection (sortProperties, collection) {
  let col = (_.isObject(collection)) ? Object.keys(collection).map(key => { return collection[key] }) : collection
  if (_.isArray(sortProperties)) {
    sortProperties.forEach(sortProp => {
      col = col.sort((a, b) => {
        let sA = a[sortProp[0]]
        let sB = b[sortProp[0]]
        if (_.isString(sA) && _.isString(sB)) return sA.localeCompare(sB) * (sortProp[1] === 'ASC' ? 1 : -1)
        else return 0
      })
    })
  }
  return col
}

export function propertyValue (schema, path, doc) { // TODO remove?
  let property = schema.properties[path]
  if (property && property.type === 'computed') {
    return computedPropertyValue(property, doc)
  } else {
    return _.get(doc, path)
  }
}

function computedPropertyValue (property, doc) {
  let value = _.template(property.computed)({doc})
  const types = {
    'boolean': (val) => (val.toLowerCase() === 'true'),
    'number': (val) => Number(val)
  }
  return types[property.type] ? types[property.type](value) : value
}

export function addComputedValues (schema, doc) {
  Object.keys(schema.properties)
    .filter(propName => (schema.properties[propName].computed))
    .forEach(propName => {
      doc[propName] = computedPropertyValue(schema.properties[propName], doc)
    })
  Object.keys(schema.properties)
    .filter(propName => (schema.properties[propName].type === 'collection' && schema.properties[propName].options))
    .forEach(propName => {
      doc[`${propName}Collection`] = schema.properties[propName].options[doc[propName]]
    })
  return doc
}
