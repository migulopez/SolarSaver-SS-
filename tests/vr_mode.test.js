import { describe, it, expect } from 'vitest';
import { PowerSimulator } from '../src/simulation/PowerSimulator.js';

describe('VR and Dual View Mode Logic', () => {
  it('maintains continuous simulation when switching perspectives', () => {
    const sim = new PowerSimulator();
    sim.setPhoneBatteryPct('phoneA', 40);
    sim.setTimeMultiplier(5);

    // Run simulation
    sim.update(1.0);
    const s1 = sim.getState();
    expect(s1.phones.phoneA.batteryPct).toBeGreaterThan(40);

    // Switch mode
    sim.togglePower();
    const s2 = sim.getState();
    expect(s2.powerOn).toBe(false);

    sim.togglePower();
    const s3 = sim.getState();
    expect(s3.powerOn).toBe(true);
  });
});
