/**
 * SmartphoneModel.js
 * High-fidelity 3D model of a smartphone with an interactive screen display.
 */
import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

export class SmartphoneModel {
  constructor(phoneKey = 'phoneA', label = 'Smartphone A', color = 0x22262d) {
    this.phoneKey = phoneKey;
    this.label = label;
    this.group = new THREE.Group();
    this.group.name = `Smartphone_${phoneKey}`;

    // Dimensions: 15cm x 7.5cm x 0.85cm
    this.width = 0.075;
    this.length = 0.152;
    this.thickness = 0.0085;

    this.screenTextureObj = TextureFactory.createPhoneScreenTexture(label);

    this.initMesh(color);
  }

  initMesh(bodyColor) {
    // 1. Phone Body (Anodized Aluminum / Glass back)
    const bodyGeo = new THREE.BoxGeometry(this.width, this.thickness, this.length);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.3,
      metalness: 0.8
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.group.add(bodyMesh);

    // 2. Bezel / Front glass
    const glassGeo = new THREE.BoxGeometry(this.width * 0.98, 0.001, this.length * 0.98);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.1
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = this.thickness / 2 + 0.0005;
    this.group.add(glassMesh);

    // 3. Screen display plane with dynamic CanvasTexture
    const screenGeo = new THREE.PlaneGeometry(this.width * 0.92, this.length * 0.94);
    this.screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTextureObj.texture,
      toneMapped: false
    });
    const screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
    screenMesh.rotation.x = -Math.PI / 2;
    screenMesh.position.y = this.thickness / 2 + 0.001;
    screenMesh.name = `Screen_${this.phoneKey}`;
    this.group.add(screenMesh);

    // 4. Rear Camera Module bump
    const camGeo = new THREE.BoxGeometry(0.026, 0.002, 0.026);
    const camMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.9
    });
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(-this.width * 0.25, -this.thickness / 2 - 0.001, -this.length * 0.34);
    this.group.add(camMesh);

    // Camera lenses
    const lensGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.001, 16);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.1,
      metalness: 0.95
    });
    const lens1 = new THREE.Mesh(lensGeo, lensMat);
    lens1.position.set(-this.width * 0.25 - 0.006, -this.thickness / 2 - 0.002, -this.length * 0.34 - 0.006);
    this.group.add(lens1);

    const lens2 = new THREE.Mesh(lensGeo, lensMat);
    lens2.position.set(-this.width * 0.25 + 0.006, -this.thickness / 2 - 0.002, -this.length * 0.34 + 0.006);
    this.group.add(lens2);
  }

  update(phoneState, isPowered) {
    this.screenTextureObj.update(phoneState, isPowered);
  }
}
