<template lang="pug">
.page-space
  | space
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class extends Vue {

  mounted() {
    this.handleOnboard()
  }

  handleOnboard () {
    this.$store.commit('updateContext', {
      isFirstVisit: false
    })
  }

}
</script>
