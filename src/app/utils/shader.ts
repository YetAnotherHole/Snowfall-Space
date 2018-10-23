import * as PIXI from 'pixi.js'

/*!
* createShaderPlugin.js - v1.0.1
* @REF: https://github.com/magig/createShaderPlugin
*/
export const createShaderPlugin = (
  name: string,
  vertShader: string,
  fragShader: string,
  uniformDefaults: any,
  renderer: PIXI.WebGLRenderer
) => {

  class ShaderPlugin extends PIXI.ObjectRenderer {
    vertShader: string
    fragShader: string
    uniformDefaults: any
    shader: PIXI.Shader
    quad: PIXI.Quad
    _tempClamp: any
    _tempColor: any
    _tintAlpha: any

    constructor (_renderer: PIXI.WebGLRenderer) {
      super(_renderer)

      if (!vertShader) {
        this.vertShader = [
          '#define GLSLIFY 1',

          'attribute vec2 aVertexPosition;',
          'attribute vec2 aTextureCoord;',

          'uniform mat3 projectionMatrix;',

          'varying vec2 vTextureCoord;',

          'void main(void) {',
              'gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
              'vTextureCoord = aTextureCoord;',
          '}'
        ].join('\n')
      } else {
        this.vertShader = '#define GLSLIFY 1\n' + vertShader
      }

      this.fragShader = '#define GLSLIFY 1\n' + fragShader
      this.uniformDefaults = uniformDefaults

      this._tempClamp = new Float32Array(4)
      this._tempColor = new Float32Array(4)
      this._tintAlpha = new Float32Array(4)
    }

    _initShader () {
      const gl = this.renderer.gl

      const shader = this.shader = new PIXI.Shader(gl, this.vertShader, this.fragShader)
      if (this.uniformDefaults) {
        shader.bind()
        let uniformDefaults = this.uniformDefaults
        let shaderUniforms = shader.uniforms
        for (let key in uniformDefaults) {
          shaderUniforms[key] = uniformDefaults[key]
        }
      }

      this.quad = new PIXI.Quad(gl)
      this.quad.initVao(shader)
    }

    onContextChange () {
      this._initShader()
    }

    start () {
      if (!this.shader) {
        this._initShader()
      }
    }

    destroy () {
      super.destroy()
      if (this.shader) {
        this.shader.destroy()
        this.shader = null
      }

      if (this.quad) {
        this.quad.destroy()
        this.quad = null
      }
    }

    render (sprite: PIXI.Sprite) {
      if (!sprite.texture.valid) {
        return
      }

      // setup
      const shader = this.shader
      const renderer = this.renderer

      renderer.bindShader(shader)
      renderer.state.setBlendMode(sprite.blendMode)

      const quad = this.quad
      renderer.bindVao(quad.vao)
      const uvs = sprite.texture._uvs

      // sprite already has calculated the vertices. lets transfer them to quad
      const vertices = quad.vertices
      for (let i = 0; i < 8; i++) {
        quad.vertices[i] = sprite.vertexData[i]
      }

      // SpriteRenderer works differently, with uint32 UVS
      // but for our demo float uvs are just fine
      quad.uvs[0] = uvs.x0
      quad.uvs[1] = uvs.y0
      quad.uvs[2] = uvs.x1
      quad.uvs[3] = uvs.y1
      quad.uvs[4] = uvs.x2
      quad.uvs[5] = uvs.y2
      quad.uvs[6] = uvs.x3
      quad.uvs[7] = uvs.y3

      // @TODO: add baricentric coords here
      quad.upload()

      const frame = sprite.texture.frame
      const base = sprite.texture.baseTexture
      const clamp = this._tempClamp

      // clamping 0 pixel from left-top side and 1 from top-bottom to reduce border artifact
      // this is our plugin main purpose
      clamp[0] = frame.x / base.width
      clamp[1] = frame.y / base.height
      clamp[2] = (frame.x + frame.width) / base.width - 1.0 / base.realWidth
      clamp[3] = (frame.y + frame.height) / base.height - 1.0 / base.realWidth
      // take a notice that size in pixels is realWidth,realHeight
      // width and height are divided by resolution
      shader.uniforms.uTextureClamp = clamp

      // handle tint and worldAlpha
      const color = this._tempColor
      PIXI.utils.hex2rgb(sprite.tint, color)
      const alpha = sprite.worldAlpha
      // premultiplied alpha tint
      // of course we could do that in shader too
      color[0] *= alpha
      color[1] *= alpha
      color[2] *= alpha
      color[3] = alpha
      shader.uniforms.uColor = color

      // copy uniforms from sprite to shader
      const spriteUniforms = sprite.pluginUniforms
      const shaderUniforms = shader.uniforms
      if (spriteUniforms) {
        for (const key in spriteUniforms) {
          shaderUniforms[key] = spriteUniforms[key]
        }
      }

      // there are two ways of binding a texture in pixi-v4
      // force texture in unit 0
      // renderer.bindTexture(base, 0, true);

      // "SMART" binding, can be a bit faster
      shader.uniforms.uSampler = renderer.bindTexture(base)

      // draw
      quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0)
    }
  }

  // register plugin
  PIXI.WebGLRenderer.registerPlugin(name, ShaderPlugin)
  // PIXI.CanvasRenderer.registerPlugin(name, PIXI.CanvasSpriteRenderer)

  // update renderer if one was created and passed in by user
  if (renderer) {
    renderer.plugins[name] = renderer.type === PIXI.RENDERER_TYPE.WEBGL
      ? new ShaderPlugin(renderer)
      : new PIXI.CanvasSpriteRenderer(renderer)
  }
}

export class ShaperSprite<T> extends PIXI.Sprite {
  pluginSize: PIXI.Point
  pluginUniforms: T | any
}

export const createShaderPluginSprite = <T>(
  name: string,
  size: PIXI.Point,
  uniforms: T,
  texture?: PIXI.Texture
): ShaperSprite<T> => {
  const sprite = new ShaperSprite<T>(texture)

  sprite.pluginName = name
  sprite.pluginSize = size
  sprite.pluginUniforms = uniforms || {}

  return sprite
}
