import Vue from 'vue'
import VueRouter from 'vue-router'

import { Space, Playground } from './pages'

import { __DEBUG__ } from './utils/dev'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Space
  },

  {
    path: '/playground',
    component: Playground
  }
]

export const router = new VueRouter({
  routes
})
