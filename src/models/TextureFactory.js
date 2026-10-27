/**
 * TextureFactory.js
 * Generates dynamic high-resolution procedural textures for screens, decals, solar cells, and emblems.
 */
import * as THREE from 'three';

export class TextureFactory {
  /**
   * Creates a dynamic canvas texture for the LCD displays
   */
  static createLCDTexture(width = 512, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const update = (state, isInputDisplay = true) => {
      // Background
      if (!state.powerOn) {
        // LCD off - dark LCD liquid crystal tint
        ctx.fillStyle = '#0c171e';
        ctx.fillRect(0, 0, width, height);
        // faint grid
        ctx.strokeStyle = '#142530';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 4, width - 8, height - 8);
        texture.needsUpdate = true;
        return;
      }

      // LCD on - Vibrant illuminated blue backlight
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.5, '#0369a1');
      grad.addColorStop(1, '#075985');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Inner LCD border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // Header row
      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(isInputDisplay ? '● SOLAR INPUT / MPPT' : '● AC/DC LOAD SYSTEM', 20, 38);

      ctx.textAlign = 'right';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(isInputDisplay ? `${state.solarWatts}W IN` : `${state.totalLoadWatts}W OUT`, width - 20, 38);

      // Main big readout: "12.6 v" + Battery Gauge (exact match to blueprint)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 64px monospace';
      const voltStr = isInputDisplay 
        ? `${state.batteryVoltage.toFixed(1)} v` 
        : `${(state.powerOn ? 12.0 : 0.0).toFixed(1)} v`;
      ctx.fillText(voltStr, 24, 115);

      // Battery icon [|||||]
      const batX = 265;
      const batY = 65;
      const batW = 180;
      const batH = 65;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(batX, batY, batW, batH);
      // Battery tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(batX + batW, batY + 18, 12, 30);

      // Battery fill segments (5 bars)
      const soc = state.batterySoC;
      const numBars = Math.min(5, Math.ceil(soc * 5));
      const barW = (batW - 20) / 5;
      for (let i = 0; i < numBars; i++) {
        // Color transition: red for 1 bar, orange for 2, bright cyan/green for 3+
        if (numBars <= 1) ctx.fillStyle = '#ef4444';
        else if (numBars <= 2) ctx.fillStyle = '#f59e0b';
        else ctx.fillStyle = '#38bdf8';
        ctx.fillRect(batX + 6 + i * (barW + 2), batY + 6, barW - 2, batH - 12);
      }

