import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createCamera(): {
  camera: THREE.PerspectiveCamera;
  updateAspect: (width: number, height: number) => void;
} {
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 10000);
  camera.position.set(100, 40, 200);

  const updateAspect = (width: number, height: number) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  return { camera, updateAspect };
}

export function createControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.minDistance = 20;
  controls.maxDistance = 500;
  controls.target.set(0, 0, 0);

  return controls;
}
