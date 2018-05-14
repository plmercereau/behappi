<template lang="pug">
  item-collection(:schema="schema")
</template>

<script>
  import {getSchema} from '../schemas'
  import XLSX from 'xlsx'

  export default {
    name: 'Applications',
    data () {
      return {
        schema: getSchema('application')
      }
    },
    methods: {
      excelExport () {
        const dataTable = this.applications.map((line) => {
          return {
            name: line.name,
            nb_applications: line.applicationUsages ? Object.keys(line.applicationUsages).length : 0
          }
        })
        const ws = XLSX.utils.json_to_sheet(dataTable, {header: ['name', 'nb_usages']})
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Applications')
        // TODO add another sheet with the usages and a formula for nb_applications in the first sheet
        XLSX.writeFile(wb, 'applications.xlsx')
      }
    }
  }
</script>

<style scoped>

</style>
