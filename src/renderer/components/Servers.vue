<template>
  <div class="dashboard-main is-scrollable">

    <section class="section">
      <p class="title is-size-2 is-spaced">
        Servers
      </p>

      <p class="subtitle is-size-5">
        List of CSGO servers registered to the main server
      </p>

      <hr />

      <table class="table is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>Display Name</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>174</td>
            <td>Kalayaan</td>
            <td>45.124.66.142:27015</td>
            <td>Free</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      
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
