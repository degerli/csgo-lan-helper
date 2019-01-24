<template>
  <div class="dashboard-main is-scrollable">

    <section class="section">
      <p class="title is-size-2 is-spaced">
        Matches
      </p>

      <p class="subtitle is-size-5">
        List of matches connected to the main server
      </p>

      <hr />

      <table class="table is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>Team 1</th>
            <th>Team 2</th>
            <th>Status</th>
            <th>Server</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>418</td>
            <td>SK Gaming</td>
            <td>Faze Clan</td>
            <td>Cancelled</td>
            <td>Kalayaan (45.124.66.142:27015)</td>
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
