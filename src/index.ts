import Vue from 'vue'

import {
  App,
  ComponentPlugin,
  router, i18n, store
} from './app'

// Overide Vue global config
Vue.config.devtools = false
Vue.config.productionTip = false

// Install plugins
Vue.use(ComponentPlugin)

// Init app
export const app = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
