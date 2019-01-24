const state = {
  mainServerState: false,
  connectedServer: false
}

const getters = {
  getMainServerState: state => state.mainServerState
}

const mutations = {
  TOGGLE_MAINSERVERSTATE (state) {
    state.mainServerState = !state.mainServerState
  },
  SET_MAINSERVERSTATE (state, payload) {
    state.mainServerState = payload
  }
}

const actions = {
  setServerState ({ commit }, payload) {
    commit('ON_MAINSERVERSTATE', payload)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
