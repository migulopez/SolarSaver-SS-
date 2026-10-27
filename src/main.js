/**
 * main.js
 * Application entry point for SolarSaver-SS 3D & Mixed Reality simulator.
 */
import { PowerSimulator } from './simulation/PowerSimulator.js';
import { SceneManager } from './scene/SceneManager.js';
import { TelemetryHUD } from './ui/TelemetryHUD.js';
import { ControlsOverlay } from './ui/ControlsOverlay.js';
import { TechnicalModal } from './ui/TechnicalModal.js';
import { soundManager } from './audio/SoundManager.js';

window.addEventListener('DOMContentLoaded', () => {
  try {
    // 1. Initialize Electrical and Solar Physical Simulator
    const sim = new PowerSimulator();

    // 2. Initialize 3D Scene Viewport
    const canvasContainer = document.getElementById('canvas-container');
    const sceneManager = new SceneManager(canvasContainer, sim);

    // 3. Initialize UI Components
    const hud = new TelemetryHUD(sim);
    const controls = new ControlsOverlay(sim, sceneManager);
    const modal = new TechnicalModal();

    // 4. Initialize Sound System on first user interaction
    const unlockAudio = () => {
      soundManager.init();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    // Expose for debugging/inspection in console
    window.SolarSaver = {
      sim,
      sceneManager,
      soundManager
    };

    console.log('%c SolarSaver-SS 3D Simulation Initialized Successfully ', 'background: #0284c7; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
  } catch (err) {
    console.error('Failed to initialize SolarSaver-SS application:', err);
  }
});
