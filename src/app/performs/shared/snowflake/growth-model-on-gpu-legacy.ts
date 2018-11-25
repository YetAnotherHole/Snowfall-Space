// Yet Another Gravner & Griffeath Quadratic Lattice Model
// But based on GPU
// @REF: https://github.com/richardcooper/snowflakes
// @TODO: Optimize FPS for growthing a snowflake within an opus period

import * as PIXI from 'pixi.js'
import {
  GROWTH_MODEL_MAX_GENERATION,
  IGrowthModelParameters,
  BaseGrowthModel
} from './base'

const snowflakeComputationVertexShader = `
    attribute vec2 aTextureCoord;
    attribute vec2 aVertexPosition;

    varying vec2 centrePos;
    varying vec2 northWestPos;
    varying vec2 northEastPos;
    varying vec2 eastPos;
    varying vec2 southEastPos;
    varying vec2 southWestPos;
    varying vec2 westPos;

    varying vec2 vTextureCoord;

    uniform mat3 projectionMatrix;
    uniform float size;

    void main() {
        vec2 widthStep = vec2(1.0/size, 0.0);
        // @Wraning: The y axis is flipped
        // @REF: http://www.pouet.net/topic.php?which=8966
        vec2 heightStep = vec2(0.0, 1.0/size);

        float flippedY = projectionMatrix[1][1] < 0.0 ? 1.0 : 0.0;

        vec2 coord = vec2(aTextureCoord.x, flippedY > 0.0 ? 1.0 - aTextureCoord.y : aTextureCoord.y);
        vTextureCoord = coord;

        centrePos = coord;
        northWestPos = coord + heightStep - widthStep;
        northEastPos = coord + heightStep;
        eastPos = coord + widthStep;
        southEastPos = coord - heightStep + widthStep;
        southWestPos = coord - heightStep;
        westPos = coord - widthStep;

        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`

const snowflakeComputationFragmentShader = `
    precision highp float;

    varying vec2 centrePos;
    varying vec2 northWestPos;
    varying vec2 northEastPos;
    varying vec2 eastPos;
    varying vec2 southEastPos;
    varying vec2 southWestPos;
    varying vec2 westPos;

    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform sampler2D snowflake;
    uniform mat3 mappedMatrix;
    uniform vec4 filterArea;
    uniform float size;

    uniform float rho;
    uniform float beta;
    uniform float alpha;
    uniform float theta;
    uniform float kappa;
    uniform float mu;
    uniform float gamma;
    uniform float sigma;

    uniform int step;
    uniform int generation;

    const float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio
    const float PI  = 3.14159265358979323846264 * 00000.1; // PI
    const float SQ2 = 1.41421356237309504880169 * 10000.0; // Square Root of Two

    float gold_noise(vec2 coordinate, float seed){
        return fract(tan(distance(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);
    }

    float rand(vec2 co){
        return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    bool isBoundaryHex(vec4 cell, vec4 n[6]) {
       if (cell.a > 0.0) {
         return true;
       }
       return n[0].a + n[1].a + n[2].a + n[3].a + n[4].a + n[5].a > 0.0;
    }

    float countAttachedHexOfBoundaryHex(vec4 cell, vec4 n[6]) {
      float countHex = 0.0;

      for(int i=0; i<6; i++) {
        if (n[i].a > 0.0) {
          countHex += 1.0;
        }
      }

      return countHex;
    }

    highp float neighbourCount(vec4 cell, vec4 n[6]) {
        return max(countAttachedHexOfBoundaryHex(cell, n), 0.0);
    }

    highp vec4 diffusion(vec4 cell, vec4 n[6]) {
        float totalMass = cell.r;
        bool isBoundary = isBoundaryHex(cell, n);

        // 1. Diffusion
        if (!isBoundary && cell.a == 0.0) {
          for(int i=0; i<6; i++) {
            totalMass += n[i].r;
          }
          cell.r = totalMass/7.0;
        }

        if (isBoundary) {
          for(int i=0; i<6; i++) {
            totalMass += n[i].a > 0.0 ? cell.r : n[i].r;
          }
          cell.r = totalMass/7.0;
        }

        // float neighbourCount = neighbourCount(cell, n);
        // cell.r = ((n[0].r+n[1].r+n[2].r+n[3].r+n[4].r+n[5].r+cell.r)/7.0)*(1.0-cell.a) + neighbourCount*cell.r/7.0;

        return cell;
    }

    vec4 freezing(vec4 cell, vec4 n[6]) {
        // 2. Freezing
        if (isBoundaryHex(cell, n)) {
            cell.b += cell.r * (1.0-kappa);
            cell.g += cell.r * kappa;
            cell.r = 0.0;
        }

        return cell;
    }

    vec4 attachment(vec4 cell, vec4 n[6]) {
        // 3. Attachment
        float attachedHexCount = countAttachedHexOfBoundaryHex(cell, n);

        if (attachedHexCount == 0.0) {
          return cell;
        }

        // (3a)  - A boundary site with 1 or 2 attached neighbors needs boundary
        // mass at least β to join the crystal:
        if (attachedHexCount <= 2.0 && cell.b >= beta) {
          cell.a = 1.0;
        }

        // (3b) A boundary site with 3 attached neighbors joins the crystal if
        // either:
        //  - it has boundary mass ≥ 1, or
        if (attachedHexCount == 3.0) {
          // - it has boundary mass ≥ 1
          if (cell.b >= 1.0) {
            cell.a = 1.0;
          }
          // - it has diffusive mass < θ in its neighborhood and
          // it has boundary mass ≥ α:
          float nearbyVapour = n[0].r+n[1].r+n[2].r+n[3].r+n[4].r+n[5].r;
          if (cell.b >= alpha && nearbyVapour < theta) {
            cell.a = 1.0;
          }
        }

        // (3c) Finally, boundary sites with 4 or more attached neighbors join
        // the crystal automatically
        if (attachedHexCount >= 4.0) {
          cell.a = 1.0;
        }

        // Once a site is attached, its boundary mass becomes crystal mass:
        if (cell.a > 0.0) {
          cell.g += cell.b;
          cell.b = 0.0;
        }

        return cell;
    }

    vec4 melting(vec4 cell, vec4 n[6]) {
        // 4. Melting
        // Proportion μ of the boundary mass and proportion γ of the crystal
        // mass at each boundary site become diffusive mass.
        if (isBoundaryHex(cell, n)) {
            cell.r += (cell.b * mu + cell.g * gamma);
            cell.b -= cell.b * mu;
            cell.g -= cell.g * gamma;
        }

        return cell;
    }

    vec4 noise(vec4 cell, vec4 n[6]) {
        float sigmaSign = rand(vTextureCoord) > 0.5 ? 1.0 : -1.0;
        cell.r = cell.r * (1.0 + sigma * sigmaSign);

        return cell;
    }

    // @TODO: Init data via texture
    vec4 initVapor(vec4 cell) {
      cell.r = rho;
      // if (vTextureCoord.x > 0.4) {
      if (cell.a > 0.0 && cell.r != 0.0) {
        cell.r = 0.0;
        cell.g = 1.0;
        cell.a = 1.0;
      }
      return cell;
    }

    void main() {
        vec4 cell;
        vec4 n[6];

        // vec2 coord = vTextureCoord * filterArea.xy / vec2(size, size);
        // vec2 coord = (vec3(vTextureCoord, 1.0) * mappedMatrix).xy;

        cell = texture2D(uSampler, centrePos);

        if (generation <= 1) {
          cell = initVapor(cell);
          gl_FragColor = cell;
        } else {
          n[0] = texture2D(uSampler, northWestPos);
          n[1] = texture2D(uSampler, northEastPos);
          n[2] = texture2D(uSampler, eastPos);
          n[3] = texture2D(uSampler, southEastPos);
          n[4] = texture2D(uSampler, southWestPos);
          n[5] = texture2D(uSampler, westPos);

          //float d = cell.r; // diffuse (vapor) mass
          //float c = cell.g; // crystal (ice) mass
          //float b = cell.b; // boundary (water) mass
          //float a = cell.a; // attachment (actually a bool but more convient to leave as an float for multiplications)

          // cell = diffusion(cell, n);
          // cell = freezing(cell, n);
          // cell = attachment(cell, n);
          // cell = noise(cell, n);
          // gl_FragColor = cell;

          if (step==1) {
              cell = diffusion(cell, n);
              // cell.b -= 0.01;
              // cell.g += 0.01;
              gl_FragColor = freezing(cell, n);
          } else if (step==2) {
              gl_FragColor = attachment(cell, n);
          } else if (step==3) {
              cell = melting(cell, n);
              gl_FragColor = sigma != 0.0 ? noise(cell, n) : cell;
          } else {
            gl_FragColor = cell;
          }
        }

        // Map coord to color for debugging
        // gl_FragColor = vec4(vTextureCoord, 0.0, 1.0);

        // vec4 vDefineColor;

        // if (centrePos.x > 0.5) {
        //   vDefineColor = vec4(0.0, 0.0, 0.0, 0.3);

        //   if (centrePos.y > 0.5) {
        //     vDefineColor = vec4(0.0, 0.0, 0.0, 0.6);
        //   }
        // } else {
        //   vDefineColor = vec4(0.0, 0.0, 0.0, 1.0);
        // }

        // gl_FragColor = vDefineColor;
    }
`

