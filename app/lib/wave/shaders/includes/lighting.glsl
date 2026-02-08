// Fresnel effect using Schlick's approximation
float fresnelSchlick(float cosTheta, float f0) {
  return f0 + (1.0 - f0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Blinn-Phong specular highlight
float blinnPhongSpecular(vec3 normal, vec3 viewDir, vec3 lightDir, float shininess) {
  vec3 halfDir = normalize(lightDir + viewDir);
  return pow(max(dot(normal, halfDir), 0.0), shininess);
}

// Subsurface scattering approximation
vec3 subsurfaceScattering(
  vec3 viewDir,
  vec3 lightDir,
  vec3 normal,
  float height,
  vec3 sssColor,
  float sssStrength
) {
  float sss = pow(max(dot(viewDir, -lightDir + normal * 0.2), 0.0), 3.0);
  float heightFactor = clamp(height * 0.5 + 0.5, 0.0, 1.0);
  return sssColor * sss * heightFactor * sssStrength;
}
