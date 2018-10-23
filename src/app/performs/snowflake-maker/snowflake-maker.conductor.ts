import {
  BaseConductor,
  SnowflakeGrowthModelOnGPU,
  SnowflakeGrowthModelOnCore,
  growthModelParametersPresetsMap,
  $$GrowthModel2DRender, $$GrowthModel2DRenderLegacy, GrowthModel3DRender
} from '../shared'
import { __ } from '../../services/i18n'
import { FONT_FAMILY, COLORS } from '../../utils/constants'

const ENABLE_LEGACY = false
const IS_3D_VIEW = !ENABLE_LEGACY && false

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
    if (ENABLE_LEGACY) {
      this.snowflakeGrowthModel = new SnowflakeGrowthModelOnCore({
        renderer: this.app.renderer,
        snowflakeInput: {
          rowCells: 31,
          hexSize: 10,
          parameters: growthModelParametersPresetsMap.default
        }
      })
    } else {
      this.snowflakeGrowthModel = new SnowflakeGrowthModelOnGPU({
        renderer: this.app.renderer,
        snowflakeInput: {
          rowCells: 501, // 701
          hexSize: 1,
          parameters: growthModelParametersPresetsMap.fernlike
        }
      })
    }

    if (IS_3D_VIEW) {
      this.growthModel3DRender = new GrowthModel3DRender({
        growthModel: this.snowflakeGrowthModel
      })
    } else {
      const Class = ENABLE_LEGACY ? $$GrowthModel2DRenderLegacy : $$GrowthModel2DRender
      this.$$growthModel2DRender = new Class({
        renderer: this.app.renderer,
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
    guiController.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'beta')
  }

  onresize (width: number, height: number) {
    if (IS_3D_VIEW) {
      // @TODO: handle 3D view resize
    } else {
      this.$$growthModel2DRender.onresize(width, height)
    }
  }

  update () {
    if (IS_3D_VIEW) {
      // @TODO: handle 3D view update
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
