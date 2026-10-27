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

describe('PowerSimulator', () => {
  it('initializes with default on state and realistic battery voltage', () => {
    const sim = new PowerSimulator();
    const state = sim.getState();
    expect(state.powerOn).toBe(true);
    expect(state.batteryVoltage).toBeGreaterThan(11.0);
    expect(state.batteryVoltage).toBeLessThanOrEqual(12.60);
    expect(state.phones.phoneA.present).toBe(true);
  });

  it('toggles power on and off', () => {
    const sim = new PowerSimulator();
    expect(sim.powerOn).toBe(true);
    sim.togglePower();
    expect(sim.powerOn).toBe(false);
    sim.togglePower();
    expect(sim.powerOn).toBe(true);
  });

  it('charges phones when power is on and present', () => {
    const sim = new PowerSimulator();
    sim.phones.phoneA.batteryPct = 50;
    sim.update(5.0); // 5 seconds
    const state = sim.getState();
    expect(state.phones.phoneA.batteryPct).toBeGreaterThan(50);
  });

  it('stops charging phones when power is off', () => {
    const sim = new PowerSimulator();
    sim.setPhonePresent('phoneA', true);
    sim.powerOn = false;
    sim.phones.phoneA.batteryPct = 50;
    sim.update(5.0);
    const state = sim.getState();
    expect(state.phones.phoneA.batteryPct).toBe(50);
    expect(state.phones.phoneA.active).toBe(false);
  });

  it('calculates voltage curve correctly based on SoC', () => {
    const sim = new PowerSimulator();
    expect(sim.calculateBatteryVoltage(1.0)).toBe(12.60);
    expect(sim.calculateBatteryVoltage(0.0)).toBe(10.80);
    expect(sim.calculateBatteryVoltage(0.5)).toBeGreaterThan(11.3);
  });
});
