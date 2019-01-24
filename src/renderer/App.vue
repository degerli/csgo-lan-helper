<template>
  <div>
    <header id="titlebar">
      <div id="drag-region">
        <div id="window-controls">
          <div v-on:click="minimizeWindow" class="buttonz" id="min-button">
            <span>&#xE921;</span>
          </div>
          <div v-on:click="maximizeWindow" class="buttonz" id="max-button">
            <span>&#xE922;</span>
          </div>
          <div v-on:click="maximizeWindow" class="buttonz" id="restore-button">
            <span>&#xE923;</span>
          </div>
          <div v-on:click="closeWindow" class="buttonz" id="close-button">
            <span>&#xE8BB;</span>
          </div>
        </div>
      </div>
    </header>
    <div class="dashboard">
      <!-- left panel -->
      <div class="dashboard-panel is-medium has-thick-padding is-scrollable">
        <div class="has-text-centered">
          <img src="~@/assets/logo.png" width="90%">
        </div>

        <br />

        <aside class="menu has-text-white">
          <p class="menu-label">
            Dashboard
          </p>
          <ul class="menu-list">
            <li><router-link to="/matches">Matches</router-link></li>
            <li><router-link to="/teams">Teams</router-link></li>
            <li><router-link to="/servers">Servers</router-link></li>
          </ul>
          <p class="menu-label">
            This PC
          </p>
          <ul class="menu-list">
            <li v-if="!$store.state.MainServer.mainServerState"><router-link to="/main/connect">Connect to Main Server</router-link></li>
            <li v-if="!$store.state.MainServer.connectedServer"><router-link to="/main/setup">Setup Main Server</router-link></li>
            <li><router-link to="/game/setup">Setup Game Server</router-link></li>
            <li><router-link to="/game/run">Run Game Server</router-link></li>
          </ul>
          <p class="menu-label">
            Tournament
          </p>
          <ul class="menu-list">
            <li><router-link to="/challonge">Import Challonge</router-link></li>
          </ul>
          <p class="menu-label">
            Support
          </p>
          <ul class="menu-list">
            <li><router-link to="help">How to use?</router-link></li>
          </ul>
        </aside>
      </div>
    
      <!-- main section -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'csgo-lan',
    data() {
      return {
        logoURL: '',
      }
    },
    methods: {
      closeWindow: function() {
        this.$electron.remote.getCurrentWindow().close()
      },
      minimizeWindow: function() {
        this.$electron.remote.getCurrentWindow().minimize()
      },
      maximizeWindow: function() {
        this.$electron.remote.getCurrentWindow().isMaximized() ? this.$electron.remote.getCurrentWindow().unmaximize() : this.$electron.remote.getCurrentWindow().maximize()
      }
    }
  }
</script>

<style>
  body {
    overflow-y: hidden;
  }
  
  #titlebar {
    display: block;
    position: fixed;
    height: 32px;
    width: calc(100% - 2px); /*Compensate for body 1px border*/
    background: #fff;
  }
  
  #app {
    height: calc(100% - 32px);
    margin-top: 32px;
    padding: 20px;
    overflow-y: auto;
  }

  #titlebar {
    padding: 4px;
  }
  #titlebar #drag-region {
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
  }

  #titlebar {
    color: #000;
  }
  #window-controls {
    display: grid;
    grid-template-columns: repeat(3, 46px);
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    font-family: "Segoe MDL2 Assets";
    font-size: 10px;
  }
  #window-controls .buttonz {
    grid-row: 1 / span 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  #window-controls #min-button {
    grid-column: 1;
  }
  #window-controls #max-button, #window-controls #restore-button {
    grid-column: 2;
  }
  #window-controls #close-button {
    grid-column: 3;
  }

  #window-controls {
    -webkit-app-region: no-drag;
  }
  #window-controls .buttonz {
    user-select: none;
    cursor: default;
    opacity: 1;
  }
  #window-controls .buttonz:hover {
    background: rgb(94, 92, 92);
  }
  #window-controls #close-button:hover {
    background: #E81123;
  }
  #window-controls #restore-button {
    display: none;
  }
</style>
