import * as PIXI from 'pixi.js'

interface IOptions {
  [key: string]: any
}

export abstract class $$Base {
  protected defaultOptions: IOptions
  protected options: IOptions = {}
  $object: PIXI.Graphics

  constructor (options?: IOptions) {
    this.options = {
      ...this.defaultOptions,
      ...options
    }

    if (this.setup) {
      this.setup()
    }
  }

  resize (screenWidth: number, screenHeight: number) {
    if (this.onresize) {
      this.onresize(screenWidth, screenHeight)
    }
  }

  abstract setup? (options?: IOptions): void
  // @FIXME: Optional abstract members
  // https://github.com/Microsoft/TypeScript/issues/6413
  onresize? (screenWidth: number, screenHeight: number): void

  appendTo ($container: PIXI.Container, index: number = 0) {
    $container.addChild(this.$object)
    $container.setChildIndex(this.$object, index)
  }

  destroy () {
    this.$object.destroy()
  }

}
