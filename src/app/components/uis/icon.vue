<template lang="pug">
fa-icon.svg-symbol(
  :name="name"
  :spin="spin"
  :pulse="pulse"
)
</template>

<script>
import Icon from 'vue-awesome/components/Icon.vue'

import 'vue-awesome/icons/bars'

export default {

  name: 'ss-icon',

  props: [ 'name', 'spin', 'pulse' ],

  components: {
    'fa-icon': Icon
  }

}
</script>

<style lang="stylus">
.svg-symbol
  display: inline-block
  vertical-align: middle
  fill: currentColor
  overflow: hidden
  width: 1em
  height: 1em
</style>
