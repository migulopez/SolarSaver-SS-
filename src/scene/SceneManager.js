/**
 * SceneManager.js
 * Central 3D orchestrator: Camera, Renderer, Controls, Models, Lighting, Cable, and WebXR.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { StationModel } from '../models/StationModel.js';
import { SolarPanelModel } from '../models/SolarPanelModel.js';
import { CableModel } from '../models/CableModel.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { InteractionManager } from './InteractionManager.js';

export class SceneManager {
  constructor(canvasContainer, sim) {
    this.container = canvasContainer;
    this.sim = sim;

    this.clock = new THREE.Clock();

    // Camera preset targets for smooth tweening
    this.cameraAnimating = false;
    this.cameraStartPos = new THREE.Vector3();
    this.cameraEndPos = new THREE.Vector3();
    this.targetStartPos = new THREE.Vector3();
    this.targetEndPos = new THREE.Vector3();
    this.cameraAnimProgress = 1.0;
    this.cameraAnimDuration = 0.8;

    this.initThree();
    this.initObjects();
    this.initInteraction();
    this.initWebXR();

    // Start with front-isometric beauty view
    this.setCameraPreset('isometric', false);

    // Setup render loop
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.05, 50);
    this.camera.position.set(0.45, 0.45, 0.75);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.25;
    this.controls.maxDistance = 3.5;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent clipping into floor
    this.controls.target.set(0.12, 0.1, 0);

    // 5. Environment
    this.env = new EnvironmentManager(this.scene);

    // 6. Resize listener
    window.addEventListener('resize', this.onResize.bind(this));
  }

  initObjects() {
    // Main SolarSaver-SS Station
    this.station = new StationModel();
    this.scene.add(this.station.group);

    // External Solar Panel (30cm x 20cm)
    this.solarPanel = new SolarPanelModel();
    this.scene.add(this.solarPanel.group);

    // Flexible connecting cable
    this.cable = new CableModel();
    this.scene.add(this.cable.group);

    // Initial cable geometry
    this.updateCable();
  }

  initInteraction() {
    this.interaction = new InteractionManager(
      this.camera,
      this.scene,
      this.renderer.domElement,
      this.sim
    );
  }

  initWebXR() {
    this.renderer.xr.enabled = true;
    const xrButton = ARButton.createButton(this.renderer, {
      requiredFeatures: ['hit-test']
    });
    xrButton.id = 'xr-button';
    xrButton.textContent = '👓 Ver en Realidad Mixta (AR)';
    
    const xrContainer = document.getElementById('xr-controls-container');
    if (xrContainer) {
      xrContainer.appendChild(xrButton);
    }
  }

  updateCable() {
    const stationPort = this.station.getCableConnectionWorldPos();
    const panelPort = this.solarPanel.getCableConnectionWorldPos();
    this.cable.updateCurve(stationPort, panelPort);
  }

  onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setCameraPreset(name, animate = true) {
    const presets = {
      isometric: {
        pos: new THREE.Vector3(0.48, 0.42, 0.72),
        target: new THREE.Vector3(0.12, 0.1, 0)
      },
      frontal: {
        pos: new THREE.Vector3(0, 0.13, 0.62),
        target: new THREE.Vector3(0, 0.11, 0)
      },
      lateral: {
        pos: new THREE.Vector3(0.72, 0.16, 0.05),
        target: new THREE.Vector3(0.1, 0.11, 0)
      },
      superior: {
        pos: new THREE.Vector3(0, 0.88, 0.001),
        target: new THREE.Vector3(0, 0.1, 0)
      },
      bandeja: {
        pos: new THREE.Vector3(0, 0.28, 0.45),
        target: new THREE.Vector3(0, 0.06, 0.14)
      },
      panel: {
        pos: new THREE.Vector3(0.52, 0.38, 0.46),
        target: new THREE.Vector3(0.48, 0.14, 0.02)
      }
    };

    const targetPreset = presets[name] || presets.isometric;

    if (!animate) {
      this.camera.position.copy(targetPreset.pos);
      this.controls.target.copy(targetPreset.target);
      this.controls.update();
      this.cameraAnimating = false;
      return;
    }

    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.copy(targetPreset.pos);
    this.targetStartPos.copy(this.controls.target);
    this.targetEndPos.copy(targetPreset.target);
    this.cameraAnimProgress = 0;
    this.cameraAnimating = true;
  }

  zoom(factor) {
    // Zoom camera by scaling distance to target
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    dir.multiplyScalar(factor);
    this.camera.position.addVectors(this.controls.target, dir);
    this.controls.update();
  }

  animate() {
    const delta = Math.min(0.1, this.clock.getDelta());

    // 1. Camera Tween Animation
    if (this.cameraAnimating) {
      this.cameraAnimProgress += delta / this.cameraAnimDuration;
      const t = Math.min(1.0, this.cameraAnimProgress);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - t, 3);

      this.camera.position.lerpVectors(this.cameraStartPos, this.cameraEndPos, ease);
      this.controls.target.lerpVectors(this.targetStartPos, this.targetEndPos, ease);
      this.controls.update();

      if (t >= 1.0) {
        this.cameraAnimating = false;
      }
    } else {
      this.controls.update();
    }

    // 2. Physics & Power Simulation step
    this.sim.update(delta);
    const simState = this.sim.getState();

    // 3. Update Station 3D Model
    this.station.update(delta, simState);

    // 4. Update Solar Panel Orientation & Model
    this.solarPanel.applyOrientation(simState.panelTilt, simState.panelAzimuth);

    // 5. Update Dynamic Cable
    this.updateCable();

    // 6. Update Sky and Sun
    const sunPos = this.sim.solarCalc.calculateSunPosition(simState.timeOfDay);
    this.env.updateSun(sunPos, simState.cloudCover);

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }
}
