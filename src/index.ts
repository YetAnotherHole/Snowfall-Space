import Vue from 'vue'
import { App, router, i18n, store } from './app'

export const app = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
