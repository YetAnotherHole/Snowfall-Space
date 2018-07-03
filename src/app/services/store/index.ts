import Vue from 'vue'
import createPersistedState from 'vuex-persistedstate'
import Vuex, { MutationTree } from 'vuex'
import { RootState } from './schema'

Vue.use(Vuex)

const state: RootState = {
  context: {
    isFirstVisit: true
  }
}

const mutations: MutationTree<RootState> = {
  updateContext (state, payload) {
    state.context = {
      ...state.context,
      ...payload
    }
  }
}

const actions = {}
const getters = {}
const plugins = [
  createPersistedState()
]

export const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
  plugins
})
