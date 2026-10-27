/**
 * HouseModel.js
 * High-quality 3D residential / emergency shelter house positioned in the background.
 * Provides authentic outdoor context showing SolarSaver-SS deployed outside a home.
 */
import * as THREE from 'three';

export class HouseModel {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'BackgroundHouseEnvironment';

    // Position house in the background (Y=0, Z=-3.8m to -4.5m)
    this.group.position.set(0.4, 0, -3.6);

    this.initMaterials();
    this.initHouseStructure();
    this.initPorchAndDoor();
    this.initWindows();
    this.initRoofAndSolar();
    this.initYardElements();
  }

  initMaterials() {
    // Siding walls: Warm off-white / light cream wood clapboard
    this.wallMat = new THREE.MeshStandardMaterial({
      color: 0xebf2fa,
      roughness: 0.65,
      metalness: 0.05
    });

    // Accent trim / corner boards: Deep charcoal navy
    this.trimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.1
    });

    // Pitched Roof: Architectural dark graphite shingles
    this.roofMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.15
    });

    // Porch Wood Deck
    this.deckMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.75,
      metalness: 0.05
    });

    // Windows glass with warm interior glow & reflection
    this.windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });

    // Warm Porch lantern emissive light
    this.lanternLightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.2
    });

    // Roof Solar Panels
    this.roofSolarMat = new THREE.MeshStandardMaterial({
      color: 0x0f294d,
      roughness: 0.25,
      metalness: 0.6
    });

    // Green Foliage / bushes
    this.bushMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.8,
      metalness: 0.05
    });

    // Wood fence
    this.fenceMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.8
    });
  }

  initHouseStructure() {
    // Main house body: 5.4m wide, 2.8m high, 3.2m deep
    const houseW = 5.4;
    const houseH = 2.6;
    const houseD = 3.2;

    const bodyGeo = new THREE.BoxGeometry(houseW, houseH, houseD);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.wallMat);
    bodyMesh.position.set(0, houseH / 2, 0);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.group.add(bodyMesh);

    // Stone foundation base
    const baseGeo = new THREE.BoxGeometry(houseW + 0.15, 0.3, houseD + 0.15);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.9
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.15, 0);
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Corner trim columns
    const trimGeo = new THREE.BoxGeometry(0.12, houseH, 0.12);
    [
      [-houseW / 2, -houseD / 2], [houseW / 2, -houseD / 2],
      [-houseW / 2,  houseD / 2], [houseW / 2,  houseD / 2]
    ].forEach(([x, z]) => {
      const trim = new THREE.Mesh(trimGeo, this.trimMat);
      trim.position.set(x, houseH / 2, z);
      this.group.add(trim);
    });

    // Second level gabled triangular pediment on front facade
    const gableGeo = new THREE.ConeGeometry(houseW * 0.55, 1.3, 4);
    const gableMesh = new THREE.Mesh(gableGeo, this.wallMat);
    gableMesh.rotation.y = Math.PI / 4;
    gableMesh.position.set(0, houseH + 0.65, 0);
    gableMesh.scale.set(1.0, 1.0, houseD / houseW);
    this.group.add(gableMesh);
  }

  initPorchAndDoor() {
    // Front porch deck platform
    const porchW = 2.4;
    const porchH = 0.25;
    const porchD = 1.0;
    const porchGeo = new THREE.BoxGeometry(porchW, porchH, porchD);
    const porchMesh = new THREE.Mesh(porchGeo, this.deckMat);
    porchMesh.position.set(0, porchH / 2, 1.6 + porchD / 2);
    porchMesh.castShadow = true;
    porchMesh.receiveShadow = true;
    this.group.add(porchMesh);

    // Porch steps
    const stepGeo = new THREE.BoxGeometry(1.2, 0.12, 0.4);
    const stepMesh = new THREE.Mesh(stepGeo, this.deckMat);
    stepMesh.position.set(0, 0.06, 1.6 + porchD + 0.2);
    this.group.add(stepMesh);

    // Porch posts (support columns)
    const postGeo = new THREE.BoxGeometry(0.08, 2.1, 0.08);
    [-porchW / 2 + 0.1, porchW / 2 - 0.1].forEach(x => {
      const post = new THREE.Mesh(postGeo, this.trimMat);
      post.position.set(x, 1.15, 1.6 + porchD - 0.08);
      post.castShadow = true;
      this.group.add(post);
    });

    // Porch awning roof
    const awningGeo = new THREE.BoxGeometry(porchW + 0.2, 0.12, porchD + 0.2);
    const awningMesh = new THREE.Mesh(awningGeo, this.roofMat);
    awningMesh.position.set(0, 2.2, 1.6 + porchD / 2);
    awningMesh.rotation.x = 0.12;
    awningMesh.castShadow = true;
    this.group.add(awningMesh);

    // Front Entrance Door
    const doorGeo = new THREE.BoxGeometry(0.85, 1.8, 0.06);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant blue door
      roughness: 0.4,
      metalness: 0.1
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 1.05, 1.605);
    this.group.add(doorMesh);

    // Door handle & glass panel
    const knobGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const knob = new THREE.Mesh(knobGeo, this.trimMat);
    knob.position.set(0.32, 1.0, 1.64);
    this.group.add(knob);

    // Porch wall lantern
    const lanternGeo = new THREE.BoxGeometry(0.12, 0.2, 0.12);
    const lantern = new THREE.Mesh(lanternGeo, this.lanternLightMat);
    lantern.position.set(0.55, 1.65, 1.63);
    this.group.add(lantern);

    // Gentle warm point light on porch
    const porchLight = new THREE.PointLight(0xfde047, 0.8, 3.5);
    porchLight.position.set(0, 1.8, 2.1);
    this.group.add(porchLight);
  }

  initWindows() {
    const winW = 0.85;
    const winH = 1.1;

    // Window frame template
    const frameGeo = new THREE.BoxGeometry(winW, winH, 0.06);
    const glassGeo = new THREE.PlaneGeometry(winW - 0.1, winH - 0.1);

    // Left and right front windows on ground floor
    [-1.75, 1.75].forEach(x => {
      const frame = new THREE.Mesh(frameGeo, this.trimMat);
      frame.position.set(x, 1.4, 1.605);
      this.group.add(frame);

      const glass = new THREE.Mesh(glassGeo, this.windowGlassMat);
      glass.position.set(x, 1.4, 1.64);
      this.group.add(glass);

      // Window mullions (cross bars)
      const barH = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.08, 0.02, 0.02), this.trimMat);
      barH.position.set(x, 1.4, 1.645);
      this.group.add(barH);

      const barV = new THREE.Mesh(new THREE.BoxGeometry(0.02, winH - 0.08, 0.02), this.trimMat);
      barV.position.set(x, 1.4, 1.645);
      this.group.add(barV);

      // Flower box under window
      const flowerBox = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.1, 0.14, 0.18), this.deckMat);
      flowerBox.position.set(x, 0.78, 1.68);
      this.group.add(flowerBox);

      // Flowers in flower box
      const flowerBush = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.08, 0.1, 0.16), this.bushMat);
      flowerBush.position.set(x, 0.88, 1.68);
      this.group.add(flowerBush);
    });

    // Attic round / arched window
    const atticWinGeo = new THREE.CircleGeometry(0.35, 24);
    const atticWin = new THREE.Mesh(atticWinGeo, this.windowGlassMat);
    atticWin.position.set(0, 3.0, 1.61);
    this.group.add(atticWin);
  }

  initRoofAndSolar() {
    // Pitched Roof Left and Right Slopes
    const roofSlopeW = 5.8;
    const roofSlopeL = 2.1;
    const slopeGeo = new THREE.BoxGeometry(roofSlopeW, 0.08, roofSlopeL);

    // Front slope
    const frontSlope = new THREE.Mesh(slopeGeo, this.roofMat);
    frontSlope.position.set(0, 3.2, 0.85);
    frontSlope.rotation.x = 0.58;
    frontSlope.castShadow = true;
    this.group.add(frontSlope);

    // Back slope
    const backSlope = new THREE.Mesh(slopeGeo, this.roofMat);
    backSlope.position.set(0, 3.2, -0.85);
    backSlope.rotation.x = -0.58;
    backSlope.castShadow = true;
    this.group.add(backSlope);

    // Rooftop Solar Array (Grid of 6 rooftop panels on front slope)
    const pW = 1.0;
    const pH = 0.7;
    const pGeo = new THREE.BoxGeometry(pW, 0.02, pH);

    [-1.2, 0, 1.2].forEach(xOff => {
      const p1 = new THREE.Mesh(pGeo, this.roofSolarMat);
      p1.position.set(xOff, 3.3, 0.75);
      p1.rotation.x = 0.58;
      this.group.add(p1);

      const p2 = new THREE.Mesh(pGeo, this.roofSolarMat);
      p2.position.set(xOff, 2.9, 1.35);
      p2.rotation.x = 0.58;
      this.group.add(p2);
    });

    // Chimney on roof
    const chimGeo = new THREE.BoxGeometry(0.45, 1.2, 0.45);
    const chimMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Red brick
      roughness: 0.9
    });
    const chimney = new THREE.Mesh(chimGeo, chimMat);
    chimney.position.set(-1.8, 3.7, -0.4);
    chimney.castShadow = true;
    this.group.add(chimney);
  }

  initYardElements() {
    // Shrubbery / decorative bushes along the front foundation
    [-2.2, -1.2, 1.2, 2.2].forEach(x => {
      const bushGeo = new THREE.DodecahedronGeometry(0.38 + Math.random() * 0.1, 1);
      const bush = new THREE.Mesh(bushGeo, this.bushMat);
      bush.position.set(x, 0.35, 1.85);
      bush.scale.set(1.2, 0.9, 1.0);
      bush.castShadow = true;
      this.group.add(bush);
    });

    // Picket fence sections on sides of the yard
    const fenceSectionW = 1.8;
    const fenceH = 0.85;
    [-3.2, 3.2].forEach(sideX => {
      const fenceRail = new THREE.Mesh(new THREE.BoxGeometry(fenceSectionW, 0.06, 0.04), this.fenceMat);
      fenceRail.position.set(sideX, 0.5, 2.0);
      this.group.add(fenceRail);

      // Pickets
      for (let p = 0; p < 8; p++) {
        const picket = new THREE.Mesh(new THREE.BoxGeometry(0.08, fenceH, 0.02), this.fenceMat);
        picket.position.set(sideX - fenceSectionW / 2 + p * 0.24, fenceH / 2, 2.0);
        this.group.add(picket);
      }
    });

    // Garden outdoor work table where SolarSaver-SS can sit
    // Situated at X = 0.0, Z = 0.0
    const tableTopGeo = new THREE.BoxGeometry(1.2, 0.05, 0.8);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Rich outdoor treated timber
      roughness: 0.7,
      metalness: 0.1
    });
    this.tableMesh = new THREE.Mesh(tableTopGeo, tableMat);
    // Height: top surface flush at Y = 0 (table top under the station)
    this.tableMesh.position.set(0.15, -0.025, 0.0);
    this.tableMesh.receiveShadow = true;
    this.tableMesh.castShadow = true;
    this.group.add(this.tableMesh);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12);
    [
      [-0.45, -0.3], [0.75, -0.3],
      [-0.45,  0.3], [0.75,  0.3]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, tableMat);
      leg.position.set(lx, -0.325, lz);
      leg.castShadow = true;
      this.group.add(leg);
    });
  }
}
