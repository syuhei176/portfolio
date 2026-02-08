import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";

export interface SkySetup {
  sky: Sky;
  sunPosition: THREE.Vector3;
  envMap: THREE.Texture;
}

export function createSky(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
): SkySetup {
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms as Record<
    string,
    THREE.IUniform | undefined
  >;
  skyUniforms["turbidity"]!.value = 10;
  skyUniforms["rayleigh"]!.value = 2;
  skyUniforms["mieCoefficient"]!.value = 0.005;
  skyUniforms["mieDirectionalG"]!.value = 0.8;

  const sunPosition = new THREE.Vector3();
  const phi = THREE.MathUtils.degToRad(88);
  const theta = THREE.MathUtils.degToRad(220);
  sunPosition.setFromSphericalCoords(1, phi, theta);
  (skyUniforms["sunPosition"]!.value as THREE.Vector3).copy(sunPosition);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileCubemapShader();

  const renderTarget = pmrem.fromScene(sky as unknown as THREE.Scene);
  const envMap = renderTarget.texture;
  scene.environment = envMap;

  pmrem.dispose();

  // Remove sky mesh — env map is baked, background will be fog color
  scene.remove(sky);

  return { sky, sunPosition, envMap };
}
