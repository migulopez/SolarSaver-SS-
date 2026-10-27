/**
 * VRTabletModel.js
 * A floating 3D tactical tablet in VR displaying live telemetry, solar generation,
 * and battery status inside the Meta Quest headset.
 */
import * as THREE from 'three';

export class VRTabletModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'VRTelemetryTablet';

    // Position floating slightly to the left of the table at comfortable eye height
    this.group.position.set(-0.55, 0.38, 0.15);
    this.group.rotation.set(-0.25, 0.45, 0.1);

    this.initMesh();
  }

  initMesh() {
    // 1. Tablet Body (Bezel)
    const bodyGeo = new THREE.BoxGeometry(0.38, 0.24, 0.012);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.group.add(bodyMesh);

    // Bumper edges
    const rimGeo = new THREE.BoxGeometry(0.39, 0.25, 0.008);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.7
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.z = -0.003;
    this.group.add(rimMesh);

    // 2. Dynamic Screen Canvas Texture
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 320;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    const screenGeo = new THREE.PlaneGeometry(0.36, 0.22);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.texture,
      toneMapped: false
    });
    this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.screenMesh.position.z = 0.007;
    this.group.add(this.screenMesh);

    this.drawDefault();
  }

  drawDefault() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, 512, 320);
    this.texture.needsUpdate = true;
  }

  update(state) {
    const ctx = this.ctx;
    const w = 512;
    const h = 320;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#091528');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Title / Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🥽 META QUEST VR • TELEMETRÍA', 18, 34);

    ctx.fillStyle = state.powerOn ? '#4ade80' : '#f87171';
    ctx.textAlign = 'right';
    ctx.fillText(state.powerOn ? '● OPERATIVO' : '○ APAGADO', w - 18, 34);

    // Main Battery Section
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${state.batteryVoltage.toFixed(1)}V (${state.batterySoCPct}%)`, 18, 85);

    // Battery bar
    const barW = w - 36;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(18, 102, barW, 14);
    ctx.fillStyle = state.batterySoCPct > 20 ? '#38bdf8' : '#ef4444';
    ctx.fillRect(18, 102, (barW * state.batterySoCPct) / 100, 14);

    // Grid of metrics
    ctx.font = '19px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`☀️ Solar IN: ${state.solarWatts}W`, 18, 155);
    ctx.fillText(`⚡ Carga OUT: ${state.totalLoadWatts}W`, 18, 188);
    ctx.fillText(`⚖️ Neto: ${state.netWatts > 0 ? '+' : ''}${state.netWatts}W`, 18, 221);

    // Phones
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`📱 Celular A: ${Math.round(state.phones.phoneA.batteryPct)}% ${state.phones.phoneA.active ? '⚡' : ''}`, 270, 155);
    ctx.fillText(`📱 Celular B: ${Math.round(state.phones.phoneB.batteryPct)}% ${state.phones.phoneB.active ? '⚡' : ''}`, 270, 188);
    ctx.fillText(`⏱️ ${state.timeMultiplier}× vel`, 270, 221);

    // Footer tip for Meta Quest
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Apunta el mando y pulsa el gatillo para interactuar', w / 2, 290);

    this.texture.needsUpdate = true;
  }
}
