import * as THREE from "three";

export function createRenderer(canvas: HTMLCanvasElement): {
  renderer: THREE.WebGLRenderer;
  updateSize: (width: number, height: number) => void;
} {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const updateSize = (width: number, height: number) => {
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  return { renderer, updateSize };
}
