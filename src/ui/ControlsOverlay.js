/**
 * ControlsOverlay.js
 * Comprehensive interactive control bar and environmental settings panel.
 */
import { soundManager } from '../audio/SoundManager.js';

export class ControlsOverlay {
  constructor(sim, sceneManager) {
    this.sim = sim;
    this.sceneManager = sceneManager;
    this.container = document.getElementById('controls-overlay');

    this.init();
  }

  init() {
    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Top Bar -->
      <header class="top-nav">
        <div class="brand-group">
          <img src="./assets/favicon.svg" alt="SolarSaver Logo" class="brand-logo" />
          <div>
            <h1 class="brand-title">SolarSaver-SS</h1>
            <p class="brand-subtitle">Estación Solar Portátil de Emergencia (40×20×30 cm)</p>
          </div>
        </div>

        <div class="top-actions">
          <div id="xr-controls-container"></div>
          
          <button id="btn-blueprint" class="btn btn-secondary" title="Ver plano técnico y STL de referencia">
            📐 Plano Técnico & STL
          </button>

          <button id="btn-sound" class="btn btn-icon" title="Sonido">
            🔊
          </button>

          <div class="zoom-group">
            <button id="btn-zoom-in" class="btn btn-icon" title="Acercar">+</button>
            <button id="btn-zoom-out" class="btn btn-icon" title="Alejar">−</button>
          </div>
        </div>
      </header>

      <!-- View Preset Navigation Bar (Bottom Center) -->
      <div class="view-preset-bar">
        <span class="preset-label">VISTAS:</span>
        <button class="preset-btn active" data-view="isometric">Isometric 3D</button>
        <button class="preset-btn" data-view="frontal">Vista Frontal</button>
        <button class="preset-btn" data-view="lateral">Vista Lateral</button>
        <button class="preset-btn" data-view="superior">Vista Superior</button>
        <button class="preset-btn" data-view="bandeja">Bandeja Celulares</button>
        <button class="preset-btn" data-view="panel">Panel Solar</button>
      </div>

      <!-- Action Floating Bar (Left Center) -->
      <div class="action-sidebar">
        <div class="action-card">
          <div class="action-header">⚡ CONTROL DE HARDWARE</div>

          <button id="btn-toggle-power" class="btn btn-primary btn-block">
            <span id="power-icon">🔴</span> <span id="power-text">Encender Estación</span>
          </button>

          <button id="btn-toggle-drawer" class="btn btn-outline btn-block">
            🗄️ <span id="drawer-text">Abrir Bandeja</span>
          </button>

          <div class="phone-toggle-row">
            <button id="btn-toggle-phone-a" class="btn btn-compact">
              📱 Celular A: <strong id="phone-a-state">En Bandeja</strong>
            </button>
            <button id="btn-toggle-phone-b" class="btn btn-compact">
              📱 Celular B: <strong id="phone-b-state">En Bandeja</strong>
            </button>
          </div>

          <button id="btn-toggle-ac" class="btn btn-outline btn-block">
            🔌 <span id="ac-text">Tomas 120V: Inactivas</span>
          </button>
        </div>

        <!-- Solar & Sun Controls Accordion -->
        <div class="action-card solar-control-card">
          <div class="action-header">☀️ SIMULACIÓN SOLAR & CLIMA</div>

          <div class="control-row">
            <div class="label-with-val">
              <span>Posición del Sol (Hora):</span>
              <strong id="time-val">12:30</strong>
            </div>
            <input type="range" id="slider-time" min="6.0" max="18.0" step="0.25" value="12.5" class="custom-slider" />
          </div>

          <div class="control-row">
            <div class="label-with-val">
              <span>Nubosidad atmosférica:</span>
              <strong id="cloud-val">15%</strong>
            </div>
            <input type="range" id="slider-cloud" min="0" max="100" step="5" value="15" class="custom-slider" />
          </div>

          <div class="control-row">
            <div class="label-with-val">
              <span>Inclinación Panel Solar:</span>
              <strong id="tilt-val">45°</strong>
            </div>
            <input type="range" id="slider-tilt" min="10" max="85" step="1" value="45" class="custom-slider" />
          </div>

          <div class="control-row">
            <div class="label-with-val">
              <span>Orientación (Azimut):</span>
              <strong id="azimuth-val">180° (Sur)</strong>
            </div>
            <input type="range" id="slider-azimuth" min="0" max="360" step="5" value="180" class="custom-slider" />
          </div>

          <button id="btn-auto-align" class="btn btn-accent btn-block">
            🎯 Alinear Panel con el Sol
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.sim.subscribe(s => this.updateUI(s));
  }

