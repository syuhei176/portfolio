import * as THREE from "three";
import vertexShader from "../shaders/ocean.vert.glsl";
import fragmentShader from "../shaders/ocean.frag.glsl";
import {
  DEFAULT_WAVES,
  getWaveDirections,
  getWaveSteepnesses,
  getWaveLengths,
} from "./WaveParams.js";

export interface OceanUniforms {
  [key: string]: THREE.IUniform;
  uTime: { value: number };
  uWaveSteepness: { value: number[] };
  uWaveLength: { value: number[] };
  uWaveDirection: { value: number[] };
  uSunDirection: { value: THREE.Vector3 };
  uSunColor: { value: THREE.Color };
  uWaterColor: { value: THREE.Color };
  uDeepColor: { value: THREE.Color };
  uSSSColor: { value: THREE.Color };
  uSSSStrength: { value: number };
  uFresnelPower: { value: number };
  uShininess: { value: number };
  uFoamThreshold: { value: number };
  uNoiseStrength: { value: number };
  uNoiseScale: { value: number };
  uFogColor: { value: THREE.Color };
  uFogDensity: { value: number };
  uFogOffset: { value: number };
  uEnvMap: { value: THREE.Texture };
}

export function createOceanMaterial(
  envMap: THREE.Texture,
  sunPosition: THREE.Vector3,
): { material: THREE.ShaderMaterial; uniforms: OceanUniforms } {
  const uniforms: OceanUniforms = {
    uTime: { value: 0 },
    uWaveSteepness: { value: getWaveSteepnesses(DEFAULT_WAVES) },
    uWaveLength: { value: getWaveLengths(DEFAULT_WAVES) },
    uWaveDirection: { value: getWaveDirections(DEFAULT_WAVES) },
    uSunDirection: { value: sunPosition.clone().normalize() },
    uSunColor: { value: new THREE.Color(0xfff4e6) },
    uWaterColor: { value: new THREE.Color(0x0077be) },
    uDeepColor: { value: new THREE.Color(0x004488) },
    uSSSColor: { value: new THREE.Color(0x1a8c5e) },
    uSSSStrength: { value: 0.8 },
    uFresnelPower: { value: 1.0 },
    uShininess: { value: 128 },
    uFoamThreshold: { value: 2.0 },
    uNoiseStrength: { value: 0.6 },
    uNoiseScale: { value: 0.012 },
    uFogColor: { value: new THREE.Color(0x8dabc4) },
    uFogDensity: { value: 0.008 },
    uFogOffset: { value: 0.0 },
    uEnvMap: { value: envMap },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.FrontSide,
  });

  return { material, uniforms };
}
