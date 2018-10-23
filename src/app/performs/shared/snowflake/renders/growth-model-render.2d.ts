import * as PIXI from 'pixi.js'
import Color from 'color'
import { SnowflakeGrowthModelOnGPU } from '../growth-model-on-gpu'
import { $$Base } from '../../base-class'
import { COLORS } from '../../../../utils/constants'

interface IGrowthModel2DRenderOptions {
  growthModel: SnowflakeGrowthModelOnGPU
  renderer: PIXI.WebGLRenderer
}

const ENABLE_VISUAL = true

const growthVisualVertexShader = `
    attribute vec2 aTextureCoord;
    attribute vec2 aVertexPosition;

    uniform mat3 projectionMatrix;

    varying vec2 vTextureCoord;

    const mat3 shear = mat3(
        1.0, 0.0, 0.0,
        -0.5, 1.0, 0.0,
        0.0, 0.0, 1.0
    );
    const mat3 squash = mat3(
        1.0,           0.0, 0.0,
        0.0, 2.0/sqrt(3.0), 0.0,
        0.0,           0.0, 1.0
    );
    const mat3 translate = mat3(
        1.0,                      0.0, 0.0,
        0.0,                      1.0, 0.0,
        0.25, (1.0-2.0/sqrt(3.0))/2.0, 1.0
    );
    const mat3 textureTransformMatrix = shear * squash * translate;

    void main() {
        vec2 coord = vec2(aTextureCoord.x, 1.0 - aTextureCoord.y);
        vTextureCoord = (textureTransformMatrix * vec3(coord, 1.0)).xy;
        // vTextureCoord = aTextureCoord;
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`

const growthVisualFragmentShader = `
    uniform sampler2D snowflake;

    uniform float maxRho;
    uniform float maxBeta;
    uniform float curveBeta;

    varying vec2 vTextureCoord;

    // const vec4 darkCrystal = vec4(0.05, 0.15, 0.55, 1.0);
    // const vec4 lightCrystal = vec4(0.80, 1.00, 1.00, 1.0);
    // const vec4 darkVapour = vec4(0.00, 0.00, 0.00, 0.0);
    // const vec4 lightVapour = vec4(1.00, 1.00, 1.00, 0.0);

    const vec4 darkCrystal = vec4(0.70, 0.70, 0.70, 1.0);
    const vec4 lightCrystal = vec4(1.00, 1.00, 1.00, 1.0);
    const vec4 darkVapour = vec4(0.318, 0.435, 0.518, 0.0);
    const vec4 lightVapour = vec4(0.525, 0.631, 0.71, 0.0);

    void main() {
        vec4 cell = texture2D(snowflake, vTextureCoord);
        float percent = 0.0;

        if (bool(cell.a)) {
            // Inside snowflake
            percent = pow(cell.g / maxBeta, curveBeta);
            gl_FragColor = mix(lightCrystal, darkCrystal, percent);
        } else {
            // Outside snowflake
            percent = cell.r / maxRho;
            gl_FragColor = mix(lightVapour, darkVapour, percent);
        }
    }
`

interface IGrowthVisualFilterUniform {
  [key: string]: any
  maxRho: number
  maxBeta: number
  curveBeta: number
}

class GrowthVisualFilter extends PIXI.Filter<IGrowthVisualFilterUniform> {

  constructor (options: IGrowthVisualFilterUniform) {
    super(growthVisualVertexShader, growthVisualFragmentShader)

    Object.keys(options).map(uniform => {
      this.uniforms[uniform] = options[uniform]
    })
  }

}

export class $$GrowthModel2DRender extends $$Base<IGrowthModel2DRenderOptions> {
  $growthVisual: PIXI.Sprite

  size: number
  width: number
  height: number
  centerSize: number

  setup (options: IGrowthModel2DRenderOptions) {
    const { growthModel } = this.options

    this.$object = new PIXI.Container()
    this.$growthVisual = new PIXI.Sprite()

    this.size = growthModel.snowflakeData.rowCells

    this.width = this.size // window.innerWidth
    this.height = this.size // window.innerHeight
    this.centerSize = Math.round(this.width / 2)

    this.$object.pivot.x = this.width / 2
    this.$object.pivot.y = this.height / 2

    if (ENABLE_VISUAL) {
      this.setupGrowthVisual()
    } else {
      this.$object.addChild(growthModel.$computation)
    }
  }

  setupGrowthVisual () {
    const { growthModel } = this.options
    const { rho, beta } = growthModel.snowflakeData.parameters

    const filter = new GrowthVisualFilter({
      maxRho: rho,
      maxBeta: beta + 0.1,
      curveBeta: 1.7
    })

    this.$growthVisual.texture = growthModel.renderTexture
    this.$growthVisual.filters = [ filter ]

    this.$object.addChild(this.$growthVisual)
  }

  onresize (screenWidth: number, screenHeight: number) {
    this.$object.x = screenWidth / 2
    this.$object.y = screenHeight / 2
  }

  update () {
    const { growthModel, renderer } = this.options

    if (growthModel.$sprite) {
      growthModel.growth()
    }

    this.$growthVisual.texture = growthModel.renderTexture

    this.draw()
  }

  draw () {
    this.drawGrowthVisual()
  }

  drawGrowthVisual () {
    // @TODO
  }

}