  bindEvents() {
    // 1. Power Switch
    const btnPower = document.getElementById('btn-toggle-power');
    if (btnPower) {
      btnPower.addEventListener('click', () => {
        const nextState = !this.sim.powerOn;
        this.sim.togglePower();
        soundManager.playSwitch(nextState);
      });
    }

    // 2. Drawer Toggle
    const btnDrawer = document.getElementById('btn-toggle-drawer');
    if (btnDrawer) {
      btnDrawer.addEventListener('click', () => {
        const nextOpen = !this.sim.drawerOpen;
        this.sim.toggleDrawer();
        soundManager.playDrawer(nextOpen);
      });
    }

    // 3. Phones
    const btnPhoneA = document.getElementById('btn-toggle-phone-a');
    if (btnPhoneA) {
      btnPhoneA.addEventListener('click', () => {
        const willBePresent = !this.sim.phones.phoneA.present;
        this.sim.togglePhone('phoneA');
        if (willBePresent) soundManager.playPhoneConnect();
        else soundManager.playPhoneDisconnect();
      });
    }

    const btnPhoneB = document.getElementById('btn-toggle-phone-b');
    if (btnPhoneB) {
      btnPhoneB.addEventListener('click', () => {
        const willBePresent = !this.sim.phones.phoneB.present;
        this.sim.togglePhone('phoneB');
        if (willBePresent) soundManager.playPhoneConnect();
        else soundManager.playPhoneDisconnect();
      });
    }

    // 4. AC 120V
    const btnAC = document.getElementById('btn-toggle-ac');
    if (btnAC) {
      btnAC.addEventListener('click', () => {
        this.sim.toggleAC120V();
        soundManager.playBeep();
      });
    }

    // 5. Camera View presets
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const viewName = btn.dataset.view;
        this.sceneManager.setCameraPreset(viewName, true);
        soundManager.playBeep();
      });
    });

    // 6. Zoom Buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.sceneManager.zoom(0.85);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.sceneManager.zoom(1.15);
    });

    // 7. Sound Toggle
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isEnabled = soundManager.toggleMute();
        btnSound.textContent = isEnabled ? '🔊' : '🔇';
      });
    }

    // 8. Solar sliders
    const sliderTime = document.getElementById('slider-time');
    const timeVal = document.getElementById('time-val');
    if (sliderTime && timeVal) {
      sliderTime.addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        this.sim.setTimeOfDay(val);
        const hrs = Math.floor(val);
        const mins = Math.round((val - hrs) * 60);
        timeVal.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      });
    }

    const sliderCloud = document.getElementById('slider-cloud');
    const cloudVal = document.getElementById('cloud-val');
    if (sliderCloud && cloudVal) {
      sliderCloud.addEventListener('input', e => {
        const val = parseInt(e.target.value, 10);
        this.sim.setCloudCover(val / 100);
        cloudVal.textContent = `${val}%`;
      });
    }

    const sliderTilt = document.getElementById('slider-tilt');
    const tiltVal = document.getElementById('tilt-val');
    const sliderAzimuth = document.getElementById('slider-azimuth');
    const azimuthVal = document.getElementById('azimuth-val');

    if (sliderTilt && tiltVal) {
      sliderTilt.addEventListener('input', e => {
        const tilt = parseInt(e.target.value, 10);
        const az = parseInt(sliderAzimuth.value, 10);
        this.sim.setPanelOrientation(tilt, az);
        tiltVal.textContent = `${tilt}°`;
      });
    }

    if (sliderAzimuth && azimuthVal) {
      sliderAzimuth.addEventListener('input', e => {
        const az = parseInt(e.target.value, 10);
        const tilt = parseInt(sliderTilt.value, 10);
        this.sim.setPanelOrientation(tilt, az);
        const cardinal = az >= 337.5 || az < 22.5 ? 'Norte' : (az < 67.5 ? 'NE' : (az < 112.5 ? 'Este' : (az < 157.5 ? 'SE' : (az < 202.5 ? 'Sur' : (az < 247.5 ? 'SO' : (az < 292.5 ? 'Oeste' : 'NO'))))));
        azimuthVal.textContent = `${az}° (${cardinal})`;
      });
    }

    // 9. Auto-align panel
    document.getElementById('btn-auto-align')?.addEventListener('click', () => {
      this.sim.alignPanelToSun();
      soundManager.playBeep();
      // Update sliders
      if (sliderTilt && tiltVal) {
        sliderTilt.value = this.sim.panelTilt;
        tiltVal.textContent = `${this.sim.panelTilt}°`;
      }
      if (sliderAzimuth && azimuthVal) {
        sliderAzimuth.value = this.sim.panelAzimuth;
        azimuthVal.textContent = `${this.sim.panelAzimuth}°`;
      }
    });

    // 10. Blueprint Modal Trigger
    document.getElementById('btn-blueprint')?.addEventListener('click', () => {
      const modal = document.getElementById('technical-modal');
      if (modal) {
        modal.classList.add('modal-open');
        soundManager.playBeep();
      }
    });
  }

  updateUI(s) {
    // Power button
    const btnPower = document.getElementById('btn-toggle-power');
    const powerIcon = document.getElementById('power-icon');
    const powerText = document.getElementById('power-text');
    if (btnPower && powerIcon && powerText) {
      if (s.powerOn) {
        btnPower.className = 'btn btn-danger btn-block';
        powerIcon.textContent = '🟢';
        powerText.textContent = 'Apagar Estación';
      } else {
        btnPower.className = 'btn btn-primary btn-block';
        powerIcon.textContent = '🔴';
        powerText.textContent = 'Encender Estación';
      }
    }

    // Drawer button
    const drawerText = document.getElementById('drawer-text');
    if (drawerText) {
      drawerText.textContent = s.drawerOpen ? 'Cerrar Bandeja' : 'Abrir Bandeja';
    }

    // Phone buttons
    const phoneAState = document.getElementById('phone-a-state');
    if (phoneAState) {
      phoneAState.textContent = s.phones.phoneA.present ? 'Puesto' : 'Retirado';
      phoneAState.style.color = s.phones.phoneA.present ? '#38bdf8' : '#94a3b8';
    }

    const phoneBState = document.getElementById('phone-b-state');
    if (phoneBState) {
      phoneBState.textContent = s.phones.phoneB.present ? 'Puesto' : 'Retirado';
      phoneBState.style.color = s.phones.phoneB.present ? '#38bdf8' : '#94a3b8';
    }

    // AC 120V button
    const acText = document.getElementById('ac-text');
    const btnAC = document.getElementById('btn-toggle-ac');
    if (acText && btnAC) {
      if (s.ac120VActive) {
        btnAC.className = 'btn btn-warning btn-block';
        acText.textContent = 'Tomas 120V: ACTIVAS (35W)';
      } else {
        btnAC.className = 'btn btn-outline btn-block';
        acText.textContent = 'Tomas 120V: Inactivas';
      }
    }
  }
}
