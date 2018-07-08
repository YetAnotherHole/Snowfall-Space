import { VueConstructor, PluginObject } from 'vue'

// TODO: The UI components are written in JavaScript,
// need to publish an independent package
import Icon from './uis/icon.vue'
import Button from './uis/button.vue'
import Dropdown from './uis/dropdown.vue'

let installed = false

declare module 'vue/types/vue' {
  interface VueConstructor {
    options: any
    props: any
  }
}

const install = <T>(Vue: VueConstructor): any => {
  if (installed) {
    return
  }
  installed = true

  Vue.component(Icon.name, Icon)
  Vue.component(Button.name, Button)
  Vue.component(Dropdown.name, Dropdown)
}

export const ComponentPlugin: PluginObject<any> = {

  install

}
