import { autobind } from 'core-decorators'
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
          rowCells: 20,
          hexSize: 15,
          parameters: growthModelParametersPresetsMap.default
        }
      })
    } else {
      this.snowflakeGrowthModel = new SnowflakeGrowthModelOnGPU({
        renderer: this.app.renderer,
        snowflakeInput: {
          // @TODO: Support small mobile screen the width is less than 701
          rowCells: 501, // 501
          hexSize: 1,
          parameters: growthModelParametersPresetsMap.default
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
    this.onresize(this.app.screen.width, this.app.screen.height)
  }

  setupGuiController () {
    const guiController = this.datGUI
    const rememberedData = {
      Default: {
        0: growthModelParametersPresetsMap.default
      }
    }

    Object.keys(growthModelParametersPresetsMap).map(key => {
      if (key !== 'default') {
        rememberedData[key] = {
          0: growthModelParametersPresetsMap[key]
        }
      }
    })

    guiController.load['remembered'] = rememberedData
    guiController.remember(growthModelParametersPresetsMap.default)

    guiController.add(this.snowflakeGrowthModel.snowflakeData, 'generation').listen()
    guiController.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'rho', 0.25, 1.2).onChange(this.resetGrowthModel)
    guiController.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'beta', 0.699, 3.1).onChange(this.resetGrowthModel)

    const rest = guiController.addFolder('Rest...')
    rest.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'alpha', 0.00001, 0.4).onChange(this.resetGrowthModel)
    rest.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'theta', 0.002, 0.09).onChange(this.resetGrowthModel)
    rest.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'kappa', 0.000001, 0.09).onChange(this.resetGrowthModel)
    rest.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'mu', 0.01, 0.2).onChange(this.resetGrowthModel)
    rest.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'gamma', 0.000001, 0.00005).onChange(this.resetGrowthModel)
    rest.add(this.snowflakeGrowthModel.snowflakeData.parameters, 'sigma', 0, 0.2).listen().onChange(this.resetGrowthModel)

    if (this.$$growthModel2DRender.shader) {
      const visual = guiController.addFolder('Visual')
      visual.open()
      visual.add(this.snowflakeGrowthModel.snowflakeData, 'theme', [ 'gray', 'mono', 'ice', 'hyaline', 'fantasy' ]).onFinishChange(this.setGrowthVisual)
      visual.add(this.$$growthModel2DRender.shader.uniforms, 'maxBeta').listen()
      visual.add(this.$$growthModel2DRender.shader.uniforms, 'curveBeta')
    }
  }

  @autobind
  resetGrowthModel () {
    this.snowflakeGrowthModel.reset()
    if (this.$$growthModel2DRender.shader) {
      this.$$growthModel2DRender.shader.uniforms.maxBeta = this.snowflakeGrowthModel.snowflakeData.parameters.beta + 0.1
    }
  }

  @autobind
  setGrowthVisual () {
    this.$$growthModel2DRender.updateVisualUniformByTheme()
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
    // this.datGUI.updateDisplay()
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
