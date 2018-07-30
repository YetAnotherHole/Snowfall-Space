import { FastClick } from 'fastclick'

import viewportUnitsBuggyfill from 'viewport-units-buggyfill'
import viewportUnitsBuggyfillHacks from 'viewport-units-buggyfill/viewport-units-buggyfill.hacks'

if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function () {
    FastClick.attach(document.body)
  }, false)
}

// Initialize Viewport Unit
viewportUnitsBuggyfill.init({
  hacks: viewportUnitsBuggyfillHacks
})
