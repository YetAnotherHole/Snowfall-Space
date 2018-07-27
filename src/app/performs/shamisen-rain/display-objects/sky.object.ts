import * as PIXI from 'pixi.js'
import { $$Base } from './base-class'

export class $$Sky extends $$Base {
  isThundering: boolean

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
    $object.beginFill(0xFFFFFF)

    $object.width = screenWidth
    $object.height = screenHeight

    $object.drawRect(0, 0, screenWidth, screenHeight)
  }

  onresize (screenWidth: number, screenHeight: number) {
    this.draw(screenWidth, screenHeight)
  }

  update () {
    if (this.$object.alpha < 0.005) {
      this.$object.alpha = 0
      this.isThundering = false
    } else {
      this.$object.alpha *= 0.95
    }
  }

  thunder (power: number) {
    if (this.isThundering && !power) {
      return
    }

    this.isThundering = true
    this.$object.alpha = power
  }

}
