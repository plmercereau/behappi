/***
 * Plugin that makes connection status available everywhere through isOnline value
 * */
const EVENTS = ['online', 'offline', 'load']
const VueConnection = {
  install (Vue, options) {
    Vue.mixin({
      data () {
        return {
          isOnline: navigator.onLine || false
        }
      },
      methods: {
        updateOnlineStatus () {
          this.isOnline = navigator.onLine || false
          this.$emit('detected-condition', this.isOnline)
        },
        toggleDrawer () {
          this.$store.commit('toggleDrawer')
        }
      },
      mounted () {
        EVENTS.forEach(event => window.addEventListener(event, this.updateOnlineStatus))
      },
      beforeDestroy () {
        EVENTS.forEach(event => window.removeEventListener(event, this.updateOnlineStatus))
      }

    })
  }
}

export default VueConnection
