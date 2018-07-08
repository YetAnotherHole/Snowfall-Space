<template lang="pug">
.page-playground

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
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

import { __ } from '../services/i18n'
import { PATHS } from '../router'
import {
  BaseConductor,
  watercolorConductor
} from '../performs'

interface PerformItem {
  name: string,
  title: string,
  conductor: BaseConductor
}

const DEFAULT_PERFORM_NAME = 'watercolor'

@Component
export default class extends Vue {

  performs: PerformItem[] = [
    {
      name: 'watercolor',
      title: __('perform.watercolor.name'),
      conductor: watercolorConductor
    },

    {
      name: 'snowflake-maker',
      title: __('perform.snowflakeMaker.name'),
      conductor: watercolorConductor
    }
  ]

  get performName () {
    return this.$route.params.performName
  }

  get currentPerform () {
    return this.performs
      .find(perform => perform.name === this.performName)
  }

  mounted () {
    if (!this.performName) {
      this.$router.replace(`${PATHS.PLAYGROUND}/${DEFAULT_PERFORM_NAME}`)
    }
  }

  handleReturnAppClick () {
    this.$router.push(PATHS.APP)
  }

  handleSwitchPerformClick (event: any) {
    const { name } = event.currentTarget.dataset
    this.$router.replace(`${PATHS.PLAYGROUND}/${name}`)
  }

}
</script>

<style lang="stylus">
@require '../styles/ref'

.page-playground

  .piece-view
    height: 100%

  [class*='-layer']
    transition: all 318ms

    &.v-enter,
    &.v-leave-active
      opacity: 0
      visibility: hidden
      transform: translateY(35px)

  .control-layer
    position: relative
    z-index: 2

    > *
      position: absolute
      top: 20px

    .menu-handler
      left: 20px

    .playground-name
      left: 76px
      line-height: 46px
      color: $gray90
      text-bold()

</style>