      // Percentage text next to or inside
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${state.batterySoCPct}%`, batX + batW / 2, batY + batH + 28);

      // Secondary telemetry row at bottom
      ctx.font = '22px monospace';
      ctx.fillStyle = '#e0f2fe';
      ctx.textAlign = 'left';

      if (isInputDisplay) {
        ctx.fillText(`IRR: ${state.solarIrradiance} W/m²`, 24, 185);
        ctx.fillText(`SUN ELEV: ${Math.round(state.angleOfIncidenceDeg)}° INC`, 24, 220);
        ctx.textAlign = 'right';
        ctx.fillText(`CURRENT: ${(state.solarWatts / (state.batteryVoltage || 12)).toFixed(2)} A`, width - 24, 185);
        ctx.fillText(`NET: ${state.netWatts > 0 ? '+' : ''}${state.netWatts} W`, width - 24, 220);
      } else {
        ctx.fillText(`120V AC: ${state.ac120VActive ? 'ACTIVO' : 'STANDBY'}`, 24, 185);
        ctx.fillText(`USB: 4 PUERTOS`, 24, 220);
        ctx.textAlign = 'right';
        ctx.fillText(`TEMP: ${state.internalTemp}°C`, width - 24, 185);
        ctx.fillText(`FAN: ${state.coolingFanSpeed}%`, width - 24, 220);
      }

      texture.needsUpdate = true;
    };

    return { texture, canvas, ctx, update };
  }

  /**
   * Generates the 120V AC warning triangle decal texture
   */
  static create120VWarningTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, 256, 256);

    // Yellow warning triangle
    ctx.beginPath();
    ctx.moveTo(128, 20);
    ctx.lineTo(240, 215);
    ctx.lineTo(16, 215);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    // Lightning bolt in center
    ctx.beginPath();
    ctx.moveTo(136, 55);
    ctx.lineTo(100, 125);
    ctx.lineTo(132, 125);
    ctx.lineTo(116, 185);
    ctx.lineTo(162, 110);
    ctx.lineTo(130, 110);
    ctx.closePath();
    ctx.fillStyle = '#18181b';
    ctx.fill();

    // 120V text at bottom
    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = '#18181b';
    ctx.textAlign = 'center';
    ctx.fillText('120V AC', 128, 246);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates the USB 5V warning / lightning decal texture
   */
  static createUSBDecalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 256);

    // Lightning bolt with USB symbol
    ctx.beginPath();
    ctx.moveTo(136, 40);
    ctx.lineTo(95, 120);
    ctx.lineTo(135, 120);
    ctx.lineTo(115, 195);
    ctx.lineTo(165, 105);
    ctx.lineTo(125, 105);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('4 x 5V USB', 128, 235);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates the Side Logo: Sunburst silhouette with Greek / Medical cross in center
   */
  static createSideLogoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    ctx.save();
    ctx.translate(256, 256);

    // 24 sharp sunburst rays
    const numRays = 24;
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;

    for (let i = 0; i < numRays; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / numRays);
      ctx.beginPath();
      ctx.moveTo(0, -230);
      ctx.lineTo(24, -130);
      ctx.lineTo(-24, -130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Outer circle
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(0, 0, 115, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Bold Medical / Rescue Cross in center
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    const armW = 34;
    const armL = 80;

    // Horizontal arm
    ctx.fillRect(-armL, -armW, armL * 2, armW * 2);
    ctx.strokeRect(-armL, -armW, armL * 2, armW * 2);

    // Vertical arm
    ctx.fillRect(-armW, -armL, armW * 2, armL * 2);
    ctx.strokeRect(-armW, -armL, armW * 2, armL * 2);

    // Re-fill center to blend cleanly
    ctx.fillRect(-armW, -armW, armW * 2, armW * 2);

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates Monocrystalline solar panel cell grid texture
   */
  static createSolarCellTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768; // 30cm x 20cm ratio (3:2)
    const ctx = canvas.getContext('2d');

    // Deep anti-reflective solar cell blue gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 768);
    grad.addColorStop(0, '#0c1a2e');
    grad.addColorStop(0.5, '#0f294d');
    grad.addColorStop(1, '#091629');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // Grid of solar cells: 6 rows x 4 columns = 24 cells
    const rows = 6;
    const cols = 4;
    const pad = 8;
    const cellW = (512 - (cols + 1) * pad) / cols;
    const cellH = (768 - (rows + 1) * pad) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * (cellW + pad);
        const y = pad + r * (cellH + pad);

        // Individual cell (dark iridescent blue with chamfered corners)
        ctx.fillStyle = '#103566';
        ctx.fillRect(x + 6, y, cellW - 12, cellH);
        ctx.fillRect(x, y + 6, cellW, cellH - 12);

        // Silver busbars running vertically through each cell
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + cellW * 0.33 - 1, y, 2.5, cellH);
        ctx.fillRect(x + cellW * 0.67 - 1, y, 2.5, cellH);

        // Fine horizontal grid fingers
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        for (let f = 1; f < 12; f++) {
          ctx.fillRect(x, y + (cellH / 12) * f, cellW, 1);
        }
      }
    }

    // Outer white edge seals
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 764);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Creates a dynamic canvas texture for a smartphone screen
   */
  static createPhoneScreenTexture(phoneName = 'Smartphone') {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);

    const update = (phoneState, isPowered) => {
      // Screen background
      if (!isPowered && !phoneState.present) {
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, 300, 600);
        texture.needsUpdate = true;
        return;
      }

      // Modern phone lockscreen gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 600);
      if (phoneState.active) {
        grad.addColorStop(0, '#091e3a');
        grad.addColorStop(0.5, '#052e16'); // green tint when charging
        grad.addColorStop(1, '#021810');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 300, 600);

      // Top Status Bar: Clock, WiFi, Battery
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('12:45', 24, 38);

      ctx.textAlign = 'right';
      ctx.font = '16px sans-serif';
      ctx.fillText('5G  100%', 276, 38);

      // Main Big Clock in center
      ctx.textAlign = 'center';
      ctx.font = '300 72px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('12:45', 150, 160);

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Martes, 27 de Octubre', 150, 195);

      // Charging animation / Battery circle in center
      const centerX = 150;
      const centerY = 330;
      const radius = 65;

      // Outer ring track
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#1e293b';
      ctx.stroke();

      // Progress arc
      const pct = Math.round(phoneState.batteryPct);
      const angle = (pct / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.lineWidth = 8;
      ctx.strokeStyle = phoneState.active ? '#22c55e' : '#38bdf8';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Charging lightning icon if charging
      if (phoneState.active) {
        ctx.beginPath();
        ctx.moveTo(153, 290);
        ctx.lineTo(138, 325);
        ctx.lineTo(151, 325);
        ctx.lineTo(145, 360);
        ctx.lineTo(165, 320);
        ctx.lineTo(151, 320);
        ctx.closePath();
        ctx.fillStyle = '#22c55e';
        ctx.fill();

        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${pct}%`, 150, 420);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('⚡ CARGA RÁPIDA SOLAR', 150, 455);
      } else {
        ctx.font = 'bold 36px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${pct}%`, 150, 340);

        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(phoneName, 150, 440);
      }

      // Bottom unlock bar
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(100, 565, 100, 5);

      texture.needsUpdate = true;
    };

    return { texture, canvas, ctx, update };
  }
}
