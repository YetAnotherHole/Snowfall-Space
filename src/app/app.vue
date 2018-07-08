<template lang="pug">
#app
  div.text( v-show="false" ) {{ $t("hello") }}
  router-view
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

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
  height: 100vh
  width: 100vw
  line-height: 1.5
  font-size: 16px
  font-family: $globalFont
  background-color: $globalBackground
  color: $textColor
</style>
