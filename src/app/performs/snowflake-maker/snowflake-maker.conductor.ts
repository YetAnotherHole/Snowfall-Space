import { BaseConductor } from '../shared'
import { __ } from '../../services/i18n'
import { FONT_FAMILY, COLORS } from '../../utils/constants'

export class SnowflakeMakerConductor extends BaseConductor {
  $loading: PIXI.Text

  setup () {
    this.showLoading()
  }

  update () {

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

}
