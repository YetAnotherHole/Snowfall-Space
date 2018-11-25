import { BaseConductor } from '../shared'

interface IOnMountOptions {
  sceneName?: string
  snowflakeId?: string
}

class CoreSpaceConductor extends BaseConductor {

  setup () {
  }

  onmount (options: IOnMountOptions = {}) {

  }

  update () {

  }

}

export const coreSpaceConductor = new CoreSpaceConductor()
