import * as PIXI from 'pixi.js'
import { COLORS } from '../../../utils/constants'
import { INoteEvent } from '../../shared'
import { $$Base } from './base-class'

export interface I$$RaindropOptions {
  x?: number
  gravity?: number
  size?: number
  color?: string
  note?: INoteEvent
}

export class $$Raindrop extends $$Base {
  spend: number

  setup () {
    this.options = {
      x: 0,
      gravity: 0.2,
      size: 20,
      color: COLORS.LIGHT_WHITE,
      ...this.options
    }

    const { x, size, color } = this.options

    this.$object = new PIXI.Graphics()
    this.$object.x = x
    this.$object.y = -size * 2

    this.$object.beginFill(color)
    this.$object.drawCircle(0, 0, size)

    this.spend = 10
  }

  getNote () {
    return this.options.note
  }

  isDead (containerHeight: number) {
    return this.$object.y > containerHeight
  }

  dropAction () {
    const { gravity } = this.options

    this.spend += gravity
    this.$object.y += this.spend
  }

}
