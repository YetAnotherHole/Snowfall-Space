import Vue from 'vue'
import VueI18n from 'vue-i18n'

import { zh } from './zh'
import { en } from './en'

Vue.use(VueI18n)

const messages = {
  zh,
  en
}

export const i18n = new VueI18n({
  locale: 'zh',
  messages
})

export const __ = i18n.t.bind(i18n)
