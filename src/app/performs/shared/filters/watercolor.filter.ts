import * as PIXI from 'pixi.js'

const vertex = require('./watercolor.filter.vert')
// @TODO: Ink, Oil -> Watercolor
// @TODO: Optimize watercolor filter fragment
const fragment = require('./archives/chinese-ink.filter.frag')

interface WatercolorFilterUniform {
  [key: string]: any
  texel?: number[]
  scale?: number // Wobble scale [0, 0.2]
  threshold?: number // Edge threshold [0, 1]
  darkening?: number // Edge darkening [0, 3]
  pigment?: number // Pigment dispersion [0, 3]
}

export interface IWatercolorFilterOptions extends WatercolorFilterUniform {
}

export class WatercolorFilter extends PIXI.Filter<WatercolorFilterUniform> {
  options: IWatercolorFilterOptions

  defaultOptions: IWatercolorFilterOptions = {
    texel: [ 1 / 100, 1 / 100 ],
    scale: 0.01,
    threshold: 0,
    darkening: 1.03,
    pigment: 0.6
  }

  constructor (options?: IWatercolorFilterOptions) {
    super(vertex, fragment)

    this.options = {
      ...this.defaultOptions,
      ...options
    }

    Object.keys(this.options).map(uniform => {
      this.uniforms[uniform] = this.options[uniform]
    })
  }

}
