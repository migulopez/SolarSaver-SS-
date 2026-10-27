/**
 * StationModel.js
 * High-fidelity 3D procedural model of the SolarSaver-SS portable emergency generator station.
 * Matches exact blueprint dimensions: 40 cm (W) x 20 cm (H) x 30 cm (D).
 */
import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';
import { SmartphoneModel } from './SmartphoneModel.js';

export class StationModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SolarSaverStation';

    // Blueprint dimensions (in meters)
    this.width = 0.40;   // 40 cm
    this.height = 0.20;  // 20 cm
    this.depth = 0.30;   // 30 cm
    this.footHeight = 0.015;

    // Materials
    this.initMaterials();

    // Textures
    this.lcdLeft = TextureFactory.createLCDTexture(512, 256);
    this.lcdRight = TextureFactory.createLCDTexture(512, 256);
    this.warning120VTex = TextureFactory.create120VWarningTexture();
    this.usbDecalTex = TextureFactory.createUSBDecalTexture();
    this.sideLogoTex = TextureFactory.createSideLogoTexture();

    // Drawer state
    this.drawerZClosed = 0;
    this.drawerZOpen = 0.20;
    this.drawerTargetZ = 0;
    this.drawerCurrentZ = 0;

    // Switch state
    this.switchTargetRot = 0.28; // tilted forward for ON
    this.switchCurrentRot = 0.28;

    // Fan animation
    this.fanBlades = [];

    // Assemble parts
    this.initMainCase();
    this.initCornerProtectors();
    this.initHandle();
    this.initFeet();
    this.initFrontPanel();
    this.initDrawer();
    this.initSideFeatures();

    // Base position
    this.group.position.set(0, this.height / 2 + this.footHeight, 0);
  }

  initMaterials() {
    // Rugged industrial tactical polymer casing (Rescue-grade dark charcoal slate)
    this.caseMaterial = new THREE.MeshStandardMaterial({
      color: 0x22272e,
      roughness: 0.55,
      metalness: 0.2
    });

    // Dark rubberized protective bumper guards
    this.bumperMaterial = new THREE.MeshStandardMaterial({
      color: 0x121519,
      roughness: 0.85,
      metalness: 0.05
    });

    // Inset front panel bezel (brushed metallic faceplate)
    this.frontFaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d333b,
      roughness: 0.45,
      metalness: 0.35
    });

    // Handle heavy-duty polymer
    this.handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x181b20,
      roughness: 0.7,
      metalness: 0.1
    });

    // Metallic hardware (screws, hinges, pins)
    this.metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b949e,
      roughness: 0.25,
      metalness: 0.9
    });

    // AC Outlets black matte plastic
    this.socketMaterial = new THREE.MeshStandardMaterial({
      color: 0x16181d,
      roughness: 0.6,
      metalness: 0.1
    });

    // USB Ports metal shield & blue 3.0 insert
    this.usbShieldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0d7de,
      roughness: 0.2,
      metalness: 0.95
    });
    this.usbInsertMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4
    });

    // Rocker switch red button
    this.switchButtonMaterial = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.35,
      metalness: 0.1
    });

    // LED indicator
    this.ledMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.2,
      roughness: 0.2
    });
  }

  initMainCase() {
    // Outer shell
    const shellGeo = new THREE.BoxGeometry(this.width, this.height, this.depth);
    this.shellMesh = new THREE.Mesh(shellGeo, this.caseMaterial);
    this.shellMesh.castShadow = true;
    this.shellMesh.receiveShadow = true;
    this.group.add(this.shellMesh);

    // Front recess cutout simulation: Inset front faceplate
    const frontBezelW = this.width - 0.035;
    const frontBezelH = this.height - 0.03;
    const frontBezelGeo = new THREE.BoxGeometry(frontBezelW, frontBezelH, 0.008);
    const frontBezelMesh = new THREE.Mesh(frontBezelGeo, this.frontFaceMaterial);
    frontBezelMesh.position.set(0, 0, this.depth / 2 + 0.001);
    frontBezelMesh.receiveShadow = true;
    this.group.add(frontBezelMesh);
  }

  initCornerProtectors() {
    // 8 Rugged Bumper Corner Guards with chamfered geometry & screw details
    const cornerSize = 0.042;
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const halfD = this.depth / 2;

    const cornerGeo = new THREE.BoxGeometry(cornerSize, cornerSize, cornerSize);
    const screwGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.002, 10);

    const positions = [
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [-1, 1,  1], [1, 1,  1]
    ];

    positions.forEach(([xSign, ySign, zSign]) => {
      const corner = new THREE.Mesh(cornerGeo, this.bumperMaterial);
      corner.position.set(
        xSign * (halfW - cornerSize * 0.42),
        ySign * (halfH - cornerSize * 0.42),
        zSign * (halfD - cornerSize * 0.42)
      );
      corner.castShadow = true;
      this.group.add(corner);

      // Add screw accent on front and side
      if (zSign > 0) {
        const screwFront = new THREE.Mesh(screwGeo, this.metalMaterial);
        screwFront.rotation.x = Math.PI / 2;
        screwFront.position.set(
          xSign * (halfW - cornerSize * 0.4),
          ySign * (halfH - cornerSize * 0.4),
          halfD + 0.002
        );
        this.group.add(screwFront);
      }
    });
  }

  initHandle() {
    // Top Carry Handle matching the blueprint
    this.handleGroup = new THREE.Group();
    this.handleGroup.name = 'TopCarryHandle';

    const handleW = 0.19; // 19cm width
    const handleH = 0.05; // 5cm height
    const barRadius = 0.012;

    // Base mounting brackets (left and right hinges on top)
    const bracketGeo = new THREE.BoxGeometry(0.03, 0.018, 0.04);
    const leftBracket = new THREE.Mesh(bracketGeo, this.handleMaterial);
    leftBracket.position.set(-handleW / 2, this.height / 2 + 0.009, 0);
    this.group.add(leftBracket);

    const rightBracket = new THREE.Mesh(bracketGeo, this.handleMaterial);
    rightBracket.position.set(handleW / 2, this.height / 2 + 0.009, 0);
    this.group.add(rightBracket);

    // Bolted screws on brackets
    [-1, 1].forEach(side => {
      const bolt1 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.003, 8), this.metalMaterial);
      bolt1.position.set(side * handleW / 2, this.height / 2 + 0.019, 0.012);
      this.group.add(bolt1);

      const bolt2 = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.003, 8), this.metalMaterial);
      bolt2.position.set(side * handleW / 2, this.height / 2 + 0.019, -0.012);
      this.group.add(bolt2);
    });

    // Handle main grip bar
    const gripGeo = new THREE.BoxGeometry(handleW - 0.03, barRadius * 1.5, 0.024);
    const grip = new THREE.Mesh(gripGeo, this.handleMaterial);
    grip.position.set(0, this.height / 2 + handleH, 0);
    grip.castShadow = true;
    this.handleGroup.add(grip);

    // Left and right uprights
    const uprightGeo = new THREE.BoxGeometry(0.02, handleH - 0.01, 0.024);
    const leftUpright = new THREE.Mesh(uprightGeo, this.handleMaterial);
    leftUpright.position.set(-handleW / 2 + 0.01, this.height / 2 + handleH * 0.55, 0);
    this.handleGroup.add(leftUpright);

    const rightUpright = new THREE.Mesh(uprightGeo, this.handleMaterial);
    rightUpright.position.set(handleW / 2 - 0.01, this.height / 2 + handleH * 0.55, 0);
    this.handleGroup.add(rightUpright);

    this.group.add(this.handleGroup);
  }

  initFeet() {
    // 4 shock-absorbing feet on bottom
    const footW = 0.045;
    const footD = 0.045;
    const footH = this.footHeight;
    const footGeo = new THREE.BoxGeometry(footW, footH, footD);

    const posX = this.width / 2 - 0.05;
    const posZ = this.depth / 2 - 0.05;
    const posY = -this.height / 2 - footH / 2;

    [
      [-posX, -posZ], [posX, -posZ],
      [-posX,  posZ], [posX,  posZ]
    ].forEach(([x, z]) => {
      const foot = new THREE.Mesh(footGeo, this.bumperMaterial);
      foot.position.set(x, posY, z);
      foot.receiveShadow = true;
      this.group.add(foot);
    });
  }

  initFrontPanel() {
    const frontZ = this.depth / 2 + 0.006;

    // --- 1. Two LCD Displays ---
    const lcdW = 0.105;
    const lcdH = 0.044;
    const lcdBezelGeo = new THREE.BoxGeometry(lcdW + 0.01, lcdH + 0.008, 0.004);
    const lcdScreenGeo = new THREE.PlaneGeometry(lcdW, lcdH);

    // Left LCD (Input / Solar)
    const leftBezel = new THREE.Mesh(lcdBezelGeo, this.bumperMaterial);
    leftBezel.position.set(-0.11, 0.045, frontZ);
    this.group.add(leftBezel);

    this.lcdLeftMat = new THREE.MeshBasicMaterial({
      map: this.lcdLeft.texture,
      toneMapped: false
    });
    this.lcdLeftMesh = new THREE.Mesh(lcdScreenGeo, this.lcdLeftMat);
    this.lcdLeftMesh.position.set(-0.11, 0.045, frontZ + 0.0025);
    this.lcdLeftMesh.name = 'InteractiveLCDLeft';
    this.group.add(this.lcdLeftMesh);

    // Right LCD (Load / Output)
    const rightBezel = new THREE.Mesh(lcdBezelGeo, this.bumperMaterial);
    rightBezel.position.set(0.11, 0.045, frontZ);
    this.group.add(rightBezel);

    this.lcdRightMat = new THREE.MeshBasicMaterial({
      map: this.lcdRight.texture,
      toneMapped: false
    });
    this.lcdRightMesh = new THREE.Mesh(lcdScreenGeo, this.lcdRightMat);
    this.lcdRightMesh.position.set(0.11, 0.045, frontZ + 0.0025);
    this.lcdRightMesh.name = 'InteractiveLCDRight';
    this.group.add(this.lcdRightMesh);

    // --- 2. Master Rocker Switch (Center) ---
    this.switchGroup = new THREE.Group();
    this.switchGroup.name = 'InteractivePowerSwitch';
    this.switchGroup.position.set(0, 0.045, frontZ);

    // Switch Frame
    const swFrameGeo = new THREE.BoxGeometry(0.026, 0.04, 0.008);
    const swFrame = new THREE.Mesh(swFrameGeo, this.bumperMaterial);
    this.switchGroup.add(swFrame);

    // Rocker Button pivot
    this.rockerPivot = new THREE.Group();
    this.rockerPivot.position.set(0, 0, 0.004);

    const swBtnGeo = new THREE.BoxGeometry(0.018, 0.03, 0.008);
    this.rockerButton = new THREE.Mesh(swBtnGeo, this.switchButtonMaterial);
    this.rockerPivot.add(this.rockerButton);

    // I and O markings on switch
    const swMarkCanvas = document.createElement('canvas');
    swMarkCanvas.width = 64;
    swMarkCanvas.height = 128;
    const sCtx = swMarkCanvas.getContext('2d');
    sCtx.fillStyle = '#dc2626';
    sCtx.fillRect(0, 0, 64, 128);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 36px monospace';
    sCtx.textAlign = 'center';
    sCtx.fillText('I', 32, 45);
    sCtx.fillText('O', 32, 105);
    const swTex = new THREE.CanvasTexture(swMarkCanvas);
    const swDecalGeo = new THREE.PlaneGeometry(0.016, 0.028);
    const swDecal = new THREE.Mesh(swDecalGeo, new THREE.MeshBasicMaterial({ map: swTex }));
    swDecal.position.z = 0.0042;
    this.rockerPivot.add(swDecal);

    this.switchGroup.add(this.rockerPivot);
    this.group.add(this.switchGroup);

    // Power Indicator LED above switch
    const ledGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.004, 12);
    this.ledMesh = new THREE.Mesh(ledGeo, this.ledMaterial);
    this.ledMesh.rotation.x = Math.PI / 2;
    this.ledMesh.position.set(0, 0.072, frontZ + 0.001);
    this.group.add(this.ledMesh);

    // --- 3. Two 120V AC Outlets (Left Bottom) ---
    const acPlateGeo = new THREE.BoxGeometry(0.11, 0.05, 0.005);
    const acPlate = new THREE.Mesh(acPlateGeo, this.socketMaterial);
    acPlate.position.set(-0.11, -0.018, frontZ);
    this.group.add(acPlate);

    // Warning decal above 120V AC sockets
    const warnGeo = new THREE.PlaneGeometry(0.032, 0.032);
    const warnMat = new THREE.MeshBasicMaterial({
      map: this.warning120VTex,
      transparent: true
    });
    const warnDecal = new THREE.Mesh(warnGeo, warnMat);
    warnDecal.position.set(-0.11, 0.012, frontZ + 0.003);
    this.group.add(warnDecal);

    // Two NEMA 5-15R duplex socket face cuts
    [-0.024, 0.024].forEach(xOff => {
      const faceGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.003, 24);
      const face = new THREE.Mesh(faceGeo, this.frontFaceMaterial);
      face.rotation.x = Math.PI / 2;
      face.position.set(-0.11 + xOff, -0.018, frontZ + 0.002);
      this.group.add(face);

      // Neutral slot (tall)
      const nSlot = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.009, 0.002), this.bumperMaterial);
      nSlot.position.set(-0.11 + xOff - 0.005, -0.016, frontZ + 0.004);
      this.group.add(nSlot);

      // Hot slot (shorter)
      const hSlot = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.007, 0.002), this.bumperMaterial);
      hSlot.position.set(-0.11 + xOff + 0.005, -0.016, frontZ + 0.004);
      this.group.add(hSlot);

      // Ground hole (semi-circle / D)
      const gHole = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.002, 10), this.bumperMaterial);
      gHole.rotation.x = Math.PI / 2;
      gHole.position.set(-0.11 + xOff, -0.024, frontZ + 0.004);
      this.group.add(gHole);
    });

    // --- 4. Four USB-A Ports (Right Bottom) ---
    const usbPlateGeo = new THREE.BoxGeometry(0.11, 0.05, 0.005);
    const usbPlate = new THREE.Mesh(usbPlateGeo, this.socketMaterial);
    usbPlate.position.set(0.11, -0.018, frontZ);
    this.group.add(usbPlate);

    // USB Decal above USB ports
    const usbDecalGeo = new THREE.PlaneGeometry(0.035, 0.035);
    const usbDecalMat = new THREE.MeshBasicMaterial({
      map: this.usbDecalTex,
      transparent: true
    });
    const usbDecal = new THREE.Mesh(usbDecalGeo, usbDecalMat);
    usbDecal.position.set(0.11, 0.012, frontZ + 0.003);
    this.group.add(usbDecal);

    // 4 vertical USB-A ports
    const usbSpacing = 0.022;
    [-1.5, -0.5, 0.5, 1.5].forEach(idx => {
      const xPos = 0.11 + idx * usbSpacing;
      // Metallic outer shield
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.016, 0.003), this.usbShieldMaterial);
      shield.position.set(xPos, -0.018, frontZ + 0.003);
      this.group.add(shield);

      // Blue USB 3.0 insert
      const insert = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.007, 0.003), this.usbInsertMaterial);
      insert.position.set(xPos - 0.0015, -0.018, frontZ + 0.0035);
      this.group.add(insert);
    });

    // --- 5. Cooling Louvers / Ventilation Grilles ---
    // Left vent (9 vertical slots under AC outlets)
    const ventLGeo = new THREE.BoxGeometry(0.002, 0.015, 0.002);
    for (let i = 0; i < 9; i++) {
      const v = new THREE.Mesh(ventLGeo, this.bumperMaterial);
      v.position.set(-0.145 + i * 0.0075, -0.055, frontZ + 0.001);
      this.group.add(v);
    }

    // Right vent (14 vertical slots under USB ports)
    for (let i = 0; i < 14; i++) {
      const v = new THREE.Mesh(ventLGeo, this.bumperMaterial);
      v.position.set(0.06 + i * 0.0075, -0.055, frontZ + 0.001);
      this.group.add(v);
    }

    // Subtle internal cooling fan behind right vent
    const fanPivot = new THREE.Group();
    fanPivot.position.set(0.11, -0.055, frontZ - 0.01);
    const bladeGeo = new THREE.BoxGeometry(0.025, 0.005, 0.001);
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(bladeGeo, this.bumperMaterial);
      blade.rotation.z = (b * Math.PI) / 4;
      fanPivot.add(blade);
    }
    this.fanPivot = fanPivot;
    this.group.add(fanPivot);
  }

  initDrawer() {
    // Bandeja extraíble (Pull-out Drawer) on front bottom
    this.drawerGroup = new THREE.Group();
    this.drawerGroup.name = 'InteractiveDrawer';

    const drawerW = 0.33;
    const drawerH = 0.038;
    const drawerD = 0.23;

    // Center of drawer
    this.drawerPosY = -this.height / 2 + drawerH / 2 + 0.008;
    this.drawerGroup.position.set(0, this.drawerPosY, 0);

    // Drawer Front Face
    const frontGeo = new THREE.BoxGeometry(drawerW, drawerH, 0.012);
    const frontMesh = new THREE.Mesh(frontGeo, this.frontFaceMaterial);
    frontMesh.position.set(0, 0, this.depth / 2 + 0.006);
    frontMesh.castShadow = true;
    this.drawerGroup.add(frontMesh);

    // Front Handle to pull the drawer
    const handleGeo = new THREE.BoxGeometry(0.14, 0.012, 0.016);
    this.drawerHandle = new THREE.Mesh(handleGeo, this.handleMaterial);
    this.drawerHandle.position.set(0, 0, this.depth / 2 + 0.016);
    this.drawerHandle.name = 'InteractiveDrawerHandle';
    this.drawerGroup.add(this.drawerHandle);

    // Internal tray floor & walls
    const floorGeo = new THREE.BoxGeometry(drawerW - 0.016, 0.006, drawerD);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x1f242b,
      roughness: 0.7,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeo, trayMat);
    floorMesh.position.set(0, -drawerH / 2 + 0.004, this.depth / 2 - drawerD / 2);
    floorMesh.receiveShadow = true;
    this.drawerGroup.add(floorMesh);

    // Left and Right cradles (recesses) for the two smartphones
    const cradleGeo = new THREE.BoxGeometry(0.082, 0.004, 0.162);
    const cradleMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.9
    });

    const leftCradle = new THREE.Mesh(cradleGeo, cradleMat);
    leftCradle.position.set(-0.075, -drawerH / 2 + 0.008, this.depth / 2 - drawerD * 0.45);
    this.drawerGroup.add(leftCradle);

    const rightCradle = new THREE.Mesh(cradleGeo, cradleMat);
    rightCradle.position.set(0.075, -drawerH / 2 + 0.008, this.depth / 2 - drawerD * 0.45);
    this.drawerGroup.add(rightCradle);

    // Wireless / USB charging indicator LED dots inside each cradle
    const chgLedGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.002, 8);
    this.drawerLedA = new THREE.Mesh(chgLedGeo, this.ledMaterial);
    this.drawerLedA.position.set(-0.075, -drawerH / 2 + 0.011, this.depth / 2 - drawerD * 0.45 + 0.085);
    this.drawerGroup.add(this.drawerLedA);

    this.drawerLedB = new THREE.Mesh(chgLedGeo, this.ledMaterial);
    this.drawerLedB.position.set(0.075, -drawerH / 2 + 0.011, this.depth / 2 - drawerD * 0.45 + 0.085);
    this.drawerGroup.add(this.drawerLedB);

    // Instantiate two Smartphone 3D models inside the drawer
    this.phoneA = new SmartphoneModel('phoneA', 'Celular Alfa', 0x1e293b);
    this.phoneA.group.position.set(-0.075, -drawerH / 2 + 0.014, this.depth / 2 - drawerD * 0.45);
    this.drawerGroup.add(this.phoneA.group);

    this.phoneB = new SmartphoneModel('phoneB', 'Celular Beta', 0x334155);
    this.phoneB.group.position.set(0.075, -drawerH / 2 + 0.014, this.depth / 2 - drawerD * 0.45);
    this.drawerGroup.add(this.phoneB.group);

    this.group.add(this.drawerGroup);
  }

  initSideFeatures() {
    // --- 1. Left Side Logo: Sunburst + Cross Emblem (matching blueprint) ---
    const logoW = 0.16;
    const logoGeo = new THREE.PlaneGeometry(logoW, logoW);
    const logoMat = new THREE.MeshBasicMaterial({
      map: this.sideLogoTex,
      transparent: true
    });

    const leftLogo = new THREE.Mesh(logoGeo, logoMat);
    leftLogo.rotation.y = -Math.PI / 2;
    leftLogo.position.set(-this.width / 2 - 0.001, 0.01, 0);
    this.group.add(leftLogo);

    // --- 2. Right Side: Cable Gland / Solar In connector ---
    const portBaseGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.008, 16);
    const portBase = new THREE.Mesh(portBaseGeo, this.bumperMaterial);
    portBase.rotation.z = Math.PI / 2;
    portBase.position.set(this.width / 2 + 0.004, 0.04, -0.06);
    this.group.add(portBase);

    // Threaded collar / gland
    const glandGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.018, 16);
    const gland = new THREE.Mesh(glandGeo, this.metalMaterial);
    gland.rotation.z = Math.PI / 2;
    gland.position.set(this.width / 2 + 0.013, 0.04, -0.06);
    this.group.add(gland);

    // Cable connection node
    this.cableConnectPoint = new THREE.Object3D();
    this.cableConnectPoint.position.set(this.width / 2 + 0.024, 0.04, -0.06);
    this.group.add(this.cableConnectPoint);
  }

  getCableConnectionWorldPos() {
    const worldPos = new THREE.Vector3();
    this.cableConnectPoint.getWorldPosition(worldPos);
    return worldPos;
  }

  update(deltaSeconds, simState) {
    // 1. Smooth Drawer slide animation
    this.drawerTargetZ = simState.drawerOpen ? this.drawerZOpen : this.drawerZClosed;
    const drawerSpeed = 4.0;
    this.drawerCurrentZ += (this.drawerTargetZ - this.drawerCurrentZ) * Math.min(1.0, deltaSeconds * drawerSpeed);
    this.drawerGroup.position.z = this.drawerCurrentZ;

    // 2. Smooth Switch toggle animation
    const switchTarget = simState.powerOn ? 0.32 : -0.32;
    this.switchCurrentRot += (switchTarget - this.switchCurrentRot) * Math.min(1.0, deltaSeconds * 15.0);
    this.rockerPivot.rotation.x = this.switchCurrentRot;

    // 3. LED indicator intensity
    if (simState.powerOn) {
      this.ledMaterial.color.setHex(0x22c55e);
      this.ledMaterial.emissive.setHex(0x22c55e);
      this.ledMaterial.emissiveIntensity = 1.4;
    } else {
      this.ledMaterial.color.setHex(0x374151);
      this.ledMaterial.emissive.setHex(0x000000);
      this.ledMaterial.emissiveIntensity = 0.0;
    }

    // 4. Update LCD screens
    this.lcdLeft.update(simState, true);
    this.lcdRight.update(simState, false);

    // 5. Update Smartphones
    this.phoneA.group.visible = simState.phones.phoneA.present;
    this.phoneB.group.visible = simState.phones.phoneB.present;

    if (simState.phones.phoneA.present) {
      this.phoneA.update(simState.phones.phoneA, simState.powerOn);
    }
    if (simState.phones.phoneB.present) {
      this.phoneB.update(simState.phones.phoneB, simState.powerOn);
    }

    // Drawer charging LEDs
    const ledAOn = simState.powerOn && simState.phones.phoneA.present && simState.phones.phoneA.active;
    this.drawerLedA.material.emissiveIntensity = ledAOn ? 1.5 : 0.0;

    const ledBOn = simState.powerOn && simState.phones.phoneB.present && simState.phones.phoneB.active;
    this.drawerLedB.material.emissiveIntensity = ledBOn ? 1.5 : 0.0;

    // 6. Cooling Fan Rotation
    if (simState.coolingFanSpeed > 0 && this.fanPivot) {
      const fanRadPerSec = (simState.coolingFanSpeed / 100) * 45;
      this.fanPivot.rotation.z += fanRadPerSec * deltaSeconds;
    }
  }
}
