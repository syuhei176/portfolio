precision highp float;

#define PI 3.14159265359

uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uWaterColor;
uniform vec3 uDeepColor;
uniform vec3 uSSSColor;
uniform float uSSSStrength;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uFoamThreshold;
uniform float uTime;
uniform samplerCube uEnvMap;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uFogOffset;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vHeight;

#include "./includes/noise.glsl"
#include "./includes/lighting.glsl"

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 lightDir = normalize(uSunDirection);

  // Fresnel
  float cosTheta = max(dot(normal, viewDir), 0.0);
  float fresnel = fresnelSchlick(cosTheta, 0.02);
  fresnel = pow(fresnel, uFresnelPower);

  // Environment reflection
  vec3 reflectDir = reflect(-viewDir, normal);
  vec3 envColor = textureCube(uEnvMap, reflectDir).rgb;

  // Base water color - blend by depth
  float depthFactor = clamp(-vHeight * 0.15 + 0.5, 0.0, 1.0);
  vec3 baseColor = mix(uWaterColor, uDeepColor, depthFactor);

  // Specular
  float specular = blinnPhongSpecular(normal, viewDir, lightDir, uShininess);

  // Subsurface scattering
  vec3 sss = subsurfaceScattering(
    viewDir, lightDir, normal, vHeight, uSSSColor, uSSSStrength
  );

  // Foam on wave crests
  float foam = 0.0;
  float noiseVal = snoise(vec3(vWorldPosition.xz * 0.03, uTime * 0.5));
  float foamMask = smoothstep(uFoamThreshold, uFoamThreshold + 1.5, vHeight + noiseVal * 0.8);
  foam = foamMask * (0.6 + 0.4 * snoise(vec3(vWorldPosition.xz * 0.15, uTime * 0.3)));
  foam = clamp(foam, 0.0, 1.0);

  // Combine
  vec3 color = mix(baseColor, envColor, fresnel);
  color += uSunColor * specular * 2.0;
  color += sss;
  color = mix(color, vec3(1.0), foam * 0.7);

  // Atmospheric fog — hides the geometry edge at far distances
  float dist = length(vWorldPosition - cameraPosition);
  float fogFactor = 1.0 - exp(-pow(dist * uFogDensity, 2.0));
  fogFactor = clamp(fogFactor + uFogOffset, 0.0, 1.0);
  color = mix(color, uFogColor, fogFactor);

  gl_FragColor = vec4(color, 1.0);
}
