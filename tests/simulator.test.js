import { describe, it, expect } from 'vitest';
import { SolarCalculator } from '../src/simulation/SolarCalculator.js';
import { PowerSimulator } from '../src/simulation/PowerSimulator.js';

describe('SolarCalculator', () => {
  const calc = new SolarCalculator();

  it('computes sun position at noon with positive elevation', () => {
    const sun = calc.calculateSunPosition(12.0);
    expect(sun.isDaylight).toBe(true);
    expect(sun.elevation).toBeGreaterThan(60);
    expect(sun.direction.y).toBeGreaterThan(0.8);
  });

  it('computes zero irradiance at night', () => {
    const sun = calc.calculateSunPosition(1.0);
    expect(sun.isDaylight).toBe(false);
    const irr = calc.calculateIrradiance(sun.elevation, 0);
    expect(irr).toBe(0);
  });

  it('calculates optimal panel output when aligned with sun', () => {
    const normal = { x: 0, y: 1, z: 0 };
    const sunDir = { x: 0, y: 1, z: 0 };
    const output = calc.calculatePanelOutput(normal, sunDir, 1000);
    expect(output.watts).toBeCloseTo(40, 0);
    expect(output.angleOfIncidenceDeg).toBeCloseTo(0, 0);
  });

  it('calculates 0 Watts when sun is behind panel', () => {
    const normal = { x: 0, y: 1, z: 0 };
    const sunDir = { x: 0, y: -1, z: 0 }; // behind
    const output = calc.calculatePanelOutput(normal, sunDir, 1000);
    expect(output.watts).toBe(0);
    expect(output.angleOfIncidenceDeg).toBe(90);
  });
});

describe('PowerSimulator Interactive Features & Speed', () => {
  it('allows manual selection of phone battery levels', () => {
    const sim = new PowerSimulator();
    sim.setPhoneBatteryPct('phoneA', 25);
    expect(sim.phones.phoneA.batteryPct).toBe(25);
    sim.setPhoneBatteryPct('phoneB', 92);
    expect(sim.phones.phoneB.batteryPct).toBe(92);
  });

  it('allows manual selection of station battery level', () => {
    const sim = new PowerSimulator();
    sim.setStationBatteryPct(40);
    expect(sim.batterySoC).toBeCloseTo(0.40, 2);
    expect(sim.getState().batterySoCPct).toBe(40);
  });

  it('supports time acceleration multiplier', () => {
    const sim = new PowerSimulator();
    sim.setPhoneBatteryPct('phoneA', 10);
    sim.setTimeMultiplier(20); // 20x speed
    sim.update(1.0); // 1 real second = 20 simulated seconds
    expect(sim.phones.phoneA.batteryPct).toBeGreaterThan(20);
  });

  it('supports continuous automatic day progression', () => {
    const sim = new PowerSimulator();
    sim.setTimeOfDay(12.0);
    sim.toggleAutoProgressDay();
    expect(sim.autoProgressDay).toBe(true);
    sim.setTimeMultiplier(60);
    sim.update(1.0);
    expect(sim.timeOfDay).not.toBe(12.0);
  });
});
