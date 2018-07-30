import * as PIXI from 'pixi.js'
import anime from 'animejs'
import { $$Base } from './base-class'

export class $$Sky extends $$Base {
  isThundering: boolean
  isTweening: boolean

  setup () {
    this.$object = new PIXI.Graphics()

    this.$object.alpha = 0
  }

  draw (screenWidth: number, screenHeight: number) {
    const { $object } = this

    if (!$object) {
      return
    }

    $object.clear()
    $object.beginFill(0x999999)

    $object.width = screenWidth
    $object.height = screenHeight

    $object.drawRect(0, 0, screenWidth, screenHeight)
  }

  onresize (screenWidth: number, screenHeight: number) {
    this.draw(screenWidth, screenHeight)
  }

  update () {
    if (this.isTweening) {
      return
    }

    if (this.$object.alpha < 0.005) {
      this.$object.alpha = 0
      this.isThundering = false
    } else {
      this.$object.alpha *= 0.95
    }
  }

  thunder (
    power: number,
    callback?: (power: number) => void
  ) {
    if (this.isThundering || this.isTweening) {
      return
    }
    if (power && callback) {
      callback(power)
    }
    this.isThundering = true
    this.isTweening = true
    anime({
      targets: this.$object,
      alpha: power,
      duration: 168,
      complete: () => {
        this.isTweening = false
      }
    })
  }

}
