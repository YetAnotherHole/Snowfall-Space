import * as PIXI from 'pixi.js'
import Tone from 'tone'
import { FONT_FAMILY } from '../../utils/constants'
import { BaseConductor, toneInstruments } from '../shared'

class ShamisenRainConductor extends BaseConductor {
  private shamisen: Tone.Sampler

  // PIXI display objects
  private loading: PIXI.Text

  setup () {
    this.showLoading()

    this.shamisen = toneInstruments['shamisen']

    Tone.Buffer.on('load', () => {
      this.hideLoading()
      this.shamisen.toMaster()
      this.shamisen.triggerAttack('80')
    })

    console.log('Shamisen', PIXI, this.shamisen)
  }

  update () {
    // @TODO
  }

  destory () {
    // @TODO
  }

  alignMiddleAndCenter (displayObject: PIXI.Sprite) {
    displayObject.x = this.app.screen.width / 2
    displayObject.y = this.app.screen.height / 2
    displayObject.anchor.x = 0.5
    displayObject.anchor.y = 0.5
  }

  showLoading () {
    this.loading = new PIXI.Text('Loading', {
      fontFamily: FONT_FAMILY,
      fontSize: 26,
      fill : 0xe5e5e5
    })

    this.alignMiddleAndCenter(this.loading)

    this.app.stage.addChild(this.loading)
  }

  hideLoading () {
    if (this.loading) {
      this.loading.destroy()
    }
  }

}

export const shamisenRainConductor = new ShamisenRainConductor()
