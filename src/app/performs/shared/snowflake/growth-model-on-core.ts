// Gravner & Griffeath Quadratic Lattice Model
// Based on paper: MODELING SNOW CRYSTAL GROWTH II: A mesoscopic lattice map with plausible dynamics
// @See Paper: http://psoup.math.wisc.edu/papers/h2l.pdf
// @See Website: http://psoup.math.wisc.edu/Snowfakes.htm

import { defineGrid, extendHex } from 'honeycomb-grid'
import {
  ISnowflakeSchema, SnowflakeHex,
  GROWTH_MODEL_MAX_GENERATION, UNIT_GRID_HEX_COUNT, DEFAULT_HEX_SIZE,
  BaseGrowthModel
} from './base'
import { randomChoice } from '../../../utils/random'

// Example Code:
// this.snowflakeGrowthModel = new SnowflakeGrowthModelOnGPU({
//   snowflakeInput: {
//     rowCells: 30,
//     hexSize: 5,
//     parameters: {
//       rho: 0.58,
//       beta: 2.0,
//       alpha: Math.random() * 0.3,
//       theta: Math.random() * 0.5595 + 0.02,
//       kappa: Math.random() * 0.05,
//       mu: Math.random() * 0.01,
//       gamma: 0.0000515,
//       sigma: 0
//     }
//   }
// })

export class SnowflakeGrowthModelOnCore extends BaseGrowthModel {

  initialize () {
    this.initGrid()

    const nextStatus = this.snowflakeData.generation >= GROWTH_MODEL_MAX_GENERATION
      ? 'completed'
      : 'ready'

    this.updateStatus(nextStatus)
  }

  private initGrid () {
    const NormalHexFactory = extendHex({
      size: this.snowflakeData.hexSize || DEFAULT_HEX_SIZE
    } as SnowflakeHex)
    const NormalGridFactory = defineGrid<SnowflakeHex>(NormalHexFactory)

    // Recover grid
    if (this.snowflakeData.entity.gridData) {
      const hexes = this.snowflakeData.entity.gridData
        .map(point => NormalHexFactory(point))
      this.grid = NormalGridFactory(hexes)
    } else {
      // Build new grid
      this.grid = NormalGridFactory.rectangle({
        width: this.snowflakeData.rowCells,
        height: this.snowflakeData.rowCells
      })

      // Fill hex with init state
      this.grid.map(hex => {
        hex.attached = false
        hex.diffusiveMass = this.snowflakeData.parameters.rho
        hex.boundaryMass = hex.crystalMass = 0
      })

      // Create ice seed
      const midPoint = Math.round(this.snowflakeData.rowCells / 2)
      const seedHex = this.grid.get([ midPoint, midPoint ])
      if (seedHex) {
        seedHex.attached = true
        seedHex.crystalMass = 1
        seedHex.diffusiveMass = 0
      }
    }
  }

  /**
   * Steps of growth in every generation:
   * 1. Diffusion
   * 2. Freezing
   * 3. Attachment
   * 4. Melting
   * 5. Noise (optional)
   */
  public growth (isAutomation?: boolean) {
    if (this.status !== 'growthing') {
      return
    }

    this.stepDiffusion()
    this.stepFreezing()
    this.stepAttachment()
    this.stepMelting()
    this.stepNoise()

    this.evolveGeneration()
    if (isAutomation) {
      this.growth()
    }
  }

  private stepDiffusion () {
    this.grid.map(hex => {
      const $isBoundary = this.isBoundaryHex(hex)
      if (!hex.attached && !$isBoundary) {
        hex.diffusiveMass = this.totalDiffusiveMass(hex) / UNIT_GRID_HEX_COUNT
      } else if ($isBoundary) {
        let totalDiffusiveMass = hex.diffusiveMass
        const neighbors = this.grid.neighborsOf(hex)
        neighbors.map(neighborHex => {
          totalDiffusiveMass += neighborHex.attached
            ? hex.diffusiveMass
            : neighborHex.diffusiveMass
        })
        hex.diffusiveMass = totalDiffusiveMass / UNIT_GRID_HEX_COUNT
      }
    })
  }

