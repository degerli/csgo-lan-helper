import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import 'bulma/css/bulma.css'
import 'bulma-dashboard/dist/bulma-dashboard.min.css'

import { toast } from 'bulma-toast'

import VueClipboards from 'vue-clipboards'

Vue.use(VueClipboards)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

router.beforeEach((to, from, next) => { 
  if (to.matched.some(record => record.meta.conditionalRoute)) { 
    // this route requires condition to be accessed
    // if not, redirect to home page. 
    if (!store.state.MainServer.mainServerState) { 
      //check codition is false
      next({ path: '/'}) 
      toast({
        message: 'Setup/Connect to Main Server first!',
        type: 'is-danger',
        dismissible: true,
        animate: { in: 'fadeIn', out: 'fadeOut' }
      })
    } else { 
      //check codition is true
      next() 
    } 
  } else { 
    next() // make sure to always call next()! 
  } 
}) 

router.beforeEach((to, from, next) => { 
  if (to.matched.some(record => record.meta.ongoingProcess)) { 
    // this route requires condition to be accessed
    // if not, redirect to home page. 
    if (store.state.GameServer.processStarted) { 
      //check codition is false
      toast({
        message: 'Download process is ongoing!',
        type: 'is-danger',
        dismissible: true,
        animate: { in: 'fadeIn', out: 'fadeOut' }
      })
    } else { 
      //check codition is true
      next() 
    } 
  } else { 
    next() // make sure to always call next()! 
  } 
}) 

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
