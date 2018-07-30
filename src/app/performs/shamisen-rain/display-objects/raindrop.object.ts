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
      gravity: window.innerHeight / 2400,
      size: 20,
      color: COLORS.GRAY_80,
      ...this.options
    }

    const { x, size, color } = this.options

    this.$object = new PIXI.Graphics()
    this.$object.x = x
    this.$object.y = -size * 2
    this.$object.alpha = 0.95

    this.$object.beginFill(color)
    this.$object.arc(size / 2, size / 2, size, 0, Math.PI, false)
	  this.$object.lineTo(size / 2, -(size * 1.5))
    this.$object.lineTo(size * 1.5, size / 2)

    this.spend = window.innerHeight / 200
  }

  getNote () {
    return this.options.note
  }

  isDead (containerHeight: number) {
    return this.$object.y > containerHeight
  }

  dropAction (windforce = 0) {
    const { gravity, note } = this.options
    let rotation = 0

    if (note.time) {
      windforce = (note.time / 10) & 2 ? 1.4 : -1.4
    }

    windforce = Math.min(windforce, 5)
    windforce = Math.max(windforce, -5)

    if (windforce) {
      rotation = windforce > 0 ? 0.015 : -0.015
    }

    this.spend += gravity
    this.$object.x += windforce
    this.$object.y += this.spend
    this.$object.rotation += rotation
  }

}
