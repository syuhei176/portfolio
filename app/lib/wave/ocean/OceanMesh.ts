import * as THREE from "three";
import { createOceanMaterial, type OceanUniforms } from "./OceanMaterial.js";

export function createOceanMesh(
  envMap: THREE.Texture,
  sunPosition: THREE.Vector3,
): { mesh: THREE.Mesh; uniforms: OceanUniforms } {
  const geometry = new THREE.PlaneGeometry(2048, 2048, 512, 512);
  geometry.rotateX(-Math.PI / 2);

  const { material, uniforms } = createOceanMaterial(envMap, sunPosition);
  const mesh = new THREE.Mesh(geometry, material);

  return { mesh, uniforms };
}
