/**
 * SceneManager.js
 * Central 3D orchestrator: Camera, Renderer, Controls, Models, House Environment,
 * Meta Quest WebXR Immersive VR support with controllers, laser pointers, and dual view modes.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { StationModel } from '../models/StationModel.js';
import { SolarPanelModel } from '../models/SolarPanelModel.js';
import { CableModel } from '../models/CableModel.js';
import { HouseModel } from '../models/HouseModel.js';
import { VRTabletModel } from '../models/VRTabletModel.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { InteractionManager } from './InteractionManager.js';
import { soundManager } from '../audio/SoundManager.js';

export class SceneManager {
  constructor(canvasContainer, sim) {
    this.container = canvasContainer;
    this.sim = sim;

    this.clock = new THREE.Clock();

    // Mode state: 'game' (Normal Orbit) or 'vr' (Meta Quest / Immersive)
    this.currentMode = 'game';
    this.isWebXRSessionActive = false;

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

    // Start with outdoor isometric view showing station and house in background
    this.setCameraPreset('isometric', false);

    // Setup render loop
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera & VR Dolly
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.05, 100);
    this.camera.position.set(0.65, 0.55, 1.15);

    // Dolly rig for standing in front of table in VR (eye height ~ 1.6m)
    this.dolly = new THREE.Group();
    this.dolly.name = 'VRDolly';
    this.dolly.position.set(0.15, 0.0, 0.72);
    this.dolly.add(this.camera);
    this.scene.add(this.dolly);

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
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.25;
    this.controls.maxDistance = 12.0;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.target.set(0.15, 0.12, 0);

    // 5. Environment (Sky, Sunlight, Lawn, Clouds)
    this.env = new EnvironmentManager(this.scene);

    // 6. Resize listener
    window.addEventListener('resize', this.onResize.bind(this));
  }

  initObjects() {
    // Background House & Backyard Environment
    this.house = new HouseModel();
    this.scene.add(this.house.group);

    // Main SolarSaver-SS Station
    this.station = new StationModel();
    this.scene.add(this.station.group);

    // External Solar Panel (30cm x 20cm)
    this.solarPanel = new SolarPanelModel();
    this.scene.add(this.solarPanel.group);

    // Flexible connecting cable
    this.cable = new CableModel();
    this.scene.add(this.cable.group);

    // Floating 3D Telemetry Slate for Meta Quest VR headset
    this.vrTablet = new VRTabletModel();
    this.scene.add(this.vrTablet.group);

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

    // Setup Meta Quest XR Controllers (0: Right/Primary, 1: Left/Secondary)
    const controllerModelFactory = new XRControllerModelFactory();

    // Laser beam geometry for pointing
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -2.5)
    ]);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });

    // Targeting dot at end of laser
    const dotGeo = new THREE.SphereGeometry(0.015, 12, 12);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    [0, 1].forEach(index => {
      const controller = this.renderer.xr.getController(index);
      controller.name = `VRController_${index}`;

      const laserLine = new THREE.Line(laserGeo, laserMat);
      laserLine.name = 'laserLine';
      controller.add(laserLine);

      const targetDot = new THREE.Mesh(dotGeo, dotMat);
      targetDot.position.set(0, 0, -2.5);
      controller.add(targetDot);

      // Trigger / Select event handler
      controller.addEventListener('selectstart', () => this.onVRControllerSelect(controller));

      this.scene.add(controller);

      // Add Controller Grip with 3D model
      const grip = this.renderer.xr.getControllerGrip(index);
      grip.add(controllerModelFactory.createControllerModel(grip));
      this.scene.add(grip);
    });

    // WebXR Session lifecycle listeners
    this.renderer.xr.addEventListener('sessionstart', () => {
      this.isWebXRSessionActive = true;
      this.currentMode = 'vr';
      this.dolly.position.set(0.15, 0.0, 0.72);
      this.controls.enabled = false;
      document.body.classList.add('in-webxr');
      this.updateVRUIState();
      soundManager.playBeep();
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.isWebXRSessionActive = false;
      this.currentMode = 'game';
      this.controls.enabled = true;
      document.body.classList.remove('in-webxr');
      this.updateVRUIState();
      soundManager.playBeep();
    });
  }

  onVRControllerSelect(controller) {
    // Cast ray from controller forward into scene
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(this.scene.children, true);
    for (const hit of intersects) {
      const match = this.interaction.findInteractiveAncestor(hit.object);
      if (match) {
        this.interaction.triggerAction(match.type);

        // Haptic feedback pulse on Meta Quest controller if supported
        const session = this.renderer.xr.getSession();
        if (session && session.inputSources) {
          for (const source of session.inputSources) {
            if (source.gamepad && source.gamepad.hapticActuators && source.gamepad.hapticActuators[0]) {
              source.gamepad.hapticActuators[0].pulse(0.6, 60);
            }
          }
        }
        break;
      }
    }
  }

  /**
   * Switch between Normal Game View and Meta Quest VR View
   */
  async toggleVRMode() {
    if (this.currentMode === 'game') {
      // Switch TO VR MODE
      this.currentMode = 'vr';

      // Check if WebXR is supported for Meta Quest headset
      if (navigator.xr && navigator.xr.isSessionSupported) {
        try {
          const isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
          if (isVRSupported) {
            const session = await navigator.xr.requestSession('immersive-vr', {
              optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
            });
            await this.renderer.xr.setSession(session);
            return;
          }
        } catch (err) {
          console.warn('WebXR native session not launched (running simulated VR mode):', err);
        }
      }

      // Simulated First-Person VR Eye-level mode in browser
      this.enterSimulatedVRView();
    } else {
      // Switch BACK TO NORMAL GAME VIEW
      this.currentMode = 'game';

      // If active WebXR session, end it
      const session = this.renderer.xr.getSession();
      if (session) {
        session.end();
      }

      this.enterNormalGameView();
    }

    this.updateVRUIState();
    soundManager.playBeep();
  }

  enterSimulatedVRView() {
    this.controls.enabled = true;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 5.0;

    // Place camera right in front of the SolarSaver station at eye height (1.65m)
    this.cameraStartPos.copy(this.camera.position);
    this.cameraEndPos.set(0.15, 1.25, 0.72);
    this.targetStartPos.copy(this.controls.target);
    this.targetEndPos.set(0.15, 0.18, 0.0);
    this.cameraAnimProgress = 0;
    this.cameraAnimating = true;

    document.getElementById('vr-banner')?.classList.add('visible');
  }

  enterNormalGameView() {
    this.controls.enabled = true;
    this.controls.minDistance = 0.25;
    this.controls.maxDistance = 12.0;

    this.setCameraPreset('isometric', true);
    document.getElementById('vr-banner')?.classList.remove('visible');
  }

  updateVRUIState() {
    const btnVR = document.getElementById('btn-toggle-vr');
    const vrBadge = document.getElementById('vr-mode-badge');
    const isVR = this.currentMode === 'vr' || this.isWebXRSessionActive;

    if (btnVR) {
      if (isVR) {
        btnVR.className = 'btn btn-vr active';
        btnVR.innerHTML = '🎮 Salir de VR (Vista Normal)';
      } else {
        btnVR.className = 'btn btn-vr';
        btnVR.innerHTML = '🥽 Modo VR (Meta Quest)';
      }
    }

    if (vrBadge) {
      vrBadge.style.display = isVR ? 'inline-flex' : 'none';
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
    if (this.currentMode === 'vr') {
      this.currentMode = 'game';
      this.updateVRUIState();
    }

    const presets = {
      isometric: {
        pos: new THREE.Vector3(0.72, 0.52, 1.05),
        target: new THREE.Vector3(0.18, 0.12, 0.0)
      },
      frontal: {
        pos: new THREE.Vector3(0.08, 0.20, 0.82),
        target: new THREE.Vector3(0.08, 0.14, 0.0)
      },
      lateral: {
        pos: new THREE.Vector3(0.95, 0.22, 0.05),
        target: new THREE.Vector3(0.15, 0.12, 0.0)
      },
      superior: {
        pos: new THREE.Vector3(0.1, 1.1, 0.001),
        target: new THREE.Vector3(0.1, 0.1, 0.0)
      },
      bandeja: {
        pos: new THREE.Vector3(0.0, 0.28, 0.48),
        target: new THREE.Vector3(0.0, 0.08, 0.14)
      },
      panel: {
        pos: new THREE.Vector3(0.68, 0.42, 0.55),
        target: new THREE.Vector3(0.48, 0.15, 0.02)
      },
      casa: {
        pos: new THREE.Vector3(1.2, 1.2, 2.8),
        target: new THREE.Vector3(0.4, 1.0, -1.2)
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

    // 7. Update In-VR 3D Telemetry Tablet
    if (this.vrTablet) {
      this.vrTablet.update(simState);
    }

    // 8. Render
    this.renderer.render(this.scene, this.camera);
  }
}
