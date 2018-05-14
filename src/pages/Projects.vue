<template lang="pug">
  item-collection(:schema="schema")
  <!--v-btn(@click="excelExport") Export Projects list-->
</template>

<script>
  import XLSX from 'xlsx'
  import {getSchema} from '../schemas'

  export default {
    name: 'Projects',
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
    }
  }
</script>

<style scoped>

</style>
