/**
 * CableModel.js
 * Procedural flexible rubber cable connecting the Station to the external Solar Panel.
 */
import * as THREE from 'three';

export class CableModel {
  constructor(radius = 0.0045, segments = 32, radialSegments = 8) {
    this.radius = radius;
    this.segments = segments;
    this.radialSegments = radialSegments;

    this.group = new THREE.Group();
    this.group.name = 'ExternalSolarCable';

    this.material = new THREE.MeshStandardMaterial({
      color: 0x1f242b,
      roughness: 0.7,
      metalness: 0.1
    });

    this.mesh = null;
  }

  updateCurve(startWorldPos, endWorldPos) {
    // Generate natural catenary sag in the middle
    const midX = (startWorldPos.x + endWorldPos.x) * 0.5;
    const midZ = (startWorldPos.z + endWorldPos.z) * 0.5;
    
    // Sag down towards the floor/ground (Y=0.015)
    const dist = startWorldPos.distanceTo(endWorldPos);
    const sagY = Math.max(0.015, Math.min(startWorldPos.y, endWorldPos.y) - 0.08 - dist * 0.08);

    const cp1 = new THREE.Vector3(
      startWorldPos.x + (endWorldPos.x - startWorldPos.x) * 0.25,
      sagY,
      startWorldPos.z + (endWorldPos.z - startWorldPos.z) * 0.25
    );

    const cp2 = new THREE.Vector3(
      startWorldPos.x + (endWorldPos.x - startWorldPos.x) * 0.75,
      sagY,
      startWorldPos.z + (endWorldPos.z - startWorldPos.z) * 0.75
    );

    const curve = new THREE.CatmullRomCurve3([
      startWorldPos,
      cp1,
      new THREE.Vector3(midX, sagY, midZ),
      cp2,
      endWorldPos
    ]);

    const newGeo = new THREE.TubeGeometry(curve, this.segments, this.radius, this.radialSegments, false);

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = newGeo;
    } else {
      this.mesh = new THREE.Mesh(newGeo, this.material);
      this.mesh.castShadow = true;
      this.group.add(this.mesh);
    }
  }
}
