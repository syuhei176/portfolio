// Gerstner wave function
// Returns displacement (xyz) and modifies tangent/binormal for normal calculation
vec3 gerstnerWave(
  vec2 direction,
  float steepness,
  float wavelength,
  float time,
  vec3 position,
  inout vec3 tangent,
  inout vec3 binormal
) {
  float k = 2.0 * PI / wavelength;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(direction);
  float f = k * (dot(d, position.xz) - c * time);
  float a = steepness / k;

  tangent += vec3(
    -d.x * d.x * steepness * sin(f),
    d.x * steepness * cos(f),
    -d.x * d.y * steepness * sin(f)
  );

  binormal += vec3(
    -d.x * d.y * steepness * sin(f),
    d.y * steepness * cos(f),
    -d.y * d.y * steepness * sin(f)
  );

  return vec3(
    d.x * a * cos(f),
    a * sin(f),
    d.y * a * cos(f)
  );
}
