import * as THREE from "three";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type GUI from "lil-gui";
import { createCamera, createControls } from "./Camera.js";
import { createLighting } from "./Lighting.js";
import { createSky } from "./Sky.js";
import { createRenderer } from "../utils/renderer.js";
import { createOceanMesh } from "../ocean/OceanMesh.js";
import { createGui } from "../ocean/WaveParams.js";
import type { OceanUniforms } from "../ocean/OceanMaterial.js";

export class OceanScene {
  readonly scene: THREE.Scene;
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private readonly clock = new THREE.Clock();
  private oceanUniforms: OceanUniforms | null = null;
  private gui: GUI | null = null;
  private readonly mesh: THREE.Mesh;
  private readonly onResize: () => void;
  private readonly updateAspect: (width: number, height: number) => void;
  private readonly updateSize: (width: number, height: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    const { renderer, updateSize } = createRenderer(canvas);
    this.renderer = renderer;
    this.updateSize = updateSize;
    this.renderer.setClearColor(0x8dabc4);

    const { camera, updateAspect } = createCamera();
    this.camera = camera;
    this.updateAspect = updateAspect;

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.updateSize(width, height);
    this.updateAspect(width, height);

    this.controls = createControls(this.camera, this.renderer.domElement);

    createLighting(this.scene);
    const { envMap, sunPosition } = createSky(this.scene, this.renderer);

    const { mesh, uniforms } = createOceanMesh(envMap, sunPosition);
    this.scene.add(mesh);
    this.mesh = mesh;
    this.oceanUniforms = uniforms;

    this.gui = createGui(uniforms, (color: THREE.Color) => {
      this.renderer.setClearColor(color);
    });

    this.onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.updateSize(w, h);
      this.updateAspect(w, h);
    };
    window.addEventListener("resize", this.onResize);
  }

  start(): void {
    this.clock.start();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  destroy(): void {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener("resize", this.onResize);
    this.gui?.destroy();
    this.controls.dispose();
    this.mesh.geometry.dispose();
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }
    this.renderer.dispose();
  }

  private tick(): void {
    const elapsed = this.clock.getElapsedTime();
    if (this.oceanUniforms) {
      this.oceanUniforms.uTime.value = elapsed;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
