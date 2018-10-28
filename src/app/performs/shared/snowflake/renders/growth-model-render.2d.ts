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

const growthVisualThemeMap = {
  gray: {
    index: 0
  },

  mono: {
    index: 1
  },

  ice: {
    index: 2
  },

  hyaline: {
    index: 3
  },

  fantasy: {
    index: 4
  }
}

// @TODO: Support responsive display & resize
// @TODO: Make width equal to height after transform
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
        vec2 coord = vec2(aTextureCoord.x, aTextureCoord.y);
        vTextureCoord = (textureTransformMatrix * vec3(coord, 1.0)).xy;
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`

const growthVisualFragmentShader = `
    uniform sampler2D snowflake;

    uniform int themeIndex;
    uniform float maxRho;
    uniform float maxBeta;
    uniform float curveBeta;

    varying vec2 vTextureCoord;

    vec4 blendScreen(vec4 src, vec4 dst) {
      return (src + dst) - (src * dst);
    }

    void main() {
        vec4 darkCrystal;
        vec4 lightCrystal;
        vec4 darkVapour;
        vec4 lightVapour;

        vec4 background = vec4(0.463, 0.584, 0.671, 1.0);
        darkVapour = vec4(0.00, 0.00, 0.00, 0.0);
        lightVapour = vec4(1.00, 1.00, 1.00, 0.0);

        if (themeIndex == 0) { // @theme: gray
          darkCrystal = vec4(0.75, 0.75, 0.75, 1.0);
          lightCrystal = vec4(1.00, 1.00, 1.00, 1.0);
        } else if (themeIndex == 1) { // @theme: mono
          darkCrystal = blendScreen(vec4(0.236, 0.295, 0.337, 1.0), background);
          lightCrystal = blendScreen(vec4(0.700, 0.834, 0.952, 1.0), background);
        } else if (themeIndex == 2) { // @theme: ice
          darkCrystal = blendScreen(vec4(0.017, 0.595, 1.000, 1.0), background);
          lightCrystal = blendScreen(vec4(0.700, 0.876, 1.000, 1.0), background);
        } else if (themeIndex == 3) { // @theme: hyaline
          darkCrystal = vec4(0.270, 0.339, 0.386, 1.0);
          lightCrystal = vec4(0.606, 0.759, 0.866, 1.0);
        } else if (themeIndex == 4) { // @theme: fantasy
          darkCrystal = vec4(1.000, 0.846, 0.705, 1.0);
          lightCrystal = vec4(0.491, 0.420, 0.600, 1.0);
        }

        vec4 cell = texture2D(snowflake, vTextureCoord);
        float percent = 0.0;

        if (bool(cell.a)) {
            // Inside snowflake
            if (themeIndex == 3) { // @theme: hyaline
              // @type: Outline
              // if (cell.g > maxBeta) {
              //   percent = pow(cell.g / 10.0, curveBeta);
              //   gl_FragColor = vec4(lightCrystal.rgb, percent);
              // } else if (cell.g < maxBeta / 3.0) {
              //   percent = pow(cell.g / 2.0, curveBeta);
              //   gl_FragColor = mix(lightCrystal, darkCrystal, percent);
              // }

              // @type: Crystal
              // @TODO: Make crystal relief
              if (cell.g > maxBeta * 1.05) {
                percent = pow(cell.g / 10.0, curveBeta);
                vec4 mixColor = mix(darkCrystal, lightCrystal, percent);
                gl_FragColor = vec4(mixColor.rgb, vTextureCoord.x * 0.5);
              } else {
                percent = pow(cell.g / 5.0, curveBeta);
                vec4 mixColor = mix(lightCrystal, darkCrystal, vTextureCoord.x * percent);
                if (percent > 0.2) {
                  gl_FragColor = mixColor;
                }
              }
            } else if (themeIndex == 4) { // @theme: fantasy
              if (cell.g > maxBeta / 1.3) {
                percent = vTextureCoord.x;
                percent = smoothstep(0.0, 1.0, clamp(percent, 0.0, 1.0));
                gl_FragColor = mix(lightCrystal, darkCrystal, percent);
              }
            } else {
              if (cell.g > maxBeta / 5.0) {
                percent = pow(cell.g / maxBeta, curveBeta);
                gl_FragColor = mix(lightCrystal, darkCrystal, percent);
              }
            }
        } else {
            // Outside snowflake, vapor or liquid
            percent = cell.r / maxRho;
            if (themeIndex == 3 && cell.b > 0.0) {
              gl_FragColor = vec4(darkCrystal.rgb, percent);
            } else {
              gl_FragColor = mix(lightVapour, darkVapour, percent);
            }
        }
    }
`

interface IGrowthVisualFilterUniform {
  [key: string]: any
  themeIndex: number
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

class $$GrowthControlPanel extends $$Base<{}> {

  setup () {
    // @TOOD:
    // - Util: convert the natural parameters to the model parameters
  }

}

export class $$GrowthModel2DRender extends $$Base<IGrowthModel2DRenderOptions> {
  $growthVisual: PIXI.Sprite
  shader: PIXI.Filter<IGrowthVisualFilterUniform>

  size: number
  width: number
  height: number
  centerSize: number

  setup (options: IGrowthModel2DRenderOptions) {
    const { growthModel } = this.options

    this.$object = new PIXI.Container()
    // this.$object.scale.x = 2
    // this.$object.scale.y = 2
    this.$growthVisual = new PIXI.Sprite()

    this.size = growthModel.snowflakeData.rowCells

    this.width = this.size // window.innerWidth
    this.height = this.size // window.innerHeight
    this.centerSize = Math.round(this.width / 2)

    this.$object.pivot.x = this.width / 2
    this.$object.pivot.y = this.height / 2

    this.setupGrowthVisual()
    if (!ENABLE_VISUAL) {
      this.$object.addChild(growthModel.$computation)
    }
  }

  setupGrowthVisual () {
    const { growthModel } = this.options
    const { rho, beta } = growthModel.snowflakeData.parameters

    const theme = growthVisualThemeMap[ growthModel.snowflakeData.theme || 'gray']

    this.shader = new GrowthVisualFilter({
      themeIndex: theme.index,
      maxRho: rho,
      maxBeta: beta + 0.1,
      curveBeta: 1.1 // 1.7
    })

    this.$growthVisual.texture = growthModel.renderTexture
    this.$growthVisual.filters = [ this.shader ]

    if (ENABLE_VISUAL) {
      this.$object.addChild(this.$growthVisual)
    }
  }

  updateVisualUniformByTheme () {
    const { growthModel } = this.options
    const theme = growthVisualThemeMap[growthModel.snowflakeData.theme]
    this.shader.uniforms.themeIndex = theme.index
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
