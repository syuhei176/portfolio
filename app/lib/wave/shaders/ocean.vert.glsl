#define PI 3.14159265359

uniform float uTime;
uniform float uWaveSteepness[6];
uniform float uWaveLength[6];
uniform vec2 uWaveDirection[6];
uniform float uNoiseStrength;
uniform float uNoiseScale;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vHeight;

#include "./includes/gerstner.glsl"
#include "./includes/noise.glsl"

void main() {
  vec3 pos = position;
  vec3 tangent = vec3(1.0, 0.0, 0.0);
  vec3 binormal = vec3(0.0, 0.0, 1.0);

  for (int i = 0; i < 6; i++) {
    pos += gerstnerWave(
      uWaveDirection[i],
      uWaveSteepness[i],
      uWaveLength[i],
      uTime,
      position,
      tangent,
      binormal
    );
  }

  // Multi-octave noise for random height variation
  float noiseHeight = 0.0;
  float freq = uNoiseScale;
  float amp = uNoiseStrength;
  for (int o = 0; o < 3; o++) {
    noiseHeight += snoise(vec3(position.xz * freq, uTime * 0.4)) * amp;
    freq *= 2.2;
    amp *= 0.45;
  }
  pos.y += noiseHeight;

  // Approximate noise effect on normal via finite differences
  float eps = 0.5;
  float nL = 0.0;
  float nR = 0.0;
  float nD = 0.0;
  float nU = 0.0;
  float f2 = uNoiseScale;
  float a2 = uNoiseStrength;
  for (int o = 0; o < 3; o++) {
    nL += snoise(vec3((position.x - eps) * f2, position.z * f2, uTime * 0.4)) * a2;
    nR += snoise(vec3((position.x + eps) * f2, position.z * f2, uTime * 0.4)) * a2;
    nD += snoise(vec3(position.x * f2, (position.z - eps) * f2, uTime * 0.4)) * a2;
    nU += snoise(vec3(position.x * f2, (position.z + eps) * f2, uTime * 0.4)) * a2;
    f2 *= 2.2;
    a2 *= 0.45;
  }
  float dydx = (nR - nL) / (2.0 * eps);
  float dydz = (nU - nD) / (2.0 * eps);
  tangent += vec3(0.0, dydx, 0.0);
  binormal += vec3(0.0, dydz, 0.0);

  // Fade out displacement near plane edges so silhouette disappears into fog
  float edgeDist = max(abs(position.x), abs(position.z));
  float edgeFade = 1.0 - smoothstep(800.0, 1024.0, edgeDist);
  pos.y *= edgeFade;
  pos.x = mix(position.x, pos.x, edgeFade);
  pos.z = mix(position.z, pos.z, edgeFade);

  vec3 normal = normalize(cross(binormal, tangent));
  normal = mix(vec3(0.0, 1.0, 0.0), normal, edgeFade);

  vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  vNormal = normalize(normalMatrix * normal);
  vHeight = pos.y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
