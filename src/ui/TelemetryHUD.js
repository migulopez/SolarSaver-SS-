/**
 * TelemetryHUD.js
 * Heads-Up Display showing real-time electrical, battery, and solar metrics.
 */

export class TelemetryHUD {
  constructor(sim) {
    this.sim = sim;
    this.el = document.getElementById('telemetry-hud');
    this.init();
  }

  init() {
    this.sim.subscribe(state => this.render(state));
  }

  render(s) {
    if (!this.el) return;

    const netClass = s.netWatts > 0 ? 'text-green' : (s.netWatts < 0 ? 'text-amber' : 'text-slate');
    const netSign = s.netWatts > 0 ? '+' : '';

    this.el.innerHTML = `
      <div class="hud-card">
        <div class="hud-header">
          <div class="hud-title">
            <span class="status-dot ${s.powerOn ? 'dot-active' : 'dot-off'}"></span>
            <span>ESTADO DEL SISTEMA</span>
          </div>
          <span class="badge ${s.powerOn ? 'badge-online' : 'badge-standby'}">
            ${s.powerOn ? 'OPERATIVO' : 'APAGADO'}
          </span>
        </div>

        <!-- Battery Gauge -->
        <div class="gauge-section">
          <div class="gauge-row">
            <span class="gauge-label">Batería Principal (3S Li-ion)</span>
            <span class="gauge-value">${s.batteryVoltage.toFixed(2)} V</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${s.batterySoCPct}%; background: ${s.batterySoCPct > 20 ? 'linear-gradient(90deg, #0284c7, #38bdf8)' : '#ef4444'};"></div>
          </div>
          <div class="gauge-subrow">
            <span>Nivel: <strong>${s.batterySoCPct}%</strong> (${(s.batterySoC * 150).toFixed(0)} Wh)</span>
            <span class="text-secondary">${s.timeEstimateStr}</span>
          </div>
        </div>

        <!-- Flow Grid -->
        <div class="metrics-grid">
          <!-- Solar In -->
          <div class="metric-box">
            <div class="metric-title">☀️ ENTRADA SOLAR</div>
            <div class="metric-val text-cyan">${s.solarWatts} <span class="unit">W</span></div>
            <div class="metric-sub">${s.solarIrradiance} W/m² | Inc: ${Math.round(s.angleOfIncidenceDeg)}°</div>
          </div>

          <!-- Total Load Out -->
          <div class="metric-box">
            <div class="metric-title">⚡ CONSUMO CARGA</div>
            <div class="metric-val text-amber">${s.totalLoadWatts} <span class="unit">W</span></div>
            <div class="metric-sub">Teléfonos: ${(s.phones.phoneA.active ? 12 : 0) + (s.phones.phoneB.active ? 12 : 0)}W | 120V: ${s.ac120VActive ? 35 : 0}W</div>
          </div>

          <!-- Net Balance -->
          <div class="metric-box col-span-2">
            <div class="metric-title">⚖️ BALANCE NETO EN TIEMPO REAL</div>
            <div class="metric-val ${netClass}">${netSign}${s.netWatts} <span class="unit">W</span></div>
            <div class="metric-sub">
              ${s.netWatts > 0 ? '🟢 Batería recargándose desde el panel solar' : (s.netWatts < 0 ? '🟠 Batería entregando energía a los dispositivos' : '⚪ Consumo y generación equilibrados')}
            </div>
          </div>
        </div>

        <!-- Phone Charging Status In Drawer -->
        <div class="drawer-status-box">
          <div class="drawer-status-header">
            <span>📱 BANDEJA INFERIOR:</span>
            <span class="text-secondary">${s.drawerOpen ? 'Abierta' : 'Cerrada'}</span>
          </div>
          <div class="phone-status-row">
            <div class="phone-item">
              <span class="phone-dot ${s.phones.phoneA.active ? 'dot-charging' : (s.phones.phoneA.present ? 'dot-idle' : 'dot-none')}"></span>
              <span>Celular A: <strong>${s.phones.phoneA.present ? `${Math.round(s.phones.phoneA.batteryPct)}% ${s.phones.phoneA.active ? '⚡ Carga' : ''}` : 'No colocado'}</strong></span>
            </div>
            <div class="phone-item">
              <span class="phone-dot ${s.phones.phoneB.active ? 'dot-charging' : (s.phones.phoneB.present ? 'dot-idle' : 'dot-none')}"></span>
              <span>Celular B: <strong>${s.phones.phoneB.present ? `${Math.round(s.phones.phoneB.batteryPct)}% ${s.phones.phoneB.active ? '⚡ Carga' : ''}` : 'No colocado'}</strong></span>
            </div>
          </div>
        </div>

        <!-- System Thermal Status -->
        <div class="thermal-footer">
          <span>🌡️ Temp interna: <strong>${s.internalTemp}°C</strong></span>
          <span>🌀 Ventilador: <strong>${s.coolingFanSpeed > 0 ? `${s.coolingFanSpeed}%` : 'Inactivo'}</strong></span>
        </div>
      </div>
    `;
  }
}
