<template lang="pug">
  page
    v-btn(@click="excelExport") Export Projects list
    v-card
      v-card-title(primary-title)
        div
          h2 Projects
      v-data-table(:headers="headers", :items="projects", hide-actions, class="elevation-1")
        template(slot="items", slot-scope="props")
          td
            router-link(:to="'/projects/' + props.item.id") {{ props.item.name }}
          td
            router-link(:to="'/missions/' + (props.item.mission && props.item.mission.id)") {{ props.item.mission.name }}
</template>

<script>
  import * as firebase from 'firebase'
  import XLSX from 'xlsx'

  export default {
    name: 'Projects',
    data () {
      return {
        projects: [],
        headers: [
          {
            text: 'Project Name',
            align: 'left',
            sortable: true,
            value: 'name'
          },
          {
            text: 'Mission',
            sortable: true,
            value: 'mission.name'
          }
        ]
      }
    },
    methods: {
      excelExport () {
        const dataTable = this.projects.map((data) => {
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
    firestore () {
      return {
        projects: firebase.firestore().collection('orgUnits').where('categories.project', '==', true).orderBy('name')
      }
    }
  }
</script>

<style scoped>

</style>
