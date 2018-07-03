<template lang="pug">
#app
  | {{ $t("hello") }}
  router-view
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class extends Vue {
  name: 'app'
}
</script>

<style lang="stylus">
html,
padding
  margin: 0
  padding: 0
</style>
