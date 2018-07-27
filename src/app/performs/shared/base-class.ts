import * as PIXI from 'pixi.js'
import * as dat from 'dat.gui'
import anime from 'animejs'
import debounce from 'lodash/debounce'

// @FIXME: HMR deps calculation wrong, only reload page to update changes...
if (module.hot) {
  module.hot.accept(() => {
    window.location.reload()
  })
}

export abstract class BaseConductor {

  protected app: PIXI.Application
  protected $container: HTMLElement
  protected datGUI: dat.GUI
  protected shouldUpdate: boolean

  constructor () {
    // Remove PIXI banner from the console
    PIXI.utils.sayHello = () => {}

    // Renderer
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      transparent: true,
      antialias: true,
      autoStart: false
    })
    this.app.renderer.autoResize = true

    // GUI
    this.removeGUI()
    this.datGUI = new dat.GUI({
      autoPlace: false
    })

    // Setup BLL
    if (this.setup) {
      this.setup()
    }
  }

  // The abstract functions, need to implement by derived class
  abstract setup? (): void
  abstract update? (lastTime: number): void
  onmount? (): void
  onunmount? (): void
  onresize? (screenWidth: number, screenHeight: number): void

  public mount = ($container: HTMLElement) => {
    console.log('Conductor mounted')

    this.$container = $container

    // Append views
    this.app.stage.alpha = 0
    this.datGUI.domElement.style.opacity = '0'
    if (this.datGUI.__controllers.length) {
      $container.appendChild(this.datGUI.domElement)
    }
    $container.appendChild(this.app.view)

    // Start loop
    this.app.start()
    this.app.ticker.add(this.updater, this)
    this.shouldUpdate = true

    // enable enter transition
    // @FIXME: Remove blink bug
    anime({
      targets: [ this.app.stage, this.datGUI.domElement ],
      alpha: 1, // For PIXI element
      opacity: 1, // For DOM
      duration: 568,
      easing: 'easeInSine'
    })

    window.addEventListener('resize', this.handleResize)

    if (this.onmount) {
      this.onmount()
    }
  }

  public unmount = () => {
    if (!this.$container) {
      return
    }

    this.$container.removeChild(this.app.view)
    this.removeGUI()

    this.shouldUpdate = false
    this.app.stage.removeChildren()
    this.app.stop()

    window.removeEventListener('resize', this.handleResize)

    if (this.onunmount) {
      this.onunmount()
    }
  }

  private handleResize = debounce(() => {
    const width = window.innerWidth
    const height = window.innerHeight

    // Resize the renderer
    this.app.renderer.resize(width, height)

    // @TODO: handle stage elements resize
    if (this.onresize) {
      this.onresize(width, height)
    }
  })

  private removeGUI () {
    if (!this.datGUI || !this.$container) {
      return
    }

    try {
      this.$container.removeChild(this.datGUI.domElement)
    } catch (error) {}
  }

  private updater (lastTime: number) {
    if (this.update) {
      this.update(lastTime)
    }
  }

}
