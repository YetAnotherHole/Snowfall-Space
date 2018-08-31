<template lang="pug">
.page-playground( :class="[ currentPerform.name ]" )

  .control-layer
    ss-dropdown.menu-handler
      span( slot="toggler" )
        ss-button( icon="bars" )
      ul.list
        li( @click="handleReturnAppClick" )
          span {{ $t('app.return') }}
        li.divider
        li(
          v-for="perform in performs"
          :key="perform.name"
          :class="{ 'is-active': performName === perform.name }"
          :data-name="perform.name"
          @click="handleSwitchPerformClick"
        )
          span {{ perform.title }}

    .playground-name
      | {{ currentPerform.title }}

  .perform-layer
    .perform-container(
      ref="performContainer"
    )
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Route } from 'vue-router'

import { __ } from '../services/i18n'
import { PATHS } from '../router'
import {
  BaseConductor,
  ShamisenRainConductor,
  SnowflakeMakerConductor,
  WatercolorWitcherConductor
} from '../performs'

interface PerformItem {
  name: string,
  title: string,
  Conductor: any
}

const DEFAULT_PERFORM_NAME = 'shamisen-rain'

// Register the router hooks with their names
Component.registerHooks([
  'beforeRouteUpdate',
  'beforeRouteLeave'
])

@Component
export default class extends Vue {
  conductor: BaseConductor

  performs: PerformItem[] = [
    {
      name: 'shamisen-rain',
      title: __('perform.shamisenRain.name'),
      Conductor: ShamisenRainConductor
    },

    {
      name: 'watercolor-witcher',
      title: __('perform.watercolorWitcher.name'),
      Conductor: WatercolorWitcherConductor
    },

    {
      name: 'snowflake-maker',
      title: __('perform.snowflakeMaker.name'),
      Conductor: SnowflakeMakerConductor
    }
  ]

  get performName () {
    return this.$route.params.performName
  }

  get $peformContainer () {
    return this.$refs.performContainer
  }

  get currentPerform (): PerformItem {
    const result = this.performs
      .find(perform => perform.name === this.performName)

    return result || this.performs[0]
  }

  mounted () {
    if (!this.performName) {
      return this.$router.replace(`${PATHS.PLAYGROUND}/${DEFAULT_PERFORM_NAME}`)
    }

    this.renderCurrentPerform()
  }

  beforeRouteUpdate (to: Route, from: Route, next: any) {
    // Route: From
    this.conductor.unmount()

    // Route: To
    next()
    this.renderCurrentPerform()
  }

  beforeRouteLeave (to: Route, from: Route, next: any) {
    this.conductor.unmount()

    next()
  }

  renderCurrentPerform () {
    this.conductor = new this.currentPerform.Conductor()
    this.conductor.mount(this.$peformContainer as HTMLElement)
  }

  handleReturnAppClick () {
    this.$router.push(PATHS.APP)
  }

  handleSwitchPerformClick (event: any) {
    const { name } = event.currentTarget.dataset

    if (name === this.performName) {
      return
    }

    this.$router.replace(`${PATHS.PLAYGROUND}/${name}`)
  }

}
</script>

<style lang="stylus">
@require '../styles/ref'

.page-playground
  transition: background 318ms

  &.shamisen-rain
    background-color: $gray90

    .control-layer,
    .btn-default.is-ghost,
    .dropdown
      color: $black !important

  &.watercolor-witcher
    background-color: $darkCyan

  [class*='-layer']
    transition: all 318ms
    position: absolute

    &.v-enter,
    &.v-leave-active
      opacity: 0
      visibility: hidden
      transform: translateY(35px)

  .control-layer
    z-index: 2
    width: 100%
    color: $gray90

    > *
      position: absolute
      top: 20px

    .menu-handler
      left: 20px

    .playground-name
      left: 76px
      line-height: 46px
      text-bold()

  .perform-layer
    &,
    .perform-container,
    canvas
      fullscreen()

</style>
