import GUI from "lil-gui";
import type { OceanUniforms } from "./OceanMaterial.js";

export interface WaveConfig {
  direction: number;
  steepness: number;
  wavelength: number;
}

export const DEFAULT_WAVES: WaveConfig[] = [
  { direction: 0, steepness: 0.25, wavelength: 60 },
  { direction: 30, steepness: 0.25, wavelength: 31 },
  { direction: 60, steepness: 0.15, wavelength: 18 },
  { direction: 10, steepness: 0.12, wavelength: 10 },
  { direction: 45, steepness: 0.1, wavelength: 5 },
  { direction: -20, steepness: 0.08, wavelength: 3 },
];

function degToDirection(deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [Math.sin(rad), Math.cos(rad)];
}

export function getWaveDirections(waves: WaveConfig[]): number[] {
  return waves.flatMap((w) => degToDirection(w.direction));
}

export function getWaveSteepnesses(waves: WaveConfig[]): number[] {
  return waves.map((w) => w.steepness);
}

export function getWaveLengths(waves: WaveConfig[]): number[] {
  return waves.map((w) => w.wavelength);
}

import type { Color } from "three";

export function createGui(
  uniforms: OceanUniforms,
  onFogColorChange?: (color: Color) => void,
): GUI {
  const gui = new GUI({ title: "Ocean Parameters" });

  const waterFolder = gui.addFolder("Water");
  waterFolder.addColor({ color: "#0077be" }, "color").onChange((v: string) => {
    uniforms.uWaterColor.value.set(v);
  });
  waterFolder.addColor({ deep: "#004488" }, "deep").onChange((v: string) => {
    uniforms.uDeepColor.value.set(v);
  });
  waterFolder.add(uniforms.uFresnelPower, "value", 0.5, 5, 0.1).name("Fresnel");
  waterFolder.add(uniforms.uShininess, "value", 16, 512, 1).name("Shininess");

  const sssFolder = gui.addFolder("Subsurface");
  sssFolder.addColor({ color: "#1a8c5e" }, "color").onChange((v: string) => {
    uniforms.uSSSColor.value.set(v);
  });
  sssFolder.add(uniforms.uSSSStrength, "value", 0, 2, 0.01).name("Strength");

  const noiseFolder = gui.addFolder("Noise");
  noiseFolder
    .add(uniforms.uNoiseStrength, "value", 0, 3, 0.05)
    .name("Strength");
  noiseFolder
    .add(uniforms.uNoiseScale, "value", 0.001, 0.05, 0.001)
    .name("Scale");

  const fogFolder = gui.addFolder("Fog");
  fogFolder.addColor({ color: "#8dabc4" }, "color").onChange((v: string) => {
    uniforms.uFogColor.value.set(v);
    onFogColorChange?.(uniforms.uFogColor.value);
  });
  fogFolder
    .add(uniforms.uFogDensity, "value", 0.001, 0.1, 0.001)
    .name("Density");
  fogFolder.add(uniforms.uFogOffset, "value", -0.2, 0.5, 0.01).name("Offset");

  const foamFolder = gui.addFolder("Foam");
  foamFolder.add(uniforms.uFoamThreshold, "value", 0, 5, 0.1).name("Threshold");

  const wavesFolder = gui.addFolder("Waves");
  for (let i = 0; i < 6; i++) {
    const wf = wavesFolder.addFolder(`Wave ${i + 1}`);
    wf.add(
      { steepness: uniforms.uWaveSteepness.value[i] },
      "steepness",
      0,
      0.5,
      0.01,
    ).onChange((v: number) => {
      uniforms.uWaveSteepness.value[i] = v;
    });
    wf.add(
      { wavelength: uniforms.uWaveLength.value[i] },
      "wavelength",
      1,
      100,
      0.5,
    ).onChange((v: number) => {
      uniforms.uWaveLength.value[i] = v;
    });
    wf.close();
  }
  wavesFolder.close();

  return gui;
}
