import Vue from 'vue'
import {
  App,
  ComponentPlugin,
  router, i18n, store
} from './app'

Vue.config.devtools = false
Vue.config.productionTip = false

Vue.use(ComponentPlugin)

export const app = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
