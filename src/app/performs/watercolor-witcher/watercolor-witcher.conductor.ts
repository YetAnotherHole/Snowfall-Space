import * as PIXI from 'pixi.js'
import Color from 'color'
import SimplexNoise from 'simplex-noise'
import { autobind } from 'core-decorators'
import { COLORS } from '../../utils/constants'
import { randomBetween } from '../../utils/random'
import { limitBetween } from '../../utils/number'
import { BaseConductor, WatercolorFilter } from '../shared'
import { $$Star, I$$StarOptions } from './star.object'

const MOON_RADIUS = 120
const DRAWING_LINE_ALPHA = 0.25

export class WatercolorWitcherConductor extends BaseConductor {
  $moon: PIXI.Graphics
  stars: $$Star[]

  $background: PIXI.Graphics
  $canvas: PIXI.Graphics
  isStartPainting: boolean
  lastPoint: PIXI.Point | null

  setup () {
    // Move `append` to `onmount` for supporting playgrounds
    this.setupFilter()
    this.setupBackground()
    this.setupMoon()
    this.setupStars()
    this.setupCanvas()
    this.setupGuiController()
  }

  setupFilter () {
    const watercolorFilter = new WatercolorFilter()
    const colorMatrix = new PIXI.filters.ColorMatrixFilter()

    this.app.stage.filters = [
      new PIXI.filters.NoiseFilter(0.06),
      watercolorFilter,
      colorMatrix
    ]

    colorMatrix.contrast(-0.2)
  }

  setupBackground () {
    const { width, height } = this.app.screen

    const $background = this.$background = new PIXI.Graphics()
      .beginFill(COLORS.DARK_CYAN)
      .drawRect(0, 0, width, height)

    $background.x = 0
    $background.y = 0
  }

  setupMoon () {
    const shadowColor$$ = new Color(COLORS.SOFT_YELLOW)
      .darken(0.17)
      .desaturate(0.24)

    const $moon = this.$moon = new PIXI.Graphics()
      .beginFill(shadowColor$$.rgbNumber())
      .drawCircle(8, 8, MOON_RADIUS + 4)
      .beginFill(COLORS.SOFT_YELLOW)
      .drawCircle(0, 0, MOON_RADIUS)

    $moon.alpha = 0.9

    this.alignCenterAndMiddle($moon)
  }

  setupCanvas () {
    const { width, height } = this.app.screen

    const $canvas = this.$canvas = new PIXI.Graphics()
      .beginFill(COLORS.SOFT_YELLOW, 0)
      .drawRect(0, 0, width, height)
      .endFill()

    $canvas.x = 0
    $canvas.y = 0
    $canvas.alpha = 0.9
    $canvas.filters = [
      // new PIXI.filters.NoiseFilter(0.2)
      new PIXI.filters.BlurFilter(1)
    ]
    $canvas.interactive = true
    $canvas.lineStyle(18, COLORS.DARK_CYAN, DRAWING_LINE_ALPHA)

    // @FIXME: Stage docs not support all events
    // document.addEventListener('mousedown', this.handleStartPainting)
    document.addEventListener('mouseup', this.handleEndPainting)

    // $canvas.on('pointerdown', this.handleStartPainting)
    $canvas.on('pointermove', this.handleMovePainting)

    this.app.stage.interactive = true
    this.app.stage.on('pointerdown', this.handleStartPainting)
    this.app.stage.on('pointerup', this.handleEndPainting)
  }

  setupStars () {
    const { width, height } = this.app.screen
    const STAR_COUNT = Math.round(Math.max(width, height) / 40)
    const simplex = new SimplexNoise()
    this.stars = []

    for (let i = 0; i < STAR_COUNT; i++) {
      const options: I$$StarOptions = {
        x: width * Math.abs(simplex.noise2D(width / i, 0) - 0.4),
        y: height * Math.abs(simplex.noise2D(0, height / i) - 0.4),
        xSpend: randomBetween(-0.15, 0.15),
        ySpend: randomBetween(-0.15, 0.15),
        radius: Math.round(Math.random() * randomBetween(2, 10)) + 4,
        alpha: 0.8 * (1 + randomBetween(-0.6, 1))
      }
      const $$star = new $$Star(options)
      this.stars.push($$star)
    }
  }

  setupGuiController () {
    const guiController = this.datGUI
    guiController.add(this.$canvas, 'lineColor', {
      '🌚️ Cyan': COLORS.DARK_CYAN,
      '🌝 Yellow': COLORS.SOFT_YELLOW,
      '⚪️ White': COLORS.LIGHT_WHITE
    }).name('Brush Color')
    guiController.add(this.$canvas, 'lineWidth', 6, 36).name('Brush Size')
    guiController.add(this.$canvas, 'lineAlpha', 0, 1).name('Brush Alpha')
    // const positionFolder = guiController.addFolder('Moon Position')
    // positionFolder.add(this.$moon, 'x')
    // positionFolder.add(this.$moon, 'y')
  }

  onmount () {
    if (!this.app.stage.children.length) {
      // DOM Impl
      this.app.stage.addChild(this.$background)
      this.stars.map($$star => {
        $$star.appendTo(this.app.stage, 1)
      })
      this.app.stage.addChild(this.$moon)
      this.app.stage.addChild(this.$canvas)
    }
  }

  onunmount () {
    document.removeEventListener('mousedown', this.handleStartPainting)
    document.removeEventListener('mouseup', this.handleEndPainting)
  }

  onresize (width: number, height: number) {
    this.alignCenterAndMiddle(this.$moon)
    this.$background.width = width
    this.$background.height = height
    this.$canvas.width = width
    this.$canvas.height = height
  }

  update () {
    // const moveX = randomBetween(-1, 1)
    // const moveY = randomBetween(-1, 1)

    // this.$moon.x += moveX
    // this.$moon.y += moveY
    // this.$canvas.x += moveX
    // this.$canvas.y += moveY

    this.stars.map($$star => {
      $$star.move()
    })
  }

  @autobind
  handleStartPainting (event: PIXI.interaction.InteractionEvent | any) {
    this.isStartPainting = true
    // Filter document event
    if (event.data) {
      const point = event.data.getLocalPosition(this.$canvas)
      // const prevBias = this.$canvas.lineWidth / 8
      // this.$canvas.drawCircle(point.x, point.y, prevBias)
      this.$canvas.moveTo(point.x, point.y)
      this.lastPoint = point
    }
  }

  @autobind
  handleMovePainting (event: PIXI.interaction.InteractionEvent) {
    if (this.isStartPainting) {
      const point = event.data.getLocalPosition(this.$canvas)
      if (!this.lastPoint) {
        this.lastPoint = point
      }
      this.$canvas.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.$canvas.lineTo(point.x, point.y)
      this.lastPoint = point
    }
  }

  @autobind
  handleEndPainting () {
    this.isStartPainting = false
    this.lastPoint = null
  }

}
