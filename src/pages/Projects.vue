<template lang="pug">
  page
    tool-bar(:title="view.title", search, v-model="search")
    card-list
      v-card-actions(slot="actions")
        create-button(fab, :schema="schema")
        v-btn(@click="excelExport") Export Projects list
      v-flex(d-flex xs12 sm6 md4, v-for="doc in filteredList" :key="doc.id")
        card-item(:doc="doc", :schema="schema", component="card")
          div {{doc.mission && doc.mission.name}} <!-- TODO set as a configuration element -->
</template>

<script>
  import * as firebase from 'firebase'
  import XLSX from 'xlsx'
  import {getSchema} from '../schemas'
  import {listMixin} from '../mixins'

  export default {
    name: 'Projects',
    mixins: [listMixin],
    data () {
      return {
        schema: getSchema('project')
      }
    },
    methods: {
      excelExport () {
        const dataTable = this.collection.map((data) => {
          return {
            name: data.name,
            mission: data.mission.name
          }
        })
        const ws = XLSX.utils.json_to_sheet(dataTable, {header: ['name', 'mission']})
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Projects')
        XLSX.writeFile(wb, 'projects.xlsx')
      }
    },
    computed: {
      filteredList () { // TODO put in a mixin
        if (this.collection) {
          return this.collection.filter(item => {
            return (
              (item.name.toLowerCase().includes(this.search.toLowerCase())) ||
              (item.mission && item.mission.name.toLowerCase().includes(this.search.toLowerCase())))
          })
        } else return []
      }
    },
    firestore () {
      return {
        collection: firebase.firestore().collection('orgUnits').where('category', '==', 'project').orderBy('name')
      }
    }
  }
</script>

<style scoped>

</style>
