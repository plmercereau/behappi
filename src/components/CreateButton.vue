<template lang="pug">
  div
    v-btn(:fab="isFab" :fixed="isFab" :dark="isFab" :bottom="isFab" :right="isFab" :color="isFab ? 'orange': 'primary'" @click.stop="toggleDialog = !toggleDialog")
      v-icon(v-if="isFab") add
      slot
    v-dialog(v-model="toggleDialog" max-width="500px")
      v-card
        v-card-title {{ view.create.title || schema.title || 'Create'}}
        v-card-text
          form(novalidate @submit.prevent="create")
            template(v-for="(name) in view.create.properties")
              v-text-field(
              autofocus
              v-if="schema.properties[name].type==='string' && !schema.properties[name].enum"
              v-model="form[name]",
              :id="'form-' + name",
              :label="schema.properties[name].placeholder",
              v-validate="schema.properties[name].validation",
              :data-vv-name="'form-' + name")
              <!--TODO required, data-vv-name-->
              v-select(
              autofocus
              v-if="schema.properties[name].type==='string' && schema.properties[name].enum"
              v-model="form[name]",
              :items="schema.properties[name].enum"
              :label="schema.properties[name].placeholder",
              single-line)
        v-card-actions
          v-btn(color="primary" flat @click.stop="$validator.validateAll() && create()") Create
          v-btn(color="primary" flat @click.stop="toggleDialog=false") Cancel

</template>

<script>
  import {addDocument} from '../schemas'
  import {listMixin, schemaMixin} from '../mixins'
  export default {
    props: ['schema', 'parentData', 'fab'],
    name: 'CreateButton',
    mixins: [listMixin, schemaMixin],
    data () {
      return {
        form: {},
        toggleDialog: false
      }
    },
    methods: {
      create () { // TODO submit action, rather than $validator.validateAll() && create()
        if (this.view.create.inheritedProperties && this.parentData) {
          const parentProperties = this.view.create.inheritedProperties
          const filteredParentData = parentProperties.reduce((obj, name) => {
            obj[name] = this.parentData[name]
            return obj
          }, {})
          this.form['_parentData'] = {
            id: this.parentData.id,
            ...filteredParentData
          }
        }
        addDocument(this.schema, this.form).then((docRef) => {
          this.$router.push(this.view.uri.replace('{id}', docRef.id))
        }).catch(error => {
          console.log(error)
        })
        this.toggleDialog = false
      },
      cancel () {
        this.toggleDialog = false
      }
    },
    watch: {
      toggleDialog (newValue) {
        if (!newValue) {
          this.form = {}
        }
      }
    },
    computed: {
      isFab () {
        return Boolean(this.fab)
      }
    }
  }
</script>

<style scoped>

</style>