  private stepFreezing () {
    const { kappa } = this.snowflakeData.parameters

    this.grid.map(hex => {
      const $isBoundary = this.isBoundaryHex(hex)
      if ($isBoundary) {
        hex.boundaryMass = hex.boundaryMass + (1 - kappa) * hex.diffusiveMass
        hex.crystalMass = hex.crystalMass + kappa * hex.diffusiveMass
        hex.diffusiveMass = 0
      }
    })
  }

  private stepAttachment () {
    const { beta, alpha, theta } = this.snowflakeData.parameters

    this.grid.map(hex => {
      const countAttachedHex = this.countAttachedHexOfBoundaryHex(hex)

      if (countAttachedHex === 0) {
        return
      }

      // @Case A: A boundary site with 1 or 2 attached neighbors needs boundary
      // mass at least β to join the crystal:
      if (countAttachedHex <= 2 && hex.boundaryMass > beta) {
        hex.attached = true
      }
      // @Case B: A boundary site with 3 attached neighbors joins the crystal if either:
      if (countAttachedHex === 3) {
        // - it has boundary mass ≥ 1
        if (hex.boundaryMass >= 1) {
          hex.attached = true
        }
        // - it has diffusive mass < θ in its neighborhood and
        // it has boundary mass ≥ α:
        if (hex.boundaryMass > alpha && this.totalDiffusiveMass(hex) < theta) {
          hex.attached = true
        }
      }
      // @Case C: Finally, boundary sites with 4 or more attached neighbors join
      // the crystal automatically
      if (countAttachedHex >= 4) {
        hex.attached = true
      }
      // Once a site is attached, its boundary mass becomes crystal mass:
      if (hex.attached) {
        hex.crystalMass = hex.boundaryMass + hex.crystalMass
        hex.boundaryMass = 0
      }
    })
  }

  private stepMelting () {
    const { mu, gamma } = this.snowflakeData.parameters

    this.grid.map(hex => {
      const $isBoundary = this.isBoundaryHex(hex)
      if ($isBoundary) {
        // Proportion μ of the boundary mass and proportion γ of the crystal
        // mass at each boundary site become diffusive mass
        hex.boundaryMass = hex.boundaryMass * (1 - mu)
        hex.crystalMass = hex.crystalMass * (1 - gamma)
        hex.diffusiveMass = hex.diffusiveMass + hex.boundaryMass * mu + hex.crystalMass * gamma
      }
    })
  }

  /**
   * Make non-deterministic & non-symmetrical snowflake.
   * The diffusive mass at each site undergoes
   * an independent random perturbation.
   */
  private stepNoise () {
    const { sigma } = this.snowflakeData.parameters

    if (sigma === 0) {
      return
    }

    this.grid.map(hex => {
      if (!hex.attached) {
        const sigmaSign = randomChoice([ -1, 1 ])
        hex.diffusiveMass = hex.diffusiveMass * (1 + sigma * sigmaSign)
      }
    })
  }

  private totalDiffusiveMass (hex: SnowflakeHex): number {
    let totalMass = hex.diffusiveMass

    const neighbors = this.grid.neighborsOf(hex)
    neighbors.map(neighborHex => {
      totalMass += neighborHex.diffusiveMass
    })

    return totalMass
  }

  private countAttachedHexOfBoundaryHex (hex: SnowflakeHex): number {
    let countHex = 0

    const neighbors = this.grid.neighborsOf(hex)
    neighbors.map(neighborHex => {
      if (neighborHex.attached) {
        countHex += 1
      }
    })

    return countHex
  }

  private isBoundaryHex (hex: SnowflakeHex): boolean {
    let isBoundary = false

    if (hex.attached) {
      return isBoundary
    }

    const neighbors = this.grid.neighborsOf(hex)
    neighbors.some(neighborHex => {
      if (neighborHex.attached) {
        isBoundary = true
      }
      return neighborHex.attached
    })

    return isBoundary
  }

  private evolveGeneration () {
    this.snowflakeData.generation++
    const $hasNextGeneration = this.snowflakeData.generation <= GROWTH_MODEL_MAX_GENERATION

    if (!$hasNextGeneration) {
      this.updateStatus('completed')
    }
  }

}
