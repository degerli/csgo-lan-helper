<template>
  <div class="dashboard-main is-scrollable">

    <section class="section">
      <p class="title is-size-2 is-spaced">
        Teams
      </p>

      <p class="subtitle is-size-5">
        List of teams registered to the main server
      </p>

      <hr />

      <table class="table is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Team Tag</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Buzz Esports</td>
            <td>Buzz</td>
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
