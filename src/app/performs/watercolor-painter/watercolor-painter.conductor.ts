import * as PIXI from 'pixi.js'
import { BaseConductor } from '../shared'

export class WatercolorPainterConductor extends BaseConductor {
  $moon: PIXI.Graphics

  setup () {
    this.setupMoon()

    const guiController = this.datGUI
    guiController.add(this.$moon, 'alpha', 0, 1)
    const positionFolder = guiController.addFolder('position')
    positionFolder.add(this.$moon, 'x')
    positionFolder.add(this.$moon, 'y')
  }

  setupMoon () {
    const moon = this.$moon = new PIXI.Graphics()
      .beginFill(0xF0E38D)
      .drawCircle(0, 0, 100)

    moon.x = 300
    moon.y = 300

    this.app.stage.addChild(this.$moon)
  }

  update () {
    const delta = Math.random() < 0.5 ? -1 : 1

    this.$moon.x += delta
    this.$moon.y += delta
  }

}

export const watercolorPainterConductor = new WatercolorPainterConductor()
