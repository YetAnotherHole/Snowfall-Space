<template lang="pug">
#app
  div.text( v-show="false" ) {{ $t("hello") }}
  router-view
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

Vue.config.errorHandler = (error) => {
  console.log('Vue Global OnError', error)
}

@Component
export default class extends Vue {

  // @TODO: Handle switch transition of pages & performs

}
</script>

<style lang="stylus">
@require './styles/main'

html,
body
  margin: 0
  padding: 0

body
  line-height: 1.5
  font-size: 16px
  font-family: $globalFont
  background-color: $globalBackground
  color: $textColor
  fullscreen()

#app
  fullscreen()

  > *
    fullscreen()
    overflow: hidden
</style>
