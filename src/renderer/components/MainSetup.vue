<template>
  <div class="dashboard-main is-scrollable">

    <section class="section">
      <p class="title is-size-2 is-spaced">
        Setup Main Server
      </p>

      <p class="subtitle is-size-5">
        Run server and assign this as main server using the IP that will be given.
      </p>

      <div v-if="backendStatus" class="columns">
        <hr />
        <div class="column is-three-quarters">
          <input class="input is-rounded is-primary" disabled type="text" :value="ownIp" placeholder="IP Address">
        </div>
        <div class="column">
          <a class="button is-primary" v-clipboard="ownIp" @success="handleSuccess" @error="handleError">Copy</a>
        </div>
      </div>
      <hr>
      <button v-if="!backendStatus" v-on:click="runserver" class="button is-success">Run Main Server</button>
      <button v-if="backendStatus" v-on:click="closeserver" class="button is-danger">Stop Main Server</button>
    </section>
  </div>
</template>

<script>
  import localip from 'my-local-ip'
  import { toast } from "bulma-toast"

  export default {
    name: 'landing-page',
    components: {  },
    data () {
      return {
        backendStatus: false
      }
    },
    mounted: function () {
      this.$store.dispatch("setServerState", true)
      console.log(this.$store.state.MainServer.mainServerState)
      this.backendStatus = this.$store.getters.getMainServerState
    },
    computed: {
      ownIp () {
        return `${localip()}:5005`
      }
    },
    methods: {
      runserver (port) {
        this.backendStatus = true
        this.$electron.remote.app.emit('backend-on')
        this.$store.state.MainServer.mainServerState = true
        console.log(this.$store.getters.getMainServerState)
      },
      closeserver () {
        this.backendStatus = false
        this.$electron.remote.app.emit('backend-off')
        this.$store.state.MainServer.mainServerState = false
      },
      handleSuccess (e) {
        console.log(e)
        toast({
          message: "Copied IP address to clipboard!",
          type: "is-success",
          dismissible: true,
          animate: { in: "fadeIn", out: "fadeOut" }
        })
      },
      handleError () {
        console.log(e)
      }
    }
  }
</script>

<style>
</style>
