<template>
  <div class="dashboard-main is-scrollable">

    <section class="section">
      <p class="title is-size-2 is-spaced">
        Connect to Main Server
      </p>

      <p class="subtitle is-size-5">
        Connect this client to the main server.
      </p>
      <hr />
      
      <input class="input is-rounded is-primary" type="text" value="" placeholder="Main Server IP Address"><hr>
      <a class="button is-primary">Connect to Server</a>
    </section>
  </div>
</template>

<script>

  export default {
    name: 'landing-page',
    components: {  },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
</style>
