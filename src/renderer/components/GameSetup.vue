<template>
  <div class="dashboard-main is-scrollable">

    <section class="section">
      <p class="title is-size-2 is-spaced">
        Setup Game Server
      </p>

      <p class="subtitle is-size-5">
        Download and run CSGO Game Server
      </p>
      <div v-if="processStarted">
        <hr>
        {{ statusInfo }}
        <progress class="progress is-info is-fullwidth" :value="downloadPercentage" max="100">{{ downloadPercentage }}%</progress>
        <hr v-if="stdout">
        <div v-if="stdout" class="control is-loading">
          <textarea ref="console" class="textarea" :value="stdout" placeholder="Loading..." readonly></textarea>
        </div>
      </div>
      <hr>
      <button v-if="!processStarted" v-on:click="downloadserver" class="button is-success is-fullwidth">Download Game Server</button>
    </section>
  </div>
</template>

<script>
  import localip from 'my-local-ip'
  import { toast } from "bulma-toast"
  import mkdirp from 'mkdirp'
  import { spawn } from 'child_process'
  import { downloadFile, extract } from '../utils'

  export default {
    name: 'landing-page',
    components: {  },
    data () {
      return {
        downloadPercentage: 0,
        processStarted: false,
        statusInfo: '',
        stdout: ''
      }
    },
    mounted: function () {
    },
    computed: {
      ownIp () {
        return `${localip()}:5005`
      }
    },
    methods: {
      notify (message, type) {
        toast({
          message: message,
          type: type,
          dismissible: true,
          animate: { in: "fadeIn", out: "fadeOut" }
        })
      },
      async downloadserver () {
        this.processStarted = true
        this.$store.state.GameServer.processStarted = this.processStarted
        // Make directory if not existing
        mkdirp('./gameserver/', function(err) { 
          console.log(`mkdirp: ${err}`)
        })
        let self = this
        // Download SteamCMD
        this.statusInfo =  'Downloading SteamCMD...'

        await downloadFile({
          remoteFile: "http://media.steampowered.com/installer/steamcmd.zip",
          localFile: "./gameserver/steamcmd.zip",
          onProgress: function (received,total){
              self.downloadPercentage = (received * 100) / total
              console.log(self.downloadPercentage + "% | " + received + " bytes out of " + total + " bytes.")
          }
        })
        // this.notify("Successfully downloaded SteamCMD!", "is-success")
        // self.$electron.remote.app.emit('steamcmd-dl')

        // Extract and delete zip file after download
        await extract('./gameserver/steamcmd.zip', './gameserver')

        const exec = require('child_process').exec
        //const testscript = exec('cd gameserver && steamcmd.exe +login anonymous +force_install_dir ./cs_go/ +app_update 740 validate +quit')
        const testscript = exec('cd gameserver && curl -0 https://speed.hetzner.de/1GB.bin')
        this.statusInfo = 'Executing SteamCMD...'

        testscript.stdout.on('data', function(data){
          self.stdout = `${self.stdout}${data}`
          self.$refs.console.scrollTop = self.$refs.console.scrollHeight
          console.log(data)
          // sendBackInfo();
        })

        testscript.stderr.on('data', function(data){
          self.stdout = `${self.stdout}${data}`
          self.$refs.console.scrollTop = self.$refs.console.scrollHeight
          // triggerErrorStuff(); 
          console.log(data)
        })

        testscript.on('close', function (code){
          console.log(`child process exited with code ${code}`)
          self.processStarted = false
          self.$store.state.GameServer.processStarted = self.processStarted
          self.stdout = ''
          //TODO: Download modified Get5
          await downloadFile({
            remoteFile: "https://mms.alliedmods.net/mmsdrop/1.10/mmsource-1.10.7-git968-windows.zip",
            localFile: "./gameserver/cs_go/csgo/mm.zip",
            onProgress: function (received,total){
                self.downloadPercentage = (received * 100) / total
                console.log(self.downloadPercentage + "% | " + received + " bytes out of " + total + " bytes.")
            }
          })
        })
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
iframe {
  width:100%;
  height:100px;
}
</style>
