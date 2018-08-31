<template lang="pug">
.page-space
  .perform-layer
    .perform-container(
      ref="performContainer"
    )
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import {
  coreSpaceConductor
} from '../performs'

@Component
export default class extends Vue {

  mounted () {
    coreSpaceConductor.mount(this.$peformContainer as HTMLElement)
    this.handleOnboard()
  }

  handleOnboard () {
    this.$store.commit('updateContext', {
      isFirstVisit: false
    })
  }

  get $peformContainer () {
    return this.$refs.performContainer
  }

}
</script>
