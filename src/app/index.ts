// @FIXIME: Uses `export from` syntax
require('./utils/polyfill')
import App from './app.vue'

export { App }

export { ComponentPlugin } from './components'
export { router } from './router'
export { i18n } from './services/i18n'
export { store } from './services/store'
