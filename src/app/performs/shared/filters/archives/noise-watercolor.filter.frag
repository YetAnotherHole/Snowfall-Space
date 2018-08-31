// @REF: https://github.com/kashimAstro/WaterColor
varying vec2 vTextureCoord;
varying vec4 color;

uniform sampler2D colorMap;
uniform sampler2D heightMap;

const float gradientStep = 0.0015; // [-1.0, 1.0]
const float advectStep = 0.0015; // [-1.0, 1.0]
const float flipHeightMap = 0.7; // [0.0, 2.0]
const float expand = 0.0; // [0.0, 1.0]

void main() {
     vec4 advectMatrix = vec4(0.1);
     vec4 cxp = texture2D(heightMap, vec2(vTextureCoord.x + gradientStep, flipHeightMap*vTextureCoord.y));
     vec4 cxn = texture2D(heightMap, vec2(vTextureCoord.x - gradientStep, flipHeightMap*vTextureCoord.y));
     vec4 cyp = texture2D(heightMap, vec2(vTextureCoord.x, flipHeightMap*(vTextureCoord.y + gradientStep)));
     vec4 cyn = texture2D(heightMap, vec2(vTextureCoord.x, flipHeightMap*(vTextureCoord.y - gradientStep)));

     vec4 color = vec4(1, 1, 1, 1);
     vec3 grey = vec3(.3, .59, .11);
     float axp = dot(grey, cxp.xyz);
     float axn = dot(grey, cxn.xyz);
     float ayp = dot(grey, cyp.xyz);
     float ayn = dot(grey, cyn.xyz);

     vec2 grad = vec2(axp - axn, ayp - ayn);
     vec2 newtc = vTextureCoord + advectStep * normalize(advectMatrix.xy * grad) * expand;

     color.rgb = texture2D(colorMap, newtc).rgb;
     gl_FragColor = color;
}
