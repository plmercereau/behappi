<template lang="pug">
  v-container(fluid)
    v-layout(row, align-center)
      v-flex(xs12)
        v-btn(@click="excelExport") Export applications and their usage
        v-card
          v-card-title(primary-title)
            div
              h2 Applications
          v-data-table(:headers="headers", :items="applications", hide-actions, class="elevation-1")
            template(slot="items", slot-scope="props")
              td
                router-link(:to="'/applications/' + props.item.id") {{ props.item.name }}
              td {{ props.item.applicationUsages ? props.item.applicationUsages.length : 0 }}
</template>

<script>
  import { db } from '../main'
  import XLSX from 'xlsx'

  export default {
    name: 'Applications',
    data () {
      return {
        applications: [],
        headers: [
          {
            text: 'Application Name',
            align: 'left',
            sortable: true,
            value: 'name'
          },
          {
            text: 'Number of usages',
            align: 'left',
            sortable: true,
            value: 'applicationUsages.length'
          }
        ]
      }
    },
    methods: {
      excelExport () {
        const dataTable = this.applications.map((data) => {
          return {
            name: data.name,
            nb_applications: 'todo'
          }
        })
        const ws = XLSX.utils.json_to_sheet(dataTable, {header: ['name', 'nb_applications']})
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Applications')
        // TODO add another sheet with the usages and a formula for nb_applications in the first sheet
        XLSX.writeFile(wb, 'applications.xlsx')
      }
    },
    firestore () {
      return {
        applications: db.collection('applications').orderBy('name')
      }
    },
    mounted () {

    }
  }
</script>

<style scoped>

</style>
