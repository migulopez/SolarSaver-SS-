/**
 * EnvironmentManager.js
 * Manages dynamic sun position, sky dome, directional shadows, and realistic ground environment.
 */
import * as THREE from 'three';

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;

    this.initLights();
    this.initGround();
    this.initSunVisual();
  }

  initLights() {
    // Hemispheric Ambient Light (Sky/Ground color gradient)
    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.7);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Directional Sunlight with soft shadows
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 10;
    this.sunLight.shadow.camera.left = -0.6;
    this.sunLight.shadow.camera.right = 0.8;
    this.sunLight.shadow.camera.top = 0.6;
    this.sunLight.shadow.camera.bottom = -0.6;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Soft fill light from front-left
    this.fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    this.fillLight.position.set(-1.0, 0.8, 1.2);
    this.scene.add(this.fillLight);
  }

  initGround() {
    // Ground platform / workbench
    const groundGeo = new THREE.PlaneGeometry(16, 16);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = 0;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Subtle tactical measurement grid
    const gridHelper = new THREE.GridHelper(4, 40, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.001;
    this.scene.add(gridHelper);

    // Circular base pad for station
    const padGeo = new THREE.RingGeometry(0.02, 0.48, 64);
    const padMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.002;
    this.scene.add(pad);
  }

  initSunVisual() {
    // Glowing Sun sphere in the sky
    const sunGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff3a1,
      toneMapped: false
    });
    this.sunSphere = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunSphere);

    // Sun corona flare ring
    const flareGeo = new THREE.RingGeometry(0.13, 0.35, 32);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xffb703,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.sunFlare = new THREE.Mesh(flareGeo, flareMat);
    this.sunSphere.add(this.sunFlare);
  }

  updateSun(sunPos, cloudCover) {
    const sunDist = 3.2; // distance from origin
    const sx = sunPos.direction.x * sunDist;
    const sy = sunPos.direction.y * sunDist;
    const sz = sunPos.direction.z * sunDist;

    this.sunLight.position.set(sx, sy, sz);
    this.sunSphere.position.set(sx, sy, sz);
    this.sunSphere.lookAt(0, 0, 0);

    // Adjust lighting color & intensity based on elevation & cloud cover
    if (!sunPos.isDaylight || sy <= 0.02) {
      // Night / Dark twilight
      this.sunLight.intensity = 0.05;
      this.sunLight.color.setHex(0x38bdf8);
      this.hemiLight.intensity = 0.25;
      this.hemiLight.color.setHex(0x0f172a);
      this.sunSphere.visible = false;
      this.scene.background = new THREE.Color(0x030712);
    } else {
      this.sunSphere.visible = true;
      const elevNorm = Math.min(1.0, sy / 2.5);

      // Cloud factor
      const cloudFactor = 1.0 - cloudCover * 0.7;
      this.sunLight.intensity = (0.6 + elevNorm * 1.6) * cloudFactor;

      // Golden hour vs High noon tint
      if (sunPos.elevation < 20) {
        this.sunLight.color.setHex(0xfb923c); // Warm amber
        this.scene.background = new THREE.Color(0x181e2b);
      } else {
        this.sunLight.color.setHex(0xffffff); // Bright daylight
        this.scene.background = new THREE.Color(0x0a0f1d);
      }

      this.hemiLight.intensity = (0.4 + elevNorm * 0.5) * (1 - cloudCover * 0.4);
    }
  }
}
