/**
 * InteractionManager.js
 * Raycasting and interactive picking for 3D elements in the SolarSaver-SS scene.
 */
import * as THREE from 'three';
import { soundManager } from '../audio/SoundManager.js';

export class InteractionManager {
  constructor(camera, scene, domElement, sim) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.sim = sim;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredObject = null;

    this.tooltipEl = document.getElementById('scene-tooltip');

    this.initEvents();
  }

  initEvents() {
    this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.domElement.addEventListener('pointerleave', this.onPointerLeave.bind(this));
  }

  onPointerMove(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.updateHover(event.clientX, event.clientY);
  }

  onPointerLeave() {
    this.mouse.set(-999, -999);
    this.hideTooltip();
    this.domElement.style.cursor = 'default';
  }

  updateHover(clientX, clientY) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    let found = null;
    for (const hit of intersects) {
      const match = this.findInteractiveAncestor(hit.object);
      if (match) {
        found = match;
        break;
      }
    }

    if (found) {
      this.domElement.style.cursor = 'pointer';
      this.showTooltip(found.info, clientX, clientY);
    } else {
      this.domElement.style.cursor = 'default';
      this.hideTooltip();
    }
  }

  onPointerDown(event) {
    // Only react to primary mouse button
    if (event.button !== 0) return;

    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      const match = this.findInteractiveAncestor(hit.object);
      if (match) {
        this.triggerAction(match.type);
        break;
      }
    }
  }

  findInteractiveAncestor(obj) {
    let curr = obj;
    while (curr && curr !== this.scene) {
      if (curr.name === 'InteractivePowerSwitch') {
        return {
          type: 'switch',
          info: { title: 'Interruptor Principal', desc: 'Click para encender/apagar' }
        };
      }
      if (curr.name === 'InteractiveDrawer' || curr.name === 'InteractiveDrawerHandle') {
        return {
          type: 'drawer',
          info: { title: 'Bandeja Deslizante', desc: 'Click para abrir/cerrar' }
        };
      }
      if (curr.name === 'Smartphone_phoneA' || (curr.parent && curr.parent.name === 'Smartphone_phoneA')) {
        return {
          type: 'phoneA',
          info: { title: 'Celular A (Bandeja Izq)', desc: 'Click para retirar/colocar' }
        };
      }
      if (curr.name === 'Smartphone_phoneB' || (curr.parent && curr.parent.name === 'Smartphone_phoneB')) {
        return {
          type: 'phoneB',
          info: { title: 'Celular B (Bandeja Der)', desc: 'Click para retirar/colocar' }
        };
      }
      if (curr.name === 'InteractiveSolarCells' || curr.name === 'ExternalSolarPanel' || curr.name === 'PanelPitchGroup') {
        return {
          type: 'solarPanel',
          info: { title: 'Panel Solar Externo (30x20 cm)', desc: 'Click para alinear con el Sol' }
        };
      }
      if (curr.name === 'InteractiveLCDLeft') {
        return {
          type: 'lcdLeft',
          info: { title: 'Pantalla LCD Entrada Solar', desc: 'Monitoreo MPPT y Batería (12.6V)' }
        };
      }
      if (curr.name === 'InteractiveLCDRight') {
        return {
          type: 'lcdRight',
          info: { title: 'Pantalla LCD Salidas', desc: 'Monitoreo de Carga AC/DC' }
        };
      }
      curr = curr.parent;
    }
    return null;
  }

  triggerAction(type) {
    switch (type) {
      case 'switch': {
        const nextState = !this.sim.powerOn;
        this.sim.togglePower();
        soundManager.playSwitch(nextState);
        break;
      }
      case 'drawer': {
        const nextOpen = !this.sim.drawerOpen;
        this.sim.toggleDrawer();
        soundManager.playDrawer(nextOpen);
        break;
      }
      case 'phoneA': {
        const willBePresent = !this.sim.phones.phoneA.present;
        this.sim.togglePhone('phoneA');
        if (willBePresent) soundManager.playPhoneConnect();
        else soundManager.playPhoneDisconnect();
        break;
      }
      case 'phoneB': {
        const willBePresent = !this.sim.phones.phoneB.present;
        this.sim.togglePhone('phoneB');
        if (willBePresent) soundManager.playPhoneConnect();
        else soundManager.playPhoneDisconnect();
        break;
      }
      case 'solarPanel': {
        this.sim.alignPanelToSun();
        soundManager.playBeep();
        break;
      }
      default:
        soundManager.playBeep();
        break;
    }
  }

  showTooltip(info, x, y) {
    if (!this.tooltipEl) return;
    this.tooltipEl.innerHTML = `<strong>${info.title}</strong><span>${info.desc}</span>`;
    this.tooltipEl.style.display = 'flex';
    this.tooltipEl.style.left = `${x + 14}px`;
    this.tooltipEl.style.top = `${y + 14}px`;
  }

  hideTooltip() {
    if (!this.tooltipEl) return;
    this.tooltipEl.style.display = 'none';
  }
}
