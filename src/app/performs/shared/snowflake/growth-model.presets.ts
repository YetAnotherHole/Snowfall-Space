import {
  IGrowthModelParameters
} from './base'

import { randomBetween } from '../../../utils/random'

interface IGrowthModelPresetsMap {
  [key: string]: IGrowthModelParameters
}

export const growthModelParametersPresetsMap = {

  default: {
    rho: 0.58 + randomBetween(-0.2, 0.3),
    beta: 1.51 + randomBetween(-0.5, 1.0),
    alpha: Math.random() * 0.3,
    theta: Math.random() * 0.5595 + 0.02,
    kappa: Math.random() * 2 * 0.05,
    mu: randomBetween(0.015, 0.012),
    gamma: randomBetween(0.000001, 0.0007),
    sigma: 0
  },

  fernlike: {
    rho: 0.635,
    beta: 1.6,
    alpha: 0.4,
    theta: 0.025,
    kappa: 0.005,
    mu: 0.015,
    gamma: 0.0005
  },

  stellarDendrite: {
    rho: 0.8,
    beta: 2.6,
    alpha: 0.004,
    theta: 0.001,
    kappa: 0.05,
    mu: 0.015,
    gamma: 0.0001
  },

  // fig9a
  sectoredPlate: {
    rho: 0.4,
    beta: 1.3,
    alpha: 0.08,
    theta: 0.025,
    kappa: 0.003,
    mu: 0.070,
    gamma: 0.00005
  },

  // fig15e
  sectoredSimple: {
    rho: 0.65,
    beta: 1.75,
    alpha: 0.2,
    theta: 0.026,
    kappa: 0.15,
    mu: 0.015,
    gamma: 0.00001
  },

  // fig14
  ribbedPlate: {
    rho: 0.37,
    beta: 1.09,
    alpha: 0.02,
    theta: 0.09,
    kappa: 0.003,
    mu: 0.12,
    gamma: 0.000001
  }

}
