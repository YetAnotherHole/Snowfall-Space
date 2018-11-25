<template lang="pug">
.page-space
  .fixed-layer
    .incubating-tips
      .tips-background
        img.info-image(src="../assets/images/chione-prototype@2x.png")
        .info-text
           | 属于雪花落语的冬天还没到来<br>
           | 或许
           | <router-link to="/playground/snowflake-maker"> 实验场 </router-link>
           | 可以先满足你的好奇

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

<style lang="stylus">
@require '../styles/ref'

.fixed-layer
  position: fixed
  display: flex
  align-items: center
  justify-content: center
  z-index: 2333
  width: 100vw
  height: 100vh
  background-color: #f5f6f0

  .incubating-tips
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column

    .tips-background
      width: 306px
      height: 325px
      padding: 20px
      background: $white
      box-shadow: 2px 3px 0 2px rgba(0, 0, 0, 0.1)

    .info-image
      width: 266px
      height: 200px

     .info-text
       color: $black
       margin-top: 20px
       text-align: center

       a
         color: $darkCyan
         text-decoration: none

</style>
