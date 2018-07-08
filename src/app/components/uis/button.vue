<template>
  <button
    class="btn"
    :class="['btn-' + type, {
      'disabled': disabled,
      'is-ghost': ghost,
      'is-block': block
    }]"
    @click="handleClick"
  >
    <ss-icon :name="icon" v-if="icon"></ss-icon>
    <slot></slot>
  </button>
</template>

<script>
import Icon from './icon'
/**
 * Button Generic Component
 *
 * @param {string} [type=default] - button type, including default, primary, danger
 * @param {boolean} [disabled=false] - disabled
 * @param {boolean} [is-ghost=false] - is ghost button
 * @param {boolean} [is-block=false] - is block button
 * @param {string} [icon] - icon name
 *
 * @example
 * <ss-button icon="menu" type="primary">Text</ss-button>
 */
export default {
  name: 'ss-button',

  components: {
    Icon
  },

  props: {
    icon: String,
    disabled: Boolean,
    block: Boolean,
    ghost: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'default'
    }
  },

  methods: {
    handleClick ($event) {
      if (this.disabled || this.loading) {
        $event.preventDefault()
        $event.stopPropagation()
        return
      }
    }
  }
}
</script>

<style lang="stylus">
@require '../../styles/ref'

.btn
  display: inline-flex
  align-items: center
  position: relative
  padding: 12px 12px
  font-size: 22px
  transition: all 318ms
  border: none
  cursor: pointer

  &.is-block
    display: flex
    width: 100%
    justify-content: center

  &.disabled
    background-color: $gray97 !important
    border-color: $gray85 !important
    color: $gray65 !important
    opacity: 1 !important
    cursor: not-allowed

.btn-default
  &.is-ghost
    background-color: transparent
    color: $gray90

    &:hover
      color: lighten($gray90, 20%)
      background-color: alpha($gray90, 10%)

    &:active,
    &.is-active
      color: lighten($gray90, 25%)
      background-color: alpha($gray90, 15%)

.btn-dark
  background-color: alpha($gray50, 15%)
  &:hover
    color: white
    background-color: $black
</style>
