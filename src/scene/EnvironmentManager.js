/**
 * EnvironmentManager.js
 * Creates a vibrant, bright outdoor environment with realistic daylight, sky dome,
 * lush grass ground, patio paving, clouds, and dynamic time-of-day lighting.
 */
import * as THREE from 'three';

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;

    this.initLights();
    this.initSkyAndAtmosphere();
    this.initGroundAndPatio();
    this.initClouds();
  }

  initLights() {
    // Hemispheric Ambient Light (Daylight sky to grass bounce)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x166534, 1.2);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Main Directional Sunlight with sharp soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 16;
    this.sunLight.shadow.camera.left = -2.2;
    this.sunLight.shadow.camera.right = 2.2;
    this.sunLight.shadow.camera.top = 2.2;
    this.sunLight.shadow.camera.bottom = -2.2;
    this.sunLight.shadow.bias = -0.0003;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Warm ambient fill light for rich contrast and vibrant colors
    this.fillLight = new THREE.DirectionalLight(0xbae6fd, 0.9);
    this.fillLight.position.set(-2.0, 1.8, 2.0);
    this.scene.add(this.fillLight);
  }

  initSkyAndAtmosphere() {
    // Large Sky Dome with procedural sunny daytime gradient
    const skyGeo = new THREE.SphereGeometry(24, 32, 16);
    this.skyCanvas = document.createElement('canvas');
    this.skyCanvas.width = 512;
    this.skyCanvas.height = 512;
    this.skyCtx = this.skyCanvas.getContext('2d');
    this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);

    const skyMat = new THREE.MeshBasicMaterial({
      map: this.skyTexture,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyDome);

    // 3D Sun Sphere & glowing Corona
    const sunGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff59d,
      toneMapped: false
    });
    this.sunSphere = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunSphere);

    const flareGeo = new THREE.RingGeometry(0.25, 0.65, 32);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.sunFlare = new THREE.Mesh(flareGeo, flareMat);
    this.sunSphere.add(this.sunFlare);
  }

  initGroundAndPatio() {
    // 1. Lush Green Outdoor Lawn
    const lawnGeo = new THREE.PlaneGeometry(28, 28);
    // Procedural grass texture canvas for vivid natural detail
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 256;
    grassCanvas.height = 256;
    const gCtx = grassCanvas.getContext('2d');
    gCtx.fillStyle = '#2d6a4f';
    gCtx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      gCtx.fillStyle = Math.random() > 0.5 ? '#40916c' : '#1b4332';
      gCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 3);
    }
    const grassTex = new THREE.CanvasTexture(grassCanvas);
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(16, 16);

    const lawnMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.9,
      metalness: 0.05
    });

    this.lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    this.lawnMesh.rotation.x = -Math.PI / 2;
    this.lawnMesh.position.y = -0.01;
    this.lawnMesh.receiveShadow = true;
    this.scene.add(this.lawnMesh);

    // 2. Stone Patio / Terrace surrounding the workstation
    const patioGeo = new THREE.BoxGeometry(4.2, 0.02, 3.4);
    const patioMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Light flagstone paving
      roughness: 0.8,
      metalness: 0.1
    });
    this.patioMesh = new THREE.Mesh(patioGeo, patioMat);
    this.patioMesh.position.set(0.3, -0.005, -0.4);
    this.patioMesh.receiveShadow = true;
    this.scene.add(this.patioMesh);

    // Patio Stone Walkway leading to the house porch
    const walkwayGeo = new THREE.BoxGeometry(1.2, 0.02, 2.2);
    const walkwayMesh = new THREE.Mesh(walkwayGeo, patioMat);
    walkwayMesh.position.set(0.4, -0.005, -2.2);
    walkwayMesh.receiveShadow = true;
    this.scene.add(walkwayMesh);
  }

  initClouds() {
    // Gentle 3D cumulus clouds in the distance
    this.cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0
    });

    const puffGeo = new THREE.DodecahedronGeometry(0.8, 1);
    const cloudOffsets = [
      [-6, 7, -8], [4, 8, -9], [-2, 9, -11], [8, 7.5, -6], [-7, 8.5, 2]
    ];

    cloudOffsets.forEach(([cx, cy, cz]) => {
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(cx, cy, cz);
      puff.scale.set(2.4, 0.7, 1.4);
      puff.castShadow = true;
      this.cloudGroup.add(puff);
    });

    this.scene.add(this.cloudGroup);
  }

  updateSkyGradient(isDaylight, elevation, timeOfDay) {
    const ctx = this.skyCtx;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);

    if (!isDaylight || elevation <= 0) {
      // Deep night sky with indigo gradient
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#1e293b');
    } else if (elevation < 15) {
      // Sunrise / Sunset golden hour
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.3, '#7c2d12');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, '#fde047');
    } else {
      // Bright, vivid blue daylight
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(0.8, '#bae6fd');
      grad.addColorStop(1, '#f0f9ff');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    this.skyTexture.needsUpdate = true;
  }

  updateSun(sunPos, cloudCover) {
    const sunDist = 8.5; // distance from origin
    const sx = sunPos.direction.x * sunDist;
    const sy = sunPos.direction.y * sunDist;
    const sz = sunPos.direction.z * sunDist;

    this.sunLight.position.set(sx, sy, sz);
    this.sunSphere.position.set(sx, sy, sz);
    this.sunSphere.lookAt(0, 0, 0);

    this.updateSkyGradient(sunPos.isDaylight, sunPos.elevation, sunPos.timeOfDay);

    if (!sunPos.isDaylight || sy <= 0.05) {
      // Night time
      this.sunLight.intensity = 0.08;
      this.sunLight.color.setHex(0x38bdf8);
      this.hemiLight.intensity = 0.3;
      this.hemiLight.color.setHex(0x0f172a);
      this.hemiLight.groundColor.setHex(0x020617);
      this.sunSphere.visible = false;
      this.fillLight.intensity = 0.15;
    } else {
      // Daylight
      this.sunSphere.visible = true;
      const elevNorm = Math.min(1.0, sy / 6.0);
      const cloudFactor = 1.0 - cloudCover * 0.65;

      // Vivid, vibrant sunny intensity
      this.sunLight.intensity = (1.4 + elevNorm * 1.8) * cloudFactor;

      if (sunPos.elevation < 20) {
        this.sunLight.color.setHex(0xfb923c); // Warm amber sunrise/sunset
      } else {
        this.sunLight.color.setHex(0xfffaed); // Crisp bright warm white daylight
      }

      this.hemiLight.intensity = (0.7 + elevNorm * 0.7) * (1 - cloudCover * 0.3);
      this.hemiLight.color.setHex(0xe0f2fe);
      this.hemiLight.groundColor.setHex(0x15803d); // rich grass green bounce
      this.fillLight.intensity = 0.8 * cloudFactor;
    }
  }
}
