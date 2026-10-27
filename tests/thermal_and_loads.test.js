import { describe, it, expect } from 'vitest';
import { PowerSimulator } from '../src/simulation/PowerSimulator.js';

describe('PowerSimulator Loads & Thermal behavior', () => {
  it('activates cooling fan when temperature or load rises', () => {
    const sim = new PowerSimulator();
    sim.toggleAC120V(); // add 35W load
    expect(sim.ac120VActive).toBe(true);
    expect(sim.totalLoadWatts).toBeGreaterThan(30);

    // Update for several simulation seconds
    for (let i = 0; i < 20; i++) {
      sim.update(1.0);
    }

    const state = sim.getState();
    expect(state.coolingFanSpeed).toBeGreaterThan(0);
    expect(state.internalTemp).toBeGreaterThan(26.0);
  });

  it('aligns solar panel automatically to the sun', () => {
    const sim = new PowerSimulator();
    sim.setTimeOfDay(12.0); // solar noon
    sim.alignPanelToSun();
    
    expect(sim.panelTilt).toBeGreaterThan(10);
    expect(sim.panelTilt).toBeLessThan(80);
    expect(sim.angleOfIncidenceDeg).toBeLessThan(15);
  });

  it('correctly manages phone presence and charging state', () => {
    const sim = new PowerSimulator();
    sim.setPhonePresent('phoneA', true);
    sim.setPhonePresent('phoneB', true);
    sim.update(1.0);

    let state = sim.getState();
    expect(state.phones.phoneA.active).toBe(true);
    expect(state.phones.phoneB.active).toBe(true);

    sim.setPhonePresent('phoneA', false);
    sim.update(1.0);
    state = sim.getState();
    expect(state.phones.phoneA.active).toBe(false);
    expect(state.phones.phoneB.active).toBe(true);
  });

  it('calculates time estimation strings for charging and discharging', () => {
    const sim = new PowerSimulator();
    sim.batterySoC = 0.5;
    sim.timeOfDay = 12.0;
    sim.cloudCover = 0.0;
    sim.alignPanelToSun();
    sim.update(0.1);
    
    // High solar, zero load -> charging
    sim.powerOn = false;
    sim.update(0.1);
    let state = sim.getState();
    expect(state.timeEstimateStr).toContain('Carga completa');

    // Turn power on with high AC load at night -> discharging
    sim.powerOn = true;
    sim.timeOfDay = 1.0; // night
    sim.toggleAC120V(); // 35W load
    sim.update(0.1);
    state = sim.getState();
    expect(state.timeEstimateStr).toContain('Autonomía restante');
  });
});
