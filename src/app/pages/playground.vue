<template lang="pug">
.page-playground
  | playground
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class extends Vue {

  mounted() {
    console.log(this.$store.state)
  }

}
</script>
