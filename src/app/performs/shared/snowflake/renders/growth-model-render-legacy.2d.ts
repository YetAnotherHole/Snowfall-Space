import * as PIXI from 'pixi.js'
import { SnowflakeGrowthModelOnCore } from '../growth-model-on-core'
import { $$Base } from '../../base-class'
import { COLORS } from '../../../../utils/constants'

// @TODO: Replace SnowflakeGrowthModelOnCore with SnowflakeGrowthModelOnGPU
// @TODO: Refactor 2D render
// @See Performance Tips: https://github.com/pixijs/pixi.js/wiki/v4-Performance-Tips
interface IGrowthModel2DRenderOptions {
  growthModel: SnowflakeGrowthModelOnCore
}

export class $$GrowthModel2DRender extends $$Base<IGrowthModel2DRenderOptions> {
  // @TODO: Use PIXI.particles & PIXI.Sprite to get a nice speed boost
  attachedCellMap: { [key: string]: PIXI.Graphics }
  $lines: PIXI.Graphics

  setup (options: IGrowthModel2DRenderOptions) {
    const { growthModel } = this.options
    const { snowflakeData } = growthModel
    const firstHex = growthModel.grid[0]

    this.attachedCellMap = {}
    this.$object = new PIXI.Container()
    this.$lines = new PIXI.Graphics()

    this.$object.addChild(this.$lines)

    if (firstHex) {
      this.$object.pivot.x = firstHex.width() * snowflakeData.rowCells / 2
      // @FIXME: Tuning hex height
      this.$object.pivot.y = firstHex.height() * snowflakeData.rowCells / 2.5
    }

    this.setupLines()
  }

  setupLines () {
    const { growthModel } = this.options

    this.$lines.lineStyle(1, COLORS.LIGHT_WHITE)
    this.$lines.alpha = 0.08

    growthModel.grid.map(hex => {
      const point = hex.toPoint()
      const corners = hex.corners().map(corner => corner.add(point))
      const [firstCorner, ...otherCorners] = corners
      this.$lines.moveTo(firstCorner.x, firstCorner.y)
      otherCorners.forEach(({ x, y }) => this.$lines.lineTo(x, y))
      this.$lines.lineTo(firstCorner.x, firstCorner.y)
    })
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
    const { growthModel } = this.options

    growthModel.grid.map(hex => {
      const hexString = hex.toString()
      if (!this.attachedCellMap[hexString]) {
        const $attachedCell = new PIXI.Graphics()
        $attachedCell.beginFill(COLORS.LIGHT_WHITE)
        this.attachedCellMap[hexString] = $attachedCell

        const point = hex.toPoint()
        const corners = hex.corners().map(corner => corner.add(point))
        const [firstCorner, ...otherCorners] = corners
        $attachedCell.moveTo(firstCorner.x, firstCorner.y)
        otherCorners.map(({ x, y }) => $attachedCell.lineTo(x, y))
        $attachedCell.lineTo(firstCorner.x, firstCorner.y)
        this.$object.addChild($attachedCell)
      }

      const $attachedCell = this.attachedCellMap[hexString]
      if (hex.attached) {
        $attachedCell.alpha = 1
      } else {
        $attachedCell.alpha = hex.diffusiveMass / 5
      }
    })
  }

}