interface IFilterUniform extends IGrowthModelParameters {
  resolution?: number[],
  step?: number,
  generation?: number
}

class SnowflakeGrowthModelFilter extends PIXI.Filter<IFilterUniform> {

  constructor (options: IFilterUniform) {
    super(snowflakeComputationVertexShader, snowflakeComputationFragmentShader)

    Object.keys(options).map(uniform => {
      this.uniforms[uniform] = options[uniform]
    })

    this.uniforms.resolution = [
      options['size'],
      options['size']
    ]

    this.uniforms.snowflake = {
      type: 'sampler2d',
      value: null
    }

    if (!this.uniforms.sigma) {
      this.uniforms.sigma = 0.0
    }

    this.uniforms.mappedMatrix = new PIXI.Matrix()

    this.uniforms.generation = 0
  }

  apply (
    filterManager: PIXI.FilterManager,
    input: PIXI.RenderTarget,
    output: PIXI.RenderTarget
  ) {
    this.uniforms.mappedMatrix = filterManager.calculateNormalizedScreenSpaceMatrix(this.uniforms.mappedMatrix)
    filterManager.applyFilter(this, input, output)
  }

}

export class SnowflakeGrowthModelOnGPU extends BaseGrowthModel {
  $computation: PIXI.Container
  shader: SnowflakeGrowthModelFilter
  step: number

  initialize () {
    this.shader = new SnowflakeGrowthModelFilter({
      ...this.options.snowflakeInput.parameters,
      size: this.options.snowflakeInput.rowCells
    })
    this.step = 0
  }

  growth () {
    if (this.status !== 'growthing') {
      this.shader.enabled = false
      return
    }

    this.shader.enabled = true

    this.step++

    if (this.step > 3) {
      this.step = 1
      this.evolveGeneration()
      this.shader.uniforms.generation = this.snowflakeData.generation
    }

    this.shader.uniforms.step = this.step
  }

}
