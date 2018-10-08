import {
  BaseConductor,
  SnowflakeGrowthModelOnGPU,
  $$GrowthModel2DRender, GrowthModel3DRender
} from '../shared'
import { __ } from '../../services/i18n'
import { FONT_FAMILY, COLORS } from '../../utils/constants'

const IS_3D_VIEW = false

export class SnowflakeMakerConductor extends BaseConductor {
  $loading: PIXI.Text
  snowflakeGrowthModel: SnowflakeGrowthModelOnGPU
  $$growthModel2DRender: $$GrowthModel2DRender
  growthModel3DRender: GrowthModel3DRender

  setup () {
    this.showLoading()

    this.setupSnowflakeModel()
    this.setupGuiController()

    this.hideLoading()
  }

  setupSnowflakeModel () {
    this.snowflakeGrowthModel = new SnowflakeGrowthModelOnGPU({
      snowflakeInput: {
        rowCells: 300, // 700
        hexSize: 1,
        parameters: {
          rho: 0.58,
          beta: 2.0,
          alpha: Math.random() * 0.3,
          theta: Math.random() * 0.5595 + 0.02,
          kappa: Math.random() * 0.05,
          mu: Math.random() * 0.01,
          gamma: 0.0000515,
          sigma: 0 // Math.random() * - 0.5
        }
      }
    })

    if (IS_3D_VIEW) {
      this.growthModel3DRender = new GrowthModel3DRender({
        growthModel: this.snowflakeGrowthModel
      })
    } else {
      this.$$growthModel2DRender = new $$GrowthModel2DRender({
        growthModel: this.snowflakeGrowthModel
      })

      this.$$growthModel2DRender.appendTo(this.app.stage)
    }

    this.snowflakeGrowthModel.updateStatus('growthing')
    this.alignCenterAndMiddle(this.$$growthModel2DRender.$object)
  }

  setupGuiController () {
    const guiController = this.datGUI

    guiController.add(this.snowflakeGrowthModel.snowflakeData, 'generation')
    guiController.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'rho')
  }

  onresize (width: number, height: number) {
    if (IS_3D_VIEW) {
      // @TODO: handle resize
    } else {
      this.$$growthModel2DRender.onresize(width, height)
    }
  }

  update () {
    if (IS_3D_VIEW) {
      // @TODO: handle update
    } else {
      this.$$growthModel2DRender.update()
    }
    this.datGUI.updateDisplay()
  }

  showLoading () {
    this.$loading = new PIXI.Text(__('perform.snowflakeMaker.loading'), {
      fontFamily: FONT_FAMILY,
      fontSize: 26,
      fill: COLORS.LIGHT_WHITE
    })

    this.alignCenterAndMiddle(this.$loading)
    this.app.stage.addChild(this.$loading)
  }

  hideLoading () {
    if (this.$loading) {
      this.$loading.destroy()
      delete this.$loading
    }
  }

}
