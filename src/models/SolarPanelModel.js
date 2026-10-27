/**
 * SolarPanelModel.js
 * 3D representation of the 30cm x 20cm external solar panel with adjustable tilt/azimuth support.
 */
import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

export class SolarPanelModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'ExternalSolarPanel';

    // Blueprint dimensions: 20cm width x 30cm height
    this.width = 0.20;
    this.height = 0.30;
    this.thickness = 0.022;

    this.tiltAngle = 45; // degrees from ground
    this.azimuthAngle = 180; // degrees

    this.cellTexture = TextureFactory.createSolarCellTexture();

    this.initMesh();
  }

  initMesh() {
    // Base root position on the ground next to the main station
    // Placed at X = 0.45m, Z = 0.05m
    this.group.position.set(0.48, 0, 0.02);

    // Azimuth rotation group (yaw around Y axis)
    this.yawGroup = new THREE.Group();
    this.yawGroup.name = 'PanelYawGroup';
    this.group.add(this.yawGroup);

    // Ground base bracket (rests on table/ground)
    const baseGeo = new THREE.BoxGeometry(0.24, 0.012, 0.22);
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.6,
      metalness: 0.5
    });
    this.baseMesh = new THREE.Mesh(baseGeo, darkMetalMat);
    this.baseMesh.position.y = 0.006;
    this.baseMesh.receiveShadow = true;
    this.yawGroup.add(this.baseMesh);

    // Side support uprights (struts holding the pivots)
    const strutGeo = new THREE.BoxGeometry(0.014, 0.16, 0.02);
    const strutMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.7
    });

    const leftStrut = new THREE.Mesh(strutGeo, strutMat);
    leftStrut.position.set(-this.width / 2 - 0.012, 0.08, 0);
    this.yawGroup.add(leftStrut);

    const rightStrut = new THREE.Mesh(strutGeo, strutMat);
    rightStrut.position.set(this.width / 2 + 0.012, 0.08, 0);
    this.yawGroup.add(rightStrut);

    // Pivot height
    this.pivotY = 0.14;

    // Pitch group (tilts around local X axis)
    this.pitchGroup = new THREE.Group();
    this.pitchGroup.position.set(0, this.pivotY, 0);
    this.pitchGroup.name = 'PanelPitchGroup';
    this.yawGroup.add(this.pitchGroup);

    // Side pivot knobs
    const knobGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.014, 16);
    const knobMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8
    });

    const leftKnob = new THREE.Mesh(knobGeo, knobMat);
    leftKnob.rotation.z = Math.PI / 2;
    leftKnob.position.set(-this.width / 2 - 0.019, 0, 0);
    this.pitchGroup.add(leftKnob);

    const rightKnob = new THREE.Mesh(knobGeo, knobMat);
    rightKnob.rotation.z = Math.PI / 2;
    rightKnob.position.set(this.width / 2 + 0.019, 0, 0);
    this.pitchGroup.add(rightKnob);

    // Panel Outer Aluminum Frame
    const frameGeo = new THREE.BoxGeometry(this.width, this.height, this.thickness);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85
    });
    this.frameMesh = new THREE.Mesh(frameGeo, frameMat);
    this.frameMesh.castShadow = true;
    this.frameMesh.receiveShadow = true;
    this.pitchGroup.add(this.frameMesh);

    // Front Photovoltaic Cell Surface
    const cellGeo = new THREE.PlaneGeometry(this.width - 0.016, this.height - 0.016);
    this.cellMat = new THREE.MeshStandardMaterial({
      map: this.cellTexture,
      roughness: 0.2,
      metalness: 0.3
    });
    this.cellMesh = new THREE.Mesh(cellGeo, this.cellMat);
    // Face forward along +Z
    this.cellMesh.position.z = this.thickness / 2 + 0.001;
    this.cellMesh.name = 'InteractiveSolarCells';
    this.cellMesh.castShadow = true;
    this.pitchGroup.add(this.cellMesh);

    // Rear Kickstand Leg
    const legGeo = new THREE.BoxGeometry(0.015, 0.18, 0.01);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.7
    });
    this.rearLeg = new THREE.Mesh(legGeo, legMat);
    this.rearLeg.position.set(0, -0.06, -this.thickness / 2 - 0.04);
    this.rearLeg.rotation.x = 0.35;
    this.pitchGroup.add(this.rearLeg);

    // Junction box on the back bottom
    const jBoxGeo = new THREE.BoxGeometry(0.05, 0.04, 0.02);
    const jBoxMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8
    });
    const jBox = new THREE.Mesh(jBoxGeo, jBoxMat);
    jBox.position.set(0, -this.height * 0.35, -this.thickness / 2 - 0.01);
    this.pitchGroup.add(jBox);

    // Cable gland on junction box
    const glandGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.014, 12);
    const glandMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9
    });
    this.glandMesh = new THREE.Mesh(glandGeo, glandMat);
    this.glandMesh.position.set(0, -this.height * 0.35 - 0.025, -this.thickness / 2 - 0.01);
    this.pitchGroup.add(this.glandMesh);

    this.cableConnectPoint = new THREE.Object3D();
    this.cableConnectPoint.position.set(0, -this.height * 0.35 - 0.035, -this.thickness / 2 - 0.01);
    this.pitchGroup.add(this.cableConnectPoint);

    this.applyOrientation(this.tiltAngle, this.azimuthAngle);
  }

  applyOrientation(tiltDeg, azimuthDeg) {
    this.tiltAngle = tiltDeg;
    this.azimuthAngle = azimuthDeg;

    // Azimuth yaw (Three.js Y-rotation)
    // Azimuth 180 = South (+Z), 0 = North (-Z), 90 = East (+X), 270 = West (-X)
    const yawRad = ((azimuthDeg - 180) * Math.PI) / 180;
    this.yawGroup.rotation.y = -yawRad;

    // Tilt pitch (X-rotation)
    // 90 deg tilt = vertical (facing forward)
    // 0 deg tilt = horizontal (facing straight up)
    const pitchRad = ((90 - tiltDeg) * Math.PI) / 180;
    this.pitchGroup.rotation.x = -pitchRad;
  }

  getPanelNormal() {
    const normal = new THREE.Vector3(0, 0, 1);
    this.cellMesh.getWorldDirection(normal);
    return normal;
  }

  getCableConnectionWorldPos() {
    const worldPos = new THREE.Vector3();
    this.cableConnectPoint.getWorldPosition(worldPos);
    return worldPos;
  }
}
