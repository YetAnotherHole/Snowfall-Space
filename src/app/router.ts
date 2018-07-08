import Vue from 'vue'
import VueRouter from 'vue-router'
import { __ } from './services/i18n'

import { Space, Playground } from './pages'

import { __DEBUG__ } from './utils/dev'

Vue.use(VueRouter)

export const PATHS = {
  APP: '/',
  PLAYGROUND: '/playground'
}

const routes = [
  {
    path: PATHS.APP,
    component: Space,
    meta: { title: __('app.name') }
  },

  {
    path: `${PATHS.PLAYGROUND}/:performName?`,
    component: Playground,
    meta: { title: `${__('playground.name')} · ${__('app.name')}` }
  }
]

export const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // Common
  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})
