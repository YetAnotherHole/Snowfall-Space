import * as PIXI from 'pixi.js'
import { SnowflakeGrowthModelOnGPU } from '../growth-model-on-gpu'
import { $$Base } from '../../base-class'
import { COLORS } from '../../../../utils/constants'

interface IGrowthModel2DRenderOptions {
  growthModel: SnowflakeGrowthModelOnGPU
}

export class $$GrowthModel2DRender extends $$Base<IGrowthModel2DRenderOptions> {

  setup (options: IGrowthModel2DRenderOptions) {
    this.$object = new PIXI.Container()
  }

  onresize (screenWidth: number, screenHeight: number) {
    this.$object.x = screenWidth / 2
    this.$object.y = screenHeight / 2
  }

  update () {
    const { growthModel } = this.options

    growthModel.growth()
    this.draw()
  }

  draw () {
    this.drawAttachedCell()
  }

  drawAttachedCell () {

  }

}
