/**
 * ControlsOverlay.js
 * Comprehensive interactive control bar with VR toggle for Meta Quest,
 * time acceleration, phone battery level selectors, and camera presets.
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
            <div class="brand-title-row">
              <h1 class="brand-title">SolarSaver-SS</h1>
              <span id="vr-mode-badge" class="badge badge-vr" style="display: none;">🥽 MODO VR ACTIVO</span>
            </div>
            <p class="brand-subtitle">Estación Solar de Emergencia 3D • Entorno Exterior y Realidad Virtual</p>
          </div>
        </div>

        <div class="top-actions">
          <!-- Button to switch between Normal Game View and Meta Quest VR View -->
          <button id="btn-toggle-vr" class="btn btn-vr" title="Cambiar entre Vista Normal de Juego y Modo VR para gafas META Quest">
            🥽 Modo VR (Meta Quest)
          </button>
          
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

      <!-- VR Information Banner -->
      <div id="vr-banner" class="vr-banner">
        <div class="vr-banner-content">
          <span class="vr-banner-icon">🥽</span>
          <div>
            <strong>MODO REALIDAD VIRTUAL ACTIVADO (META QUEST)</strong>
            <p>Puesto de visión a escala humana 1:1. Para experimentar en tus gafas <strong>Meta Quest 2 / 3 / Pro</strong>, abre esta página en el navegador <em>Meta Quest Browser</em>. Utiliza el gatillo del mando táctil para interactuar con los botones, la bandeja y los celulares mediante puntero láser.</p>
          </div>
          <button id="btn-exit-vr-banner" class="btn btn-compact btn-secondary">Salir de VR</button>
        </div>
      </div>

      <!-- View Preset Navigation Bar (Bottom Center) -->
      <div class="view-preset-bar">
        <span class="preset-label">VISTAS:</span>
        <button class="preset-btn active" data-view="isometric">Isometric 3D</button>
        <button class="preset-btn" data-view="frontal">Vista Frontal</button>
        <button class="preset-btn" data-view="lateral">Vista Lateral</button>
        <button class="preset-btn" data-view="superior">Vista Superior</button>
        <button class="preset-btn" data-view="bandeja">Bandeja Celulares</button>
        <button class="preset-btn" data-view="panel">Panel Solar</button>
        <button class="preset-btn" data-view="casa">🏡 Casa de Fondo</button>
      </div>

      <!-- Action Floating Sidebar (Left Center) -->
      <div class="action-sidebar">
        <!-- 1. Hardware Controls Card -->
        <div class="action-card">
          <div class="action-header">⚡ HARDWARE & DISPOSITIVOS</div>

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

        <!-- 2. Phone Battery Level Selection Card -->
        <div class="action-card battery-adjust-card">
          <div class="action-header">🔋 SELECCIONAR CARGA ACTUAL DE CELULARES</div>
          
          <!-- Phone A Battery Slider -->
          <div class="control-row">
            <div class="label-with-val">
              <span>📱 Batería Celular A:</span>
              <strong id="phone-a-pct-val" class="text-cyan">35%</strong>
            </div>
            <input type="range" id="slider-phone-a" min="0" max="100" step="1" value="35" class="custom-slider" />
            <div class="quick-preset-row">
              <button class="preset-chip" data-phone="phoneA" data-pct="10">10%</button>
              <button class="preset-chip" data-phone="phoneA" data-pct="50">50%</button>
              <button class="preset-chip" data-phone="phoneA" data-pct="85">85%</button>
              <button class="preset-chip" data-phone="phoneA" data-pct="100">100%</button>
            </div>
          </div>

          <!-- Phone B Battery Slider -->
          <div class="control-row">
            <div class="label-with-val">
              <span>📱 Batería Celular B:</span>
              <strong id="phone-b-pct-val" class="text-cyan">58%</strong>
            </div>
            <input type="range" id="slider-phone-b" min="0" max="100" step="1" value="58" class="custom-slider" />
            <div class="quick-preset-row">
              <button class="preset-chip" data-phone="phoneB" data-pct="15">15%</button>
              <button class="preset-chip" data-phone="phoneB" data-pct="50">50%</button>
              <button class="preset-chip" data-phone="phoneB" data-pct="85">85%</button>
              <button class="preset-chip" data-phone="phoneB" data-pct="100">100%</button>
            </div>
          </div>

          <!-- Station Battery Slider -->
          <div class="control-row station-battery-row">
            <div class="label-with-val">
              <span>🧰 Batería Estación Solar:</span>
              <strong id="station-pct-val" class="text-amber">85%</strong>
            </div>
            <input type="range" id="slider-station" min="5" max="100" step="1" value="85" class="custom-slider" />
          </div>
        </div>

        <!-- 3. Time Acceleration & Day/Night Progression Card -->
        <div class="action-card time-accel-card">
          <div class="action-header">⏩ ACELERADOR DE TIEMPO REAL</div>
          
          <div class="speed-btn-group">
            <button class="speed-btn active" data-speed="1">1×</button>
            <button class="speed-btn" data-speed="5">5×</button>
            <button class="speed-btn" data-speed="20">20×</button>
            <button class="speed-btn" data-speed="60">60×</button>
            <button class="speed-btn" data-speed="120">120×</button>
          </div>

          <button id="btn-auto-day" class="btn btn-outline btn-block">
            🔄 <span id="auto-day-text">Iniciar Ciclo Solar Continuo</span>
          </button>
        </div>

        <!-- 4. Solar & Environmental Settings Card -->
        <div class="action-card solar-control-card">
          <div class="action-header">☀️ ILUMINACIÓN SOLAR & ORIENTACIÓN</div>

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
    // 1. VR Mode Toggle Button (Switches between Normal and Meta Quest VR)
    const btnVR = document.getElementById('btn-toggle-vr');
    btnVR?.addEventListener('click', () => {
      this.sceneManager.toggleVRMode();
    });

    const btnExitVR = document.getElementById('btn-exit-vr-banner');
    btnExitVR?.addEventListener('click', () => {
      this.sceneManager.toggleVRMode();
    });

    // 2. Power Switch
    document.getElementById('btn-toggle-power')?.addEventListener('click', () => {
      const nextState = !this.sim.powerOn;
      this.sim.togglePower();
      soundManager.playSwitch(nextState);
    });

    // 3. Drawer Toggle
    document.getElementById('btn-toggle-drawer')?.addEventListener('click', () => {
      const nextOpen = !this.sim.drawerOpen;
      this.sim.toggleDrawer();
      soundManager.playDrawer(nextOpen);
    });

    // 4. Phones Toggles
    document.getElementById('btn-toggle-phone-a')?.addEventListener('click', () => {
      const willBePresent = !this.sim.phones.phoneA.present;
      this.sim.togglePhone('phoneA');
      if (willBePresent) soundManager.playPhoneConnect();
      else soundManager.playPhoneDisconnect();
    });

    document.getElementById('btn-toggle-phone-b')?.addEventListener('click', () => {
      const willBePresent = !this.sim.phones.phoneB.present;
      this.sim.togglePhone('phoneB');
      if (willBePresent) soundManager.playPhoneConnect();
      else soundManager.playPhoneDisconnect();
    });

    // 5. AC 120V
    document.getElementById('btn-toggle-ac')?.addEventListener('click', () => {
      this.sim.toggleAC120V();
      soundManager.playBeep();
    });

    // 6. Phone Battery Sliders
    const sliderPhoneA = document.getElementById('slider-phone-a');
    sliderPhoneA?.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      this.sim.setPhoneBatteryPct('phoneA', val);
    });

    const sliderPhoneB = document.getElementById('slider-phone-b');
    sliderPhoneB?.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      this.sim.setPhoneBatteryPct('phoneB', val);
    });

    // Station Battery Slider
    const sliderStation = document.getElementById('slider-station');
    sliderStation?.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      this.sim.setStationBatteryPct(val);
    });

    // Quick chips for phone levels
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const phone = chip.dataset.phone;
        const pct = parseInt(chip.dataset.pct, 10);
        this.sim.setPhoneBatteryPct(phone, pct);
        soundManager.playBeep();
      });
    });

    // 7. Time Acceleration Buttons
    const speedButtons = document.querySelectorAll('.speed-btn');
    speedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        speedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.dataset.speed);
        this.sim.setTimeMultiplier(speed);
        soundManager.playBeep();
      });
    });

    // Continuous Day Cycle Toggle
    const btnAutoDay = document.getElementById('btn-auto-day');
    btnAutoDay?.addEventListener('click', () => {
      this.sim.toggleAutoProgressDay();
      soundManager.playBeep();
    });

    // 8. Camera View presets
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

    // 9. Zoom Buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.sceneManager.zoom(0.85);
    });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.sceneManager.zoom(1.15);
    });

    // 10. Sound Toggle
    const btnSound = document.getElementById('btn-sound');
    btnSound?.addEventListener('click', () => {
      const isEnabled = soundManager.toggleMute();
      btnSound.textContent = isEnabled ? '🔊' : '🔇';
    });

    // 11. Solar sliders
    const sliderTime = document.getElementById('slider-time');
    const timeVal = document.getElementById('time-val');
    sliderTime?.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      this.sim.setTimeOfDay(val);
      const hrs = Math.floor(val);
      const mins = Math.round((val - hrs) * 60);
      if (timeVal) timeVal.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    });

    const sliderCloud = document.getElementById('slider-cloud');
    sliderCloud?.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      this.sim.setCloudCover(val / 100);
      const cloudVal = document.getElementById('cloud-val');
      if (cloudVal) cloudVal.textContent = `${val}%`;
    });

    const sliderTilt = document.getElementById('slider-tilt');
    const sliderAzimuth = document.getElementById('slider-azimuth');

    sliderTilt?.addEventListener('input', e => {
      const tilt = parseInt(e.target.value, 10);
      const az = parseInt(sliderAzimuth.value, 10);
      this.sim.setPanelOrientation(tilt, az);
    });

    sliderAzimuth?.addEventListener('input', e => {
      const az = parseInt(e.target.value, 10);
      const tilt = parseInt(sliderTilt.value, 10);
      this.sim.setPanelOrientation(tilt, az);
    });

    // Auto-align panel
    document.getElementById('btn-auto-align')?.addEventListener('click', () => {
      this.sim.alignPanelToSun();
      soundManager.playBeep();
    });

    // Blueprint Modal Trigger
    document.getElementById('btn-blueprint')?.addEventListener('click', () => {
      const modal = document.getElementById('technical-modal');
      modal?.classList.add('modal-open');
      soundManager.playBeep();
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

    // Phone state labels
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

    // Phone percentage sliders and labels
    const phoneAPctVal = document.getElementById('phone-a-pct-val');
    const sliderPhoneA = document.getElementById('slider-phone-a');
    if (phoneAPctVal && sliderPhoneA) {
      const pA = Math.round(s.phones.phoneA.batteryPct);
      phoneAPctVal.textContent = `${pA}% ${s.phones.phoneA.active ? '⚡' : ''}`;
      if (document.activeElement !== sliderPhoneA) {
        sliderPhoneA.value = pA;
      }
    }

    const phoneBPctVal = document.getElementById('phone-b-pct-val');
    const sliderPhoneB = document.getElementById('slider-phone-b');
    if (phoneBPctVal && sliderPhoneB) {
      const pB = Math.round(s.phones.phoneB.batteryPct);
      phoneBPctVal.textContent = `${pB}% ${s.phones.phoneB.active ? '⚡' : ''}`;
      if (document.activeElement !== sliderPhoneB) {
        sliderPhoneB.value = pB;
      }
    }

    // Station battery slider
    const stationPctVal = document.getElementById('station-pct-val');
    const sliderStation = document.getElementById('slider-station');
    if (stationPctVal && sliderStation) {
      stationPctVal.textContent = `${s.batterySoCPct}% (${s.batteryVoltage.toFixed(1)}V)`;
      if (document.activeElement !== sliderStation) {
        sliderStation.value = s.batterySoCPct;
      }
    }

    // Auto day cycle button text
    const autoDayText = document.getElementById('auto-day-text');
    if (autoDayText) {
      autoDayText.textContent = s.autoProgressDay ? 'Pausar Ciclo Solar (En marcha)' : 'Iniciar Ciclo Solar Continuo';
    }

    // Solar sliders
    const sliderTime = document.getElementById('slider-time');
    const timeVal = document.getElementById('time-val');
    if (sliderTime && timeVal) {
      if (document.activeElement !== sliderTime) {
        sliderTime.value = s.timeOfDay;
      }
      const hrs = Math.floor(s.timeOfDay);
      const mins = Math.round((s.timeOfDay - hrs) * 60);
      timeVal.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    const tiltVal = document.getElementById('tilt-val');
    const sliderTilt = document.getElementById('slider-tilt');
    if (tiltVal && sliderTilt) {
      tiltVal.textContent = `${s.panelTilt}°`;
      if (document.activeElement !== sliderTilt) sliderTilt.value = s.panelTilt;
    }

    const azimuthVal = document.getElementById('azimuth-val');
    const sliderAzimuth = document.getElementById('slider-azimuth');
    if (azimuthVal && sliderAzimuth) {
      const az = s.panelAzimuth;
      const cardinal = az >= 337.5 || az < 22.5 ? 'Norte' : (az < 67.5 ? 'NE' : (az < 112.5 ? 'Este' : (az < 157.5 ? 'SE' : (az < 202.5 ? 'Sur' : (az < 247.5 ? 'SO' : (az < 292.5 ? 'Oeste' : 'NO'))))));
      azimuthVal.textContent = `${az}° (${cardinal})`;
      if (document.activeElement !== sliderAzimuth) sliderAzimuth.value = az;
    }

    // AC 120V button
    const acText = document.getElementById('ac-text');
    const btnAC = document.getElementById('btn-toggle-ac');
    if (acText && btnAC) {
      if (s.ac120VActive) {
        btnAC.className = 'btn btn-warning btn-block';
        acText.textContent = 'Tomas 120V: ACTIVAS (45W)';
      } else {
        btnAC.className = 'btn btn-outline btn-block';
        acText.textContent = 'Tomas 120V: Inactivas';
      }
    }
  }
}
