<template>
  <svg version="1.1"
    :view-box.camel="box"
    :class="klass"
    :role="label ? 'img' : 'presentation'"
    :aria-label="label"
    :width="icon.width"
    :height="icon.height"
    :style="style">
      <path v-if="icon && icon.paths" v-for="(path, i) in icon.paths"
        v-bind="path"
        fill-rule="nonzero"
        :key="`path-${i}`"
      />
  </svg>
</template>

<style>
.fa-icon {
  display: inline-block;
  fill: currentColor;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
  width: 1em;
  height: 1em;
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-spin {
  animation: fa-spin 1s 0s infinite linear;
}

.fa-inverse {
  color: #fff;
}

.fa-pulse {
  animation: fa-spin 1s infinite steps(8);
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<script>
// @ref: https://github.com/Justineo/vue-awesome

let icons = {
  "bars": {
    "width": 448,
    "height": 512,
    "paths": [{"d":"M16 132H432C440.8 132 448 124.8 448 116V76C448 67.2 440.8 60 432 60H16C7.2 60 0 67.2 0 76V116C0 124.8 7.2 132 16 132zM16 292H432C440.8 292 448 284.8 448 276V236C448 227.2 440.8 220 432 220H16C7.2 220 0 227.2 0 236V276C0 284.8 7.2 292 16 292zM16 452H432C440.8 452 448 444.8 448 436V396C448 387.2 440.8 380 432 380H16C7.2 380 0 387.2 0 396V436C0 444.8 7.2 452 16 452z"}]
  }
}

export default {
  name: 'ss-icon',
  props: {
    name: {
      type: String,
      validator (val) {
        if (val && !(val in icons)) {
          console.warn(`Invalid prop: prop "name" is referring to an unregistered icon "${val}".` +
            `\nPlease make sure you have imported this icon before using it.`)
          return false
        }
        return true
      }
    },
    scale: [Number, String],
    spin: Boolean,
    inverse: Boolean,
    pulse: Boolean,
    flip: {
      validator (val) {
        return val === 'horizontal' || val === 'vertical'
      }
    },
    label: String
  },
  data () {
    return {
      x: false,
      y: false,
      childrenWidth: 0,
      childrenHeight: 0,
      outerScale: 1
    }
  },
  computed: {
    normalizedScale () {
      let scale = this.scale
      scale = typeof scale === 'undefined' ? 1 : Number(scale)
      if (isNaN(scale) || scale <= 0) {
        console.warn(`Invalid prop: prop "scale" should be a number over 0.`, this)
        return this.outerScale
      }
      return scale * this.outerScale
    },
    klass () {
      return {
        'fa-icon': true,
        'fa-spin': this.spin,
        'fa-flip-horizontal': this.flip === 'horizontal',
        'fa-flip-vertical': this.flip === 'vertical',
        'fa-inverse': this.inverse,
        'fa-pulse': this.pulse
      }
    },
    icon () {
      if (this.name) {
        return icons[this.name]
      }
      return null
    },
    box () {
      if (this.icon) {
        return `0 0 ${this.icon.width} ${this.icon.height}`
      }
      return `0 0 ${this.width} ${this.height}`
    },
    ratio () {
      if (!this.icon) {
        return 1
      }
      let { width, height } = this.icon
      return Math.max(width, height) / 16
    },
    width () {
      return this.childrenWidth || this.icon && this.icon.width / this.ratio * this.normalizedScale || 0
    },
    height () {
      return this.childrenHeight || this.icon && this.icon.height / this.ratio * this.normalizedScale || 0
    },
    style () {
      if (this.normalizedScale === 1) {
        return false
      }
      return {
        fontSize: this.normalizedScale + 'em'
      }
    },
    raw () {
      // generate unique id for each icon's SVG element with ID
      if (!this.icon || !this.icon.raw) {
        return null
      }
      let raw = this.icon.raw
      let ids = {}
      raw = raw.replace(/\s(?:xml:)?id=(["']?)([^"')\s]+)\1/g, (match, quote, id) => {
        let uniqueId = getId()
        ids[id] = uniqueId
        return ` id="${uniqueId}"`
      })
      raw = raw.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (match, rawId, _, pointerId) => {
        let id = rawId || pointerId
        if (!id || !ids[id]) {
          return match
        }

        return `#${ids[id]}`
      })

      return raw
    }
  },
  mounted () {
    if (!this.name && this.$children.length === 0) {
      console.warn(`Invalid prop: prop "name" is required.`)
      return
    }

    if (this.icon) {
      return
    }

    let width = 0
    let height = 0
    this.$children.forEach(child => {
      child.outerScale = this.normalizedScale

      width = Math.max(width, child.width)
      height = Math.max(height, child.height)
    })
    this.childrenWidth = width
    this.childrenHeight = height
    this.$children.forEach(child => {
      child.x = (width - child.width) / 2
      child.y = (height - child.height) / 2
    })
  },
  register (data) {
    for (let name in data) {
      let icon = data[name]

      if (!icon.paths) {
        icon.paths = []
      }
      if (icon.d) {
        icon.paths.push({ d: icon.d })
      }

      if (!icon.polygons) {
        icon.polygons = []
      }
      if (icon.points) {
        icon.polygons.push({ points: icon.points })
      }

      icons[name] = icon
    }
  },
  icons
}

let cursor = 0xd4937
function getId () {
  return `fa-${(cursor++).toString(16)}`
}
</script>
