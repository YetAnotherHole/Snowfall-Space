import { Grid, Hex } from 'honeycomb-grid'

// The Parameters ordered by the paper
export interface IGrowthModelParameters {
  [key: string]: number | any
  rho: number // ρ, Initial vapor density
  // For Attachment
  beta: number // β, Anisotropy of attachment [1.05, 3] - how much harder it is to freeze to a mesoscopically protruding or flat chunk of boundary than in a valley
  alpha: number // α
  theta: number // θ
  // For Freezing
  kappa: number // κ, crystallization
  // For Melting
  mu: number // µ
  gamma: number // γ
  // For Noise
  sigma?: number // σ, Noise
}

interface IGrowthModelHexState {
  attached: boolean
  crystalMass: number // Ice
  boundaryMass: number // Liquid
  diffusiveMass: number // Vapor
}

interface ISnowflakeEntity {
  imageUrl?: string
  gridData?: Hex<SnowflakeHex>[]
}

interface IGrowthModelEnv {
  // Env
  rowCells: number // Lattice map size [ 400, 700 ]
  hexSize?: number // Hex wedge size
  parameters: IGrowthModelParameters
}

export interface ISnowflakeSchema extends IGrowthModelEnv {
  // Generated
  generation: number // Iteration steps
  classification: string
  entity: ISnowflakeEntity
}

interface SnowflakeGrowthModelOptions {
  renderer: PIXI.WebGLRenderer
  snowflakeInput: IGrowthModelEnv | ISnowflakeSchema
}

export type SnowflakeHex = Hex<IGrowthModelHexState>
export type SnowflakeGrowthStatus = 'ready' | 'growthing' | 'completed'

export const UNIT_GRID_HEX_COUNT = 7
export const GROWTH_MODEL_MAX_GENERATION = 15000
export const DEFAULT_HEX_SIZE = 5

export abstract class BaseGrowthModel {
  protected options: SnowflakeGrowthModelOptions
  public status: SnowflakeGrowthStatus
  public grid: Grid<SnowflakeHex>
  public snowflakeData: ISnowflakeSchema

  constructor (options: SnowflakeGrowthModelOptions) {
    this.options = options

    const snowflakeInput = this.options.snowflakeInput as ISnowflakeSchema
    if (snowflakeInput.generation) {
      this.snowflakeData = snowflakeInput
    } else {
      this.snowflakeData = {
        ...snowflakeInput,
        generation: 0,
        classification: 'TODO',
        entity: {}
      }
    }

    this.initialize()
  }

  abstract initialize (): void
  abstract growth (): void
  // Optional abstract
  computedImageUrl? (): string
  computedGridData? (): Hex<SnowflakeHex>[]

  public updateStatus (nextStatus: SnowflakeGrowthStatus) {
    if (nextStatus === this.status) {
      return
    }

    this.status = nextStatus

    // @TODO: Trigger some function
    if (this.status === 'growthing') {
      this.growth()
    }
  }

  public generateSnowflakeDataEntity (): ISnowflakeSchema {
    if (this.computedImageUrl) {
      this.snowflakeData.entity.imageUrl = this.computedImageUrl()
    }

    if (this.computedGridData) {
      this.snowflakeData.entity.gridData = this.computedGridData()
    }

    return this.snowflakeData
  }

  protected evolveGeneration () {
    const $hasNextGeneration = this.snowflakeData.generation < GROWTH_MODEL_MAX_GENERATION

    if (!$hasNextGeneration) {
      return this.updateStatus('completed')
    }

    this.snowflakeData.generation++
  }

}
