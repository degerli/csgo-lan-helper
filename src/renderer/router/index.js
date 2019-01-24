import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'is-active',
  routes: [
    {
      path: '/matches',
      name: 'matches',
      component: require('@/components/Matches').default,
      meta:{conditionalRoute:true, ongoingProcess:true}
    },
    {
      path: '/teams',
      name: 'teams',
      component: require('@/components/Teams').default,
      meta:{conditionalRoute:true, ongoingProcess:true}
    },
    {
      path: '/servers',
      name: 'servers',
      component: require('@/components/Servers').default,
      meta:{conditionalRoute:true, ongoingProcess:true}
    },
    {
      path: '/main/setup',
      name: 'mainsetup',
      component: require('@/components/MainSetup').default,
      meta:{ongoingProcess:true}
    },
    {
      path: '/main/connect',
      name: 'mainconnect',
      component: require('@/components/MainConnect').default,
      meta:{ongoingProcess:true}
    },
    {
      path: '/game/setup',
      name: 'gamesetup',
      component: require('@/components/GameSetup').default
    },
    {
      path: '*',
      redirect: '/main/connect'
    }
  ]
})
