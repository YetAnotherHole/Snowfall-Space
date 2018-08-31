// @REF: https://github.com/antonysze/Chinese-Painting-Shader
uniform sampler2D depthTexture;
uniform sampler2D normalTexture;
uniform sampler2D inkTexture;
uniform sampler2D paperTexture;
uniform sampler2D texture;

varying vec2 vTextureCoord;

const vec2 resolution = vec2(1400.0, 900.0);

float planeDistance(const in vec3 positionA, const in vec3 normalA,
                    const in vec3 positionB, const in vec3 normalB) {
  vec3 positionDelta = positionB-positionA;
  float planeDistanceDelta = max(abs(dot(positionDelta, normalA)), abs(dot(positionDelta, normalB)));
  return planeDistanceDelta;
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec2 vUv = vTextureCoord;
    float px = 1.0/resolution.x;

    float Gdx = texture2D(depthTexture, vec2(vUv.s + px, vUv.t - px)).r +
        texture2D(depthTexture, vec2(vUv.s + px, vUv.t)).r * 2.0 +
        texture2D(depthTexture, vec2(vUv.s + px, vUv.t - px)).r -
        texture2D(depthTexture, vec2(vUv.s - px, vUv.t - px)).r -
        texture2D(depthTexture, vec2(vUv.s - px, vUv.t)).r * 2.0 -
        texture2D(depthTexture, vec2(vUv.s - px, vUv.t - px)).r;
    float Gdy = texture2D(depthTexture, vec2(vUv.s - px, vUv.t - px)).r +
        texture2D(depthTexture, vec2(vUv.s, vUv.t - px)).r * 2.0 +
        texture2D(depthTexture, vec2(vUv.s + px, vUv.t - px)).r -
        texture2D(depthTexture, vec2(vUv.s - px, vUv.t + px)).r -
        texture2D(depthTexture, vec2(vUv.s, vUv.t + px)).r * 2.0 -
        texture2D(depthTexture, vec2(vUv.s + px, vUv.t + px)).r;

    float Gnx = texture2D(normalTexture, vec2(vUv.s + px, vUv.t - px)).r +
        texture2D(normalTexture, vec2(vUv.s + px, vUv.t)).r * 2.0 +
        texture2D(normalTexture, vec2(vUv.s + px, vUv.t - px)).r -
        texture2D(normalTexture, vec2(vUv.s - px, vUv.t - px)).r -
        texture2D(normalTexture, vec2(vUv.s - px, vUv.t)).r * 2.0 -
        texture2D(normalTexture, vec2(vUv.s - px, vUv.t - px)).r;
    float Gny = texture2D(normalTexture, vec2(vUv.s - px, vUv.t - px)).r +
        texture2D(normalTexture, vec2(vUv.s, vUv.t - px)).r * 2.0 +
        texture2D(normalTexture, vec2(vUv.s + px, vUv.t - px)).r -
        texture2D(normalTexture, vec2(vUv.s - px, vUv.t + px)).r -
        texture2D(normalTexture, vec2(vUv.s, vUv.t + px)).r * 2.0 -
        texture2D(normalTexture, vec2(vUv.s + px, vUv.t + px)).r;

    float Gd = abs(Gdx) + abs(Gdy);
    float Gn = abs(Gnx) + abs(Gny);
    float G = Gd*0.1 + Gn*0.1; // Stroke

    float ink = texture2D(inkTexture, fract(vUv*1.0)).r;

    float edge;
    vec3 color = texture2D(texture, vUv).xyz;
    float colorLevel = (color.x + color.y + color.z) / 3.0;
    float brightness = 1.25;

    if (colorLevel > 0.4 && edge < colorLevel)
        edge = clamp(1.0 - G * ink, 0.0, 1.0);
    else
        edge = 1.0;

    gl_FragColor = vec4(brightness * vec3(edge)*color * texture2D(paperTexture, vUv).xyz , 1.0);
}
