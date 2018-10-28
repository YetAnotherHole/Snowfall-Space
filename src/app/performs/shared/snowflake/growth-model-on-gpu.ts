// Yet Another Gravner & Griffeath Quadratic Lattice Model
// But based on the GPU
// @TODO: Optimize FPS for growthing a snowflake within a opus period

import * as PIXI from 'pixi.js'
import {
  GROWTH_MODEL_MAX_GENERATION,
  IGrowthModelParameters,
  BaseGrowthModel
} from './base'

import {
  ShaperSprite,
  createShaderPlugin,
  createShaderPluginSprite
} from '../../../utils/shader'

const snowflakeComputationVertexShader = `
    attribute vec2 aTextureCoord;
    attribute vec2 aVertexPosition;

    varying vec2 centrePos;
    varying vec2 n0;
    varying vec2 n1;
    varying vec2 n2;
    varying vec2 n3;
    varying vec2 n4;
    varying vec2 n5;

    varying vec2 vTextureCoord;

    uniform vec2 resolution;
    uniform mat3 projectionMatrix;
    uniform float size;

    void main() {
        vec2 widthStep = vec2(1.0/size, 0.0);
        vec2 heightStep = vec2(0.0, 1.0/size);

        // @Wraning: The y axis is flipped
        // @REF: http://www.pouet.net/topic.php?which=8966
        vec2 coord = vec2(aTextureCoord.x, aTextureCoord.y);
        vTextureCoord = coord;

        // centrePos = coord;
        // n1 = coord + widthStep;
        // northEastPos = coord + widthStep + heightStep;
        // eastPos = coord - heightStep;
        // southEastPos = coord - heightStep;
        // southWestPos = coord - widthStep - heightStep;
        // westPos = coord + heightStep;

        centrePos = coord;
        n0 = coord - heightStep + widthStep;
        n1 = coord - heightStep;
        n2 = coord - widthStep;
        n3 = coord + heightStep - widthStep;
        n4 = coord + heightStep;
        n5 = coord + widthStep;

        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`

const snowflakeComputationFragmentShader = `
    precision highp float;

    varying vec2 centrePos;
    varying vec2 n0;
    varying vec2 n1;
    varying vec2 n2;
    varying vec2 n3;
    varying vec2 n4;
    varying vec2 n5;

    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform mat3 mappedMatrix;
    uniform float size;
    uniform float uTime;

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

    vec4 diffusion(vec4 cell, vec4 n[6]) {
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

        cell = texture2D(uSampler, centrePos);

        if (generation <= 1) {
          cell = initVapor(cell);
          gl_FragColor = cell;
        } else {
          n[0] = texture2D(uSampler, n0);
          n[1] = texture2D(uSampler, n1);
          n[2] = texture2D(uSampler, n2);
          n[3] = texture2D(uSampler, n3);
          n[4] = texture2D(uSampler, n4);
          n[5] = texture2D(uSampler, n5);

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
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.6);
          }
        }

        // Map coord to color for debugging
        // gl_FragColor = vec4(1.0, gold_noise(vTextureCoord, uTime), 0.0, 1.0);
        // gl_FragColor = texture2D(uSampler, centrePos);

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

interface ISpriteUniform extends IGrowthModelParameters {
  size?: number,
  step?: number,
  generation?: number
}

export class SnowflakeGrowthModelOnGPU extends BaseGrowthModel {
  $computation: PIXI.Container
  $sprite: ShaperSprite<ISpriteUniform>
  renderTexture: PIXI.RenderTexture
  renderTexture2: PIXI.RenderTexture
  step: number
  size: number

  initialize () {
    this.setupRenderPlugin()
    this.setupGrowthComputation()
  }

  setupRenderPlugin () {
    const { renderer } = this.options

    this.size = this.options.snowflakeInput.rowCells

    const uniforms = {
      ...this.options.snowflakeInput.parameters,
      size: this.size
    }

    createShaderPlugin(
      'snowflakeGrowthModel',
      snowflakeComputationVertexShader,
      snowflakeComputationFragmentShader,
      uniforms,
      renderer
    )

    this.$sprite = createShaderPluginSprite(
      'snowflakeGrowthModel',
      new PIXI.Point(this.size, this.size),
      uniforms
    )

    this.step = 0
  }

  setupGrowthComputation () {
    const { renderer } = this.options
    const { rho } = this.snowflakeData.parameters
    const { gl } = renderer

    if (this.$computation) {
      this.$computation.removeChildren()
    } else {
      this.$computation = new PIXI.Container()
    }

    const textureResolution = 2 || window.devicePixelRatio
    const textureArgs = [ this.size, this.size, PIXI.SCALE_MODES.NEAREST, textureResolution ]

    this.renderTexture = PIXI.RenderTexture.create(...textureArgs)
    this.renderTexture2 = PIXI.RenderTexture.create(...textureArgs)

    const $initData = new PIXI.Graphics()
    $initData
      .beginFill(0x000000, 0)
      .drawRect(0, 0, this.size, this.size)
      .endFill()
    $initData
      .beginFill(0x00FF00)
      .drawRect(this.size / 2, this.size / 2, 1, 1)
      .endFill()

    // @TODO: Generate data texture as baseTexture source
    // const initData = new Float32Array(4 * this.size * this.size)

    // for (var i = 0; i < initData.length; i += 4) {
    //   initData[i] = rho
    //   initData[i + 1] = 0.0
    //   initData[i + 2] = 0.0
    //   initData[i + 3] = 0.0
    // }

    // const iceSeed = (this.centerSize * this.size + this.centerSize) * 4
    // initData[iceSeed] = 0.0
    // initData[iceSeed + 1] = 1.0
    // initData[iceSeed + 2] = 0.0
    // initData[iceSeed + 3] = 1.0

    // const initDataFrameBuffer = PIXI.glCore.GLFramebuffer.createFloat32(
    //   renderer.gl,
    //   this.size,
    //   this.size,
    //   initData
    // )

    this.$sprite.addChild($initData)
    this.$computation.addChild(this.$sprite)

    // setInterval(() => {
    //   if (this.$growthComputationSprite.children.length) {
    //     this.$growthComputationSprite.removeChildren()
    //   }
    //   const pixels = renderer.extract.pixels(this.renderTexture2)
    //   console.log(pixels.slice(this.centerSize * this.centerSize * 4))
    // }, 2000)

    // console.log(renderer, this.renderTexture)
  }

  extractComputationPixels () {
    const { renderer } = this.options

    return renderer.extract.pixels(this.$computation)
  }

  reset () {
    this.snowflakeData.generation = 0
    this.setupRenderPlugin()
    this.setupGrowthComputation()
  }

  growth () {
    const { renderer } = this.options

    if (this.status !== 'growthing') {
      return
    }

    if (this.$sprite.pluginUniforms.generation > 1) {
      this.$sprite.removeChildren()
    }

    this.step++

    if (this.step > 3) {
      this.step = 1
      this.$sprite.pluginUniforms.generation = this.snowflakeData.generation
      this.evolveGeneration()
    }

    this.$sprite.pluginUniforms.step = this.step

    // Swap the buffers
    const temp = this.renderTexture
    this.renderTexture = this.renderTexture2
    this.renderTexture2 = temp

    // set the new texture
    this.$sprite.texture = this.renderTexture

    // render the growthComputation to the texture
    // the 'true' clears the texture before the content is rendered
    renderer.render(this.$computation, this.renderTexture2)
  }

}
