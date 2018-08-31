import * as PIXI from 'pixi.js'
import { COLORS } from '../../utils/constants'
import { $$Base } from '../shared'

export interface I$$StarOptions {
  x: number
  y: number
  xSpend: number
  ySpend: number
  radius: number
  alpha: number
}

export class $$Star extends $$Base {

  $object: PIXI.Graphics
  xForce = 1
  yForce = 1

  setup (options: I$$StarOptions) {
    this.$object = new PIXI.Graphics()

    this.$object.beginFill(COLORS.LIGHT_WHITE)
      .drawCircle(0, 0, options.radius)

    this.$object.x = options.x
    this.$object.y = options.y
    this.$object.alpha = options.alpha
  }

  move () {
    if (this.$object.x < 0 || this.$object.x > window.innerWidth) {
      this.xForce *= -1
    }

    if (this.$object.y < 0 || this.$object.y > window.innerHeight) {
      this.yForce *= -1
    }

    this.$object.x += this.options.xSpend * this.xForce
    this.$object.y += this.options.ySpend * this.yForce
  }

}
