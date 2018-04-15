<template lang="pug">
  page
    tool-bar(title="Projects", search, v-model="search")
    card-list
      template(slot="title-content")
        v-btn(@click="excelExport") Export Projects list
      v-flex(d-flex xs12 sm6 md4, v-for="project in filteredList" :key="project .id")
        v-card(:to="'/projects/'+project.id")
          v-card-media(height="200px")
            map-image(v-if="project.location", :location="project.location", :zoom="project.zoom", :markers="[project.location]")
          v-card-title(primary-title)
            div
              div(class="headline") {{project.name}}
              div {{project.mission && project.mission.name}}
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
        ],
        search: ''
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
    computed: {
      filteredList () {
        if (this.projects) {
          return this.projects.filter(item => {
            return item.name.toLowerCase().includes(this.search.toLowerCase())
          })
        } else return []
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
