/**
 * PowerSimulator.js
 * Comprehensive electrical simulation model for the SolarSaver-SS portable station.
 * Enhanced with real-time time acceleration (1x to 120x) and interactive battery level selection.
 */

import { SolarCalculator } from './SolarCalculator.js';

export class PowerSimulator {
  constructor() {
    this.solarCalc = new SolarCalculator();

    // System Master State
    this.powerOn = true;
    this.drawerOpen = false;

    // Environmental Controls
    this.timeOfDay = 12.5; // 12:30 PM (Sun peak)
    this.cloudCover = 0.15; // 15% light cloud
    this.panelTilt = 45; // degrees from horizontal
    this.panelAzimuth = 180; // degrees (facing South)

    // Time Acceleration & Automatic Day/Night Cycle
    this.timeMultiplier = 1.0; // 1x normal, 5x, 20x, 60x, 120x
    this.autoProgressDay = false; // toggle continuous sun movement

    // Battery Bank Specifications (3S Li-ion high-capacity pack)
    this.batteryCapacityWh = 150; // 150 Watt-hours
    this.batterySoC = 0.85; // 85% initially
    this.nominalVoltage = 12.0;

    // Output Loads: Interactive Phone Battery States
    this.phones = {
      phoneA: {
        present: true,
        batteryPct: 35,
        targetPct: 100,
        ratedWatts: 15.0,
        active: false,
        name: 'Celular A (Bandeja Izq)'
      },
      phoneB: {
        present: true,
        batteryPct: 58,
        targetPct: 100,
        ratedWatts: 15.0,
        active: false,
        name: 'Celular B (Bandeja Der)'
      }
    };

    // AC 120V Inverter & USB auxiliary loads
    this.ac120VActive = false;
    this.ac120VLoadWatts = 45.0; // Simulated emergency lamp/medical cooler
    this.usbAuxActive = false;
    this.usbAuxLoadWatts = 10.0;

    // Thermal simulation
    this.ambientTemp = 24.0; // °C
    this.internalTemp = 26.5; // °C
    this.coolingFanSpeed = 0; // 0 to 100%

    // Instantaneous electrical readings
    this.solarWatts = 0;
    this.totalLoadWatts = 0;
    this.netWatts = 0;
    this.batteryVoltage = 12.45;
    this.batteryCurrentAmps = 0;
    this.solarIrradiance = 0;
    this.angleOfIncidenceDeg = 0;

    // Change listeners
    this.listeners = new Set();

    // Initial calculation
    this.update(0);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.getState());
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Error in simulation listener:', err);
      }
    });
  }

  // --- Controls & Toggles ---

  togglePower() {
    this.powerOn = !this.powerOn;
    this.update(0);
    this.notify();
    return this.powerOn;
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
    this.update(0);
    this.notify();
    return this.drawerOpen;
  }

  setDrawerOpen(isOpen) {
    this.drawerOpen = !!isOpen;
    this.update(0);
    this.notify();
  }

  togglePhone(phoneKey) {
    if (this.phones[phoneKey]) {
      this.phones[phoneKey].present = !this.phones[phoneKey].present;
      this.update(0);
      this.notify();
    }
  }

  setPhonePresent(phoneKey, present) {
    if (this.phones[phoneKey]) {
      this.phones[phoneKey].present = !!present;
      this.update(0);
      this.notify();
    }
  }

  /**
   * Set Phone Battery percentage manually (0% to 100%)
   */
  setPhoneBatteryPct(phoneKey, pct) {
    if (this.phones[phoneKey]) {
      this.phones[phoneKey].batteryPct = Math.max(0, Math.min(100, parseFloat(pct)));
      this.update(0);
      this.notify();
    }
  }

  /**
   * Set Station Battery percentage manually (0% to 100%)
   */
  setStationBatteryPct(pct) {
    const clamped = Math.max(0, Math.min(100, parseFloat(pct)));
    this.batterySoC = clamped / 100;
    this.update(0);
    this.notify();
  }

  /**
   * Set Time Acceleration Multiplier (1x, 5x, 20x, 60x, 120x)
   */
  setTimeMultiplier(multiplier) {
    this.timeMultiplier = Math.max(0.1, Math.min(300, parseFloat(multiplier)));
    this.notify();
  }

  /**
   * Toggle continuous automatic day/night progression
   */
  toggleAutoProgressDay() {
    this.autoProgressDay = !this.autoProgressDay;
    this.notify();
    return this.autoProgressDay;
  }

  toggleAC120V() {
    this.ac120VActive = !this.ac120VActive;
    this.update(0);
    this.notify();
  }

  setTimeOfDay(hours) {
    this.timeOfDay = Math.max(0, Math.min(24, hours));
    this.update(0);
    this.notify();
  }

  setCloudCover(factor) {
    this.cloudCover = Math.max(0, Math.min(1, factor));
    this.update(0);
    this.notify();
  }

  setPanelOrientation(tiltDeg, azimuthDeg) {
    this.panelTilt = Math.max(0, Math.min(90, tiltDeg));
    this.panelAzimuth = (azimuthDeg % 360 + 360) % 360;
    this.update(0);
    this.notify();
  }

  alignPanelToSun() {
    const sun = this.solarCalc.calculateSunPosition(this.timeOfDay);
    if (sun.isDaylight && sun.elevation > 0) {
      this.panelTilt = Math.max(10, Math.min(85, Math.round(90 - sun.elevation)));
      let az = Math.round(sun.azimuth);
      this.panelAzimuth = (az % 360 + 360) % 360;
      this.update(0);
      this.notify();
    }
  }

  // --- Physics & Electrical Update ---

  calculateBatteryVoltage(soc) {
    if (soc >= 1.0) return 12.60;
    if (soc <= 0.0) return 10.80;
    
    const vMin = 10.8;
    const vNom = 11.7;
    const vMax = 12.6;
    
    if (soc > 0.8) {
      return vNom + (soc - 0.8) * ((vMax - vNom) / 0.2);
    } else if (soc > 0.2) {
      return 11.3 + (soc - 0.2) * ((vNom - 11.3) / 0.6);
    } else {
      return vMin + soc * ((11.3 - vMin) / 0.2);
    }
  }

  update(rawDeltaSeconds) {
    // Apply time speed multiplier to simulation delta
    const deltaSeconds = (rawDeltaSeconds || 0) * this.timeMultiplier;

    // Automatic Continuous Day Progress (if enabled)
    if (this.autoProgressDay && deltaSeconds > 0) {
      // Advance ~1 hour every 15 real seconds at 1x, or faster with multiplier
      const dayAdvanceHours = (rawDeltaSeconds * this.timeMultiplier * 0.08);
      this.timeOfDay = (this.timeOfDay + dayAdvanceHours) % 24;
    }

    // 1. Calculate Solar Generation
    const sunPos = this.solarCalc.calculateSunPosition(this.timeOfDay);
    const irradiance = this.solarCalc.calculateIrradiance(sunPos.elevation, this.cloudCover);
    this.solarIrradiance = Math.round(irradiance);

    const tiltRad = (this.panelTilt * Math.PI) / 180;
    const azRad = (this.panelAzimuth * Math.PI) / 180;
    const panelNormal = {
      x: Math.sin(azRad) * Math.sin(tiltRad),
      y: Math.cos(tiltRad),
      z: Math.cos(azRad) * Math.sin(tiltRad)
    };

    const panelOutput = this.solarCalc.calculatePanelOutput(
      panelNormal,
      sunPos.direction,
      irradiance
    );

    this.solarWatts = panelOutput.watts;
    this.angleOfIncidenceDeg = panelOutput.angleOfIncidenceDeg;

    // 2. Output Load Calculation
    let totalLoad = 0;

    if (this.powerOn && this.batterySoC > 0.01) {
      // Inverter / standby idle consumption
      totalLoad += 1.8;

      // Phone A charging in drawer
      if (this.phones.phoneA.present && this.phones.phoneA.batteryPct < 100) {
        this.phones.phoneA.active = true;
        const taper = this.phones.phoneA.batteryPct > 80 
          ? (100 - this.phones.phoneA.batteryPct) / 20 
          : 1.0;
        const currentPhoneLoad = this.phones.phoneA.ratedWatts * Math.max(0.2, taper);
        totalLoad += currentPhoneLoad;

        if (deltaSeconds > 0) {
          // Dynamic charging rate: fills ~1% per second at normal speed, scaled with timeMultiplier
          this.phones.phoneA.batteryPct = Math.min(
            100,
            this.phones.phoneA.batteryPct + (deltaSeconds * 0.85)
          );
        }
      } else {
        this.phones.phoneA.active = false;
      }

      // Phone B charging in drawer
      if (this.phones.phoneB.present && this.phones.phoneB.batteryPct < 100) {
        this.phones.phoneB.active = true;
        const taper = this.phones.phoneB.batteryPct > 80 
          ? (100 - this.phones.phoneB.batteryPct) / 20 
          : 1.0;
        const currentPhoneLoad = this.phones.phoneB.ratedWatts * Math.max(0.2, taper);
        totalLoad += currentPhoneLoad;

        if (deltaSeconds > 0) {
          this.phones.phoneB.batteryPct = Math.min(
            100,
            this.phones.phoneB.batteryPct + (deltaSeconds * 0.7)
          );
        }
      } else {
        this.phones.phoneB.active = false;
      }

      // 120V AC Outlets load
      if (this.ac120VActive) {
        totalLoad += this.ac120VLoadWatts;
      }

      // USB Auxiliary load
      if (this.usbAuxActive) {
        totalLoad += this.usbAuxLoadWatts;
      }
    } else {
      // Station is turned off
      this.phones.phoneA.active = false;
      this.phones.phoneB.active = false;
    }

    this.totalLoadWatts = parseFloat(totalLoad.toFixed(1));

    // 3. Battery State of Charge (SoC) integration
    const mpptEfficiency = 0.94;
    const effectiveSolarIn = this.solarWatts * mpptEfficiency;
    const netPower = effectiveSolarIn - this.totalLoadWatts;
    this.netWatts = parseFloat(netPower.toFixed(1));

    if (deltaSeconds > 0) {
      // Energy delta in Watt-hours
      // Accelerated slightly for responsive didactic demonstration
      const deltaWh = netPower * (deltaSeconds / 3600) * 12.0;
      const newWh = Math.max(0, Math.min(this.batteryCapacityWh, (this.batterySoC * this.batteryCapacityWh) + deltaWh));
      this.batterySoC = newWh / this.batteryCapacityWh;

      // Auto shutoff protection at 0%
      if (this.batterySoC <= 0.005 && this.powerOn) {
        this.powerOn = false;
      }
    }

    // 4. Voltage & Current
    this.batteryVoltage = parseFloat(this.calculateBatteryVoltage(this.batterySoC).toFixed(2));
    this.batteryCurrentAmps = parseFloat((this.netWatts / this.batteryVoltage).toFixed(2));

    // 5. Thermal & Fan Simulation
    const targetTemp = this.ambientTemp + (this.totalLoadWatts * 0.22) + (this.solarWatts * 0.08);
    this.internalTemp += (targetTemp - this.internalTemp) * Math.min(1.0, (rawDeltaSeconds || 0.1) * 0.5);
    
    if (this.internalTemp > 34.0 || this.totalLoadWatts > 25.0) {
      this.coolingFanSpeed = Math.min(100, Math.round(((this.internalTemp - 30) / 25) * 100));
    } else {
      this.coolingFanSpeed = 0;
    }
  }

  getState() {
    const socPct = Math.round(this.batterySoC * 100);
    
    let timeEstimateStr = 'Estable';
    if (this.netWatts > 0.5 && socPct < 100) {
      const remainingWh = (1.0 - this.batterySoC) * this.batteryCapacityWh;
      const hoursRemaining = remainingWh / this.netWatts;
      const hrs = Math.floor(hoursRemaining);
      const mins = Math.round((hoursRemaining - hrs) * 60);
      timeEstimateStr = `Carga completa: ${hrs}h ${mins}m`;
    } else if (this.netWatts < -0.5 && socPct > 0) {
      const availableWh = this.batterySoC * this.batteryCapacityWh;
      const hoursRemaining = availableWh / Math.abs(this.netWatts);
      const hrs = Math.floor(hoursRemaining);
      const mins = Math.round((hoursRemaining - hrs) * 60);
      timeEstimateStr = `Autonomía restante: ${hrs}h ${mins}m`;
    } else if (socPct >= 100 && this.netWatts >= 0) {
      timeEstimateStr = 'Batería al 100% (Flotación)';
    }

    return {
      powerOn: this.powerOn,
      drawerOpen: this.drawerOpen,
      timeOfDay: this.timeOfDay,
      cloudCover: this.cloudCover,
      panelTilt: this.panelTilt,
      panelAzimuth: this.panelAzimuth,
      timeMultiplier: this.timeMultiplier,
      autoProgressDay: this.autoProgressDay,
      solarIrradiance: this.solarIrradiance,
      solarWatts: this.solarWatts,
      angleOfIncidenceDeg: this.angleOfIncidenceDeg,
      totalLoadWatts: this.totalLoadWatts,
      netWatts: this.netWatts,
      batterySoC: this.batterySoC,
      batterySoCPct: socPct,
      batteryVoltage: this.batteryVoltage,
      batteryCurrentAmps: this.batteryCurrentAmps,
      timeEstimateStr,
      phones: {
        phoneA: { ...this.phones.phoneA },
        phoneB: { ...this.phones.phoneB }
      },
      ac120VActive: this.ac120VActive,
      usbAuxActive: this.usbAuxActive,
      internalTemp: parseFloat(this.internalTemp.toFixed(1)),
      coolingFanSpeed: this.coolingFanSpeed
    };
  }
}
