import * as THREE from "three";

export interface SceneLights {
  directional: THREE.DirectionalLight;
  hemisphere: THREE.HemisphereLight;
  ambient: THREE.AmbientLight;
}

export function createLighting(scene: THREE.Scene): SceneLights {
  const directional = new THREE.DirectionalLight(0xfff4e6, 3.0);
  directional.position.set(-300, 100, -200);
  scene.add(directional);

  const hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x1e4d6e, 0.4);
  scene.add(hemisphere);

  const ambient = new THREE.AmbientLight(0x446688, 0.3);
  scene.add(ambient);

  return { directional, hemisphere, ambient };
}
