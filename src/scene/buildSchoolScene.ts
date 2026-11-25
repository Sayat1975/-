import * as THREE from 'three';
import { SCHOOL_ZONES, ZoneId } from '../data/schoolData';
import { SchoolMaterials } from './materials';
import {
  AnimatedDoor,
  createBasketballHoop,
  createBench,
  createBikeRack,
  createBookshelf,
  createChalkboardUnit,
  createClassroomDoor,
  createComputerStation,
  createFlagpole,
  createFlowerbed,
  createLabBench,
  createLampPost,
  createLockerBank,
  createPottedPlant,
  createReadingTable,
  createRulesBoard,
  createStudentDeskSet,
  createTeacherDesk,
  createTree,
} from './models';
import { DynamicSignHandles } from './textures';

export interface WallCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface BuiltSchoolScene {
  root: THREE.Group;
  upperStoryGroup: THREE.Group;
  clickables: THREE.Object3D[];
  animatedDoors: AnimatedDoor[];
  flagMesh: THREE.Mesh;
  colliders: WallCollider[];
  detectZoneAt: (x: number, z: number) => ZoneId;
}

const FLOOR_Y = 0.3;
const WALL_H = 4.0;

function addBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  castShadow = true,
  receiveShadow = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

export function buildSchoolScene(
  mats: SchoolMaterials,
  signs: DynamicSignHandles,
): BuiltSchoolScene {
  const root = new THREE.Group();
  const upperStoryGroup = new THREE.Group();
  const clickables: THREE.Object3D[] = [];
  const animatedDoors: AnimatedDoor[] = [];
  const colliders: WallCollider[] = [];

  const registerCollider = (minX: number, maxX: number, minZ: number, maxZ: number) => {
    colliders.push({ minX, maxX, minZ, maxZ });
  };

  // =========================================================================
  // 1. EXTENDED TERRAIN, COURTYARD PLAZA & NATURAL PERIMETER
  // =========================================================================
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), mats.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  // Subtle surrounding horizon hills beyond fence so world never ends in a sharp void
  const hillCoords: Array<[number, number, number, number]> = [
    [-65, -45, 28, 7],
    [0, -68, 42, 9],
    [68, -42, 30, 8],
    [-72, 22, 26, 6],
    [74, 24, 28, 6.5],
  ];
  hillCoords.forEach(([hx, hz, radius, height]) => {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), mats.grass);
    hill.scale.set(1.4, height / radius, 1.1);
    hill.position.set(hx, -height * 0.25, hz);
    hill.receiveShadow = true;
    root.add(hill);
  });

  // Main paved courtyard plaza (offset +0.025 above grass to avoid Z-fighting)
  const mainPlaza = new THREE.Mesh(new THREE.BoxGeometry(46, 0.06, 26), mats.paving);
  mainPlaza.position.set(0, 0.03, 15.5);
  mainPlaza.receiveShadow = true;
  root.add(mainPlaza);

  // Entrance approach walkway to front gates
  const frontWalkway = new THREE.Mesh(new THREE.BoxGeometry(8, 0.07, 14), mats.paving);
  frontWalkway.position.set(0, 0.035, 31);
  frontWalkway.receiveShadow = true;
  root.add(frontWalkway);

  // Side decorative lawn islands inside courtyard
  [-15.5, 15.5].forEach((x) => {
    const island = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.08, 14.5), mats.grass);
    island.position.set(x, 0.04, 18.5);
    island.receiveShadow = true;
    root.add(island);
  });

  // Basketball Half-Court (West Courtyard)
  const court = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.09, 13.0), mats.basketballCourt);
  court.position.set(-15.5, 0.055, 18.5);
  court.receiveShadow = true;
  root.add(court);

  const hoop = createBasketballHoop(mats);
  hoop.position.set(-15.5, 0.08, 12.6);
  root.add(hoop);

  // Ceremonial Flagpole Plaza in Courtyard Center
  const flagRing = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 0.1, 24), mats.curbStone);
  flagRing.position.set(0, 0.05, 16.5);
  flagRing.receiveShadow = true;
  root.add(flagRing);

  const { group: flagpoleGroup, flagMesh } = createFlagpole(mats);
  flagpoleGroup.position.set(0, 0.1, 16.5);
  root.add(flagpoleGroup);

  // Courtyard Garden & Seating Grove (East Courtyard)
  const eastWalk = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.09, 13.5), mats.paving);
  eastWalk.position.set(15.5, 0.05, 18.5);
  eastWalk.receiveShadow = true;
  root.add(eastWalk);

  const benchSpecs: Array<[number, number, number]> = [
    [12.2, 15.0, Math.PI / 2],
    [12.2, 21.0, Math.PI / 2],
    [18.8, 15.0, -Math.PI / 2],
    [18.8, 21.0, -Math.PI / 2],
    [-5.8, 11.5, 0],
    [5.8, 11.5, 0],
  ];
  benchSpecs.forEach(([bx, bz, ry]) => {
    const bench = createBench(mats);
    bench.position.set(bx, 0.06, bz);
    bench.rotation.y = ry;
    root.add(bench);
  });

  // Flowerbeds framing the grand school entrance
  [-11.5, 11.5].forEach((fx) => {
    const bed = createFlowerbed(mats, 7.2, 2.0);
    bed.position.set(fx, 0.06, 4.4);
    root.add(bed);
  });

  // Outdoor Bicycle Rack near West Front Gate
  const bikeRack = createBikeRack(mats);
  bikeRack.position.set(-6.8, 0.06, 25.4);
  root.add(bikeRack);

  // Courtyard Street Lamps
  const lampCoords: Array<[number, number]> = [
    [-5.2, 7.6],
    [5.2, 7.6],
    [-5.2, 23.0],
    [5.2, 23.0],
    [15.5, 11.8],
  ];
  lampCoords.forEach(([lx, lz]) => {
    const lamp = createLampPost(mats);
    lamp.position.set(lx, 0.06, lz);
    root.add(lamp);
  });

  // Outdoor Clickable Courtyard Rules Kiosk (right beside entrance approach)
  const courtyardZone = SCHOOL_ZONES.find((z) => z.id === 'courtyard')!;
  const courtyardBoardTex = signs.boardTextures.get('courtyard')!.texture;
  const outdoorRules = createRulesBoard(
    mats,
    courtyardBoardTex,
    'courtyard',
    courtyardZone.accentHex,
    true,
  );
  outdoorRules.group.position.set(5.4, 0.06, 8.8);
  outdoorRules.group.rotation.y = -0.32;
  root.add(outdoorRules.group);
  clickables.push(outdoorRules.hitMesh);

  // Courtyard & Campus Trees (composite multi-part trees)
  const treeSpecs: Array<[number, number, number, number]> = [
    [15.5, 18.5, 1, 1.08],
    [22.5, 12.0, 2, 1.15],
    [22.5, 22.5, 3, 1.0],
    [-23.2, 10.5, 4, 1.12],
    [-23.2, 22.5, 5, 1.05],
    [-26.5, -5.0, 6, 1.25],
    [26.5, -5.0, 7, 1.22],
    [-16.0, -20.5, 8, 1.18],
    [0.0, -21.5, 9, 1.28],
    [16.0, -20.5, 10, 1.15],
    [-31.0, 16.0, 11, 1.32],
    [31.0, 16.0, 12, 1.26],
  ];
  treeSpecs.forEach(([tx, tz, seed, sc]) => {
    const tree = createTree(mats, seed, sc);
    tree.position.set(tx, 0, tz);
    root.add(tree);
  });

  // Perimeter Decorative Campus Fence (Front & Sides with Entrance Gate Arch)
  const fenceZ = 28.5;
  const buildFenceSegment = (x1: number, z1: number, x2: number, z2: number) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const seg = new THREE.Group();
    seg.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    seg.rotation.y = angle;

    // Low brick plinth
    addBox(seg, 0.34, 0.42, len, 0, 0.21, 0, mats.plinthStone, true, true);
    // Horizontal top & bottom metal rails
    addBox(seg, 0.06, 0.06, len, 0, 1.65, 0, mats.darkMetal, false, false);
    addBox(seg, 0.06, 0.06, len, 0, 0.56, 0, mats.darkMetal, false, false);

    // Brick piers every ~5m
    const pierCount = Math.max(2, Math.round(len / 5.5) + 1);
    for (let i = 0; i < pierCount; i++) {
      const pz = -len / 2 + (i / (pierCount - 1)) * len;
      addBox(seg, 0.52, 1.88, 0.52, 0, 0.94, pz, mats.facade, true, true);
      addBox(seg, 0.62, 0.12, 0.62, 0, 1.92, pz, mats.curbStone, true, true);
    }

    // Vertical pickets (instanced per segment for clean performance)
    const picketCount = Math.floor(len / 0.28);
    if (picketCount > 0) {
      const picketGeo = new THREE.BoxGeometry(0.032, 1.12, 0.032);
      const pickets = new THREE.InstancedMesh(picketGeo, mats.darkMetal, picketCount);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < picketCount; i++) {
        dummy.position.set(0, 1.1, -len / 2 + 0.14 + i * 0.28);
        dummy.updateMatrix();
        pickets.setMatrixAt(i, dummy.matrix);
      }
      pickets.computeBoundingSphere();
      seg.add(pickets);
    }

    root.add(seg);
  };

  buildFenceSegment(-25.5, fenceZ, -4.2, fenceZ);
  buildFenceSegment(4.2, fenceZ, 25.5, fenceZ);
  buildFenceSegment(-25.5, -16.5, -25.5, fenceZ);
  buildFenceSegment(25.5, -16.5, 25.5, fenceZ);

  // Grand School Gate Pillars
  [-4.2, 4.2].forEach((gx) => {
    addBox(root, 0.95, 2.75, 0.95, gx, 1.375, fenceZ, mats.facade, true, true);
    addBox(root, 1.12, 0.18, 1.12, gx, 2.84, fenceZ, mats.facadeTrim, true, true);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), mats.lampGlow);
    globe.position.set(gx, 3.16, fenceZ);
    root.add(globe);
  });

  // =========================================================================
  // 2. SCHOOL BUILDING STRUCTURE (GROUND FLOOR + INTERIORS)
  // =========================================================================
  // Raised Building Foundation Plinth (X: -22..22, Z: -14..2)
  addBox(root, 44.4, FLOOR_Y, 16.4, 0, FLOOR_Y / 2, -6.0, mats.plinthStone, false, true);

  // Entrance Steps leading up from Courtyard to Main Door
  addBox(root, 7.6, 0.1, 1.5, 0, 0.05, 3.3, mats.curbStone, false, true);
  addBox(root, 7.2, 0.2, 1.1, 0, 0.1, 2.75, mats.curbStone, false, true);
  addBox(root, 6.8, 0.3, 0.8, 0, 0.15, 2.35, mats.curbStone, false, true);

  // Entrance Portico Columns & Canopy
  [-3.2, 3.2].forEach((cx) => {
    const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.45, 0.68), mats.curbStone);
    colBase.position.set(cx, FLOOR_Y + 0.225, 3.4);
    root.add(colBase);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 4.0, 12), mats.facade);
    col.position.set(cx, FLOOR_Y + 2.35, 3.4);
    col.castShadow = true;
    root.add(col);
  });
  addBox(root, 8.2, 0.36, 2.5, 0, FLOOR_Y + 4.35, 2.95, mats.facadeTrim, true, true);

  // Interior Floors (offset slightly above foundation to guarantee zero Z-fighting)
  // Corridor floor: X: -21.8..21.8, Z: -3.35..1.85
  const corridorFloor = new THREE.Mesh(new THREE.PlaneGeometry(43.6, 5.2), mats.corridorFloor);
  corridorFloor.rotation.x = -Math.PI / 2;
  corridorFloor.position.set(0, FLOOR_Y + 0.015, -0.75);
  corridorFloor.receiveShadow = true;
  root.add(corridorFloor);

  // Classroom Floors (4 rooms across North side: Z: -13.8..-3.4)
  const roomCentersX = [-16.25, -5.5, 5.5, 16.25];
  const roomFloorMats = [mats.woodFloor, mats.labFloor, mats.woodFloor, mats.corridorFloor];
  roomCentersX.forEach((rx, idx) => {
    const w = idx === 0 || idx === 3 ? 10.6 : 10.7;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, 10.3), roomFloorMats[idx]);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(rx, FLOOR_Y + 0.015, -8.6);
    floor.receiveShadow = true;
    root.add(floor);
  });

  // Helper to build windowed exterior wall bays cleanly (facade outside +Z, interiorWall inside -Z)
  const buildWindowBay = (
    x: number,
    z: number,
    width: number,
    rotY = 0,
    parent: THREE.Object3D = root,
  ) => {
    const bay = new THREE.Group();
    bay.position.set(x, FLOOR_Y, z);
    bay.rotation.y = rotY;

    // Lower sill wall (exterior facade + interior plaster)
    addBox(bay, width, 1.05, 0.22, 0, 0.525, 0.06, mats.facade, true, true);
    addBox(bay, width, 1.05, 0.14, 0, 0.525, -0.11, mats.interiorWall, false, true);

    // Upper lintel (exterior facade + interior plaster)
    addBox(bay, width, 0.72, 0.22, 0, WALL_H - 0.36, 0.06, mats.facade, true, true);
    addBox(bay, width, 0.72, 0.14, 0, WALL_H - 0.36, -0.11, mats.interiorWall, false, true);

    // Side mullions
    addBox(bay, 0.24, WALL_H, 0.24, -width / 2 + 0.12, WALL_H / 2, 0.06, mats.facade, true, true);
    addBox(bay, 0.24, WALL_H, 0.16, -width / 2 + 0.12, WALL_H / 2, -0.11, mats.interiorWall, false, true);
    addBox(bay, 0.24, WALL_H, 0.24, width / 2 - 0.12, WALL_H / 2, 0.06, mats.facade, true, true);
    addBox(bay, 0.24, WALL_H, 0.16, width / 2 - 0.12, WALL_H / 2, -0.11, mats.interiorWall, false, true);

    // Center mullion
    addBox(bay, 0.08, 2.25, 0.12, 0, 2.15, 0, mats.darkMetal, false, false);
    // Window sill ledge
    addBox(bay, width - 0.18, 0.07, 0.44, 0, 1.07, 0, mats.curbStone, false, false);
    // Glazing pane
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.46, 2.22),
      mats.glassWindow,
    );
    glass.position.set(0, 2.16, 0);
    bay.add(glass);

    parent.add(bay);
  };

  // --- South Exterior Wall (facing Courtyard, Z = 1.95) ---
  // Left & Right of Main Entrance (Entrance opening is X: -2.1..2.1)
  buildWindowBay(-19.0, 1.95, 5.8);
  buildWindowBay(-13.2, 1.95, 5.8);
  buildWindowBay(-7.4, 1.95, 5.8);
  addBox(root, 2.4, WALL_H, 0.24, -3.3, FLOOR_Y + WALL_H / 2, 2.02, mats.facade);
  addBox(root, 2.4, WALL_H, 0.16, -3.3, FLOOR_Y + WALL_H / 2, 1.83, mats.interiorWall, false, true);

  addBox(root, 2.4, WALL_H, 0.24, 3.3, FLOOR_Y + WALL_H / 2, 2.02, mats.facade);
  addBox(root, 2.4, WALL_H, 0.16, 3.3, FLOOR_Y + WALL_H / 2, 1.83, mats.interiorWall, false, true);
  buildWindowBay(7.4, 1.95, 5.8);
  buildWindowBay(13.2, 1.95, 5.8);
  buildWindowBay(19.0, 1.95, 5.8);

  // Entrance Transom Header above double glass doors
  addBox(root, 4.4, 1.15, 0.24, 0, FLOOR_Y + WALL_H - 0.575, 2.02, mats.facade);
  addBox(root, 4.4, 1.15, 0.16, 0, FLOOR_Y + WALL_H - 0.575, 1.83, mats.interiorWall, false, true);

  // Interactive Main Double Glass Entrance Doors (opening X: -2.1..2.1, Z = 1.95)
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-2.05, FLOOR_Y, 1.95);
  addBox(leftDoorPivot, 2.0, 2.8, 0.08, 1.0, 1.4, 0, mats.glassDoor, false, false);
  addBox(leftDoorPivot, 2.0, 0.14, 0.1, 1.0, 0.08, 0, mats.darkMetal, false, false);
  addBox(leftDoorPivot, 2.0, 0.12, 0.1, 1.0, 2.74, 0, mats.darkMetal, false, false);
  addBox(leftDoorPivot, 0.1, 2.8, 0.1, 0.05, 1.4, 0, mats.darkMetal, false, false);
  addBox(leftDoorPivot, 0.1, 2.8, 0.1, 1.95, 1.4, 0, mats.darkMetal, false, false);
  addBox(leftDoorPivot, 0.05, 0.65, 0.14, 1.78, 1.28, 0, mats.brass, false, false);
  root.add(leftDoorPivot);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(2.05, FLOOR_Y, 1.95);
  addBox(rightDoorPivot, 2.0, 2.8, 0.08, -1.0, 1.4, 0, mats.glassDoor, false, false);
  addBox(rightDoorPivot, 2.0, 0.14, 0.1, -1.0, 0.08, 0, mats.darkMetal, false, false);
  addBox(rightDoorPivot, 2.0, 0.12, 0.1, -1.0, 2.74, 0, mats.darkMetal, false, false);
  addBox(rightDoorPivot, 0.1, 2.8, 0.1, -0.05, 1.4, 0, mats.darkMetal, false, false);
  addBox(rightDoorPivot, 0.1, 2.8, 0.1, -1.95, 1.4, 0, mats.darkMetal, false, false);
  addBox(rightDoorPivot, 0.05, 0.65, 0.14, -1.78, 1.28, 0, mats.brass, false, false);
  root.add(rightDoorPivot);

  // Main Entrance Plaque above doors
  const entPlaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.68),
    new THREE.MeshStandardMaterial({
      map: signs.doorTextures.get('entrance')!.texture,
      roughness: 0.35,
    }),
  );
  entPlaque.position.set(0, FLOOR_Y + 3.4, 2.18);
  root.add(entPlaque);

  // Hitbox for clicking the Main Entrance to walk inside
  const entranceHit = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 3.1, 0.8),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  entranceHit.position.set(0, FLOOR_Y + 1.55, 1.95);
  entranceHit.userData = { interactType: 'door', zoneId: 'corridor' as ZoneId };
  root.add(entranceHit);
  clickables.push(entranceHit);

  animatedDoors.push({
    zoneId: 'corridor',
    pivot: leftDoorPivot,
    rightPivot: rightDoorPivot,
    isDouble: true,
    worldPos: new THREE.Vector3(0, FLOOR_Y, 1.95),
    closedAngle: 0,
    openAngle: -Math.PI * 0.45,
    currentAngle: 0,
  });

  // Colliders for South wall (leaving entrance open X: -2.0..2.0)
  registerCollider(-22.2, -2.1, 1.65, 2.25);
  registerCollider(2.1, 22.2, 1.65, 2.25);

  // --- North Exterior Wall (Z = -13.95) with wide classroom windows ---
  [-16.25, -5.5, 5.5, 16.25].forEach((wx) => {
    buildWindowBay(wx, -13.95, 7.6, Math.PI);
  });
  // Solid piers between North windows (facade outside, interiorWall inside)
  [-21.1, -10.9, 0.0, 10.9, 21.1].forEach((px) => {
    addBox(root, 2.2, WALL_H, 0.24, px, FLOOR_Y + WALL_H / 2, -14.03, mats.facade);
    addBox(root, 2.2, WALL_H, 0.16, px, FLOOR_Y + WALL_H / 2, -13.83, mats.interiorWall, false, true);
  });
  registerCollider(-22.2, 22.2, -14.25, -13.65);

  // --- West & East Exterior Walls (X = -21.95, X = 21.95) ---
  [-21.95, 21.95].forEach((ex) => {
    const rot = ex < 0 ? -Math.PI / 2 : Math.PI / 2;
    const inward = ex < 0 ? 0.12 : -0.12;
    const outward = ex < 0 ? -0.08 : 0.08;
    buildWindowBay(ex, -8.6, 6.2, rot);
    addBox(root, 0.24, WALL_H, 4.4, ex + outward, FLOOR_Y + WALL_H / 2, -12.1, mats.facade);
    addBox(root, 0.16, WALL_H, 4.4, ex + inward, FLOOR_Y + WALL_H / 2, -12.1, mats.interiorWall, false, true);
    addBox(root, 0.24, WALL_H, 7.8, ex + outward, FLOOR_Y + WALL_H / 2, -1.75, mats.facade);
    addBox(root, 0.16, WALL_H, 7.8, ex + inward, FLOOR_Y + WALL_H / 2, -1.75, mats.interiorWall, false, true);
  });
  registerCollider(-22.25, -21.65, -14.2, 2.2);
  registerCollider(21.65, 22.25, -14.2, 2.2);

  // --- Interior Partition Walls between the 4 Classrooms ---
  [-10.9, 0.0, 10.9].forEach((px) => {
    addBox(root, 0.24, WALL_H, 10.5, px, FLOOR_Y + WALL_H / 2, -8.65, mats.interiorWall, false, true);
    registerCollider(px - 0.25, px + 0.25, -14.0, -3.35);
  });

  // --- Interior Corridor-to-Classroom Wall (Z = -3.4) with 4 Interactive Doors ---
  const classroomDoors: Array<{ zoneId: ZoneId; doorX: number }> = [
    { zoneId: 'classroom-math', doorX: -15.5 },
    { zoneId: 'classroom-science', doorX: -5.5 },
    { zoneId: 'classroom-library', doorX: 5.5 },
    { zoneId: 'classroom-it', doorX: 15.5 },
  ];

  // Solid corridor wall segments between doorways (each doorway is 1.45m wide around doorX)
  const wallRuns: Array<[number, number]> = [
    [-21.8, -16.25],
    [-14.75, -6.25],
    [-4.75, 4.75],
    [6.25, 14.75],
    [16.25, 21.8],
  ];
  wallRuns.forEach(([x1, x2]) => {
    const w = x2 - x1;
    addBox(
      root,
      w,
      WALL_H,
      0.24,
      (x1 + x2) / 2,
      FLOOR_Y + WALL_H / 2,
      -3.4,
      mats.interiorWall,
      false,
      true,
    );
    registerCollider(x1, x2, -3.62, -3.18);
  });

  // Header panels above each classroom doorway + interactive door assemblies
  classroomDoors.forEach(({ zoneId, doorX }) => {
    addBox(root, 1.52, 1.45, 0.24, doorX, FLOOR_Y + WALL_H - 0.725, -3.4, mats.interiorWall, false, true);

    const doorTex = signs.doorTextures.get(zoneId)!.texture;
    const doorObj = createClassroomDoor(mats, doorTex, zoneId);
    doorObj.group.position.set(doorX, FLOOR_Y, -3.4);
    root.add(doorObj.group);
    clickables.push(doorObj.hitMesh);

    animatedDoors.push({
      zoneId,
      pivot: doorObj.pivot,
      worldPos: new THREE.Vector3(doorX, FLOOR_Y, -3.4),
      closedAngle: 0,
      openAngle: Math.PI * 0.46,
      currentAngle: 0,
    });
  });

  // =========================================================================
  // 3. UPPER STORY & ARCHITECTURAL ROOF (Toggleable in Floorplan Cutaway!)
  // =========================================================================
  // Ground floor interior ceiling slab
  addBox(
    upperStoryGroup,
    43.8,
    0.26,
    16.0,
    0,
    FLOOR_Y + WALL_H + 0.13,
    -6.0,
    mats.ceiling,
    false,
    false,
  );

  // Second story decorative architectural massing (Y: 4.56..8.4)
  const secondY = FLOOR_Y + WALL_H + 0.26;
  const secondH = 3.7;
  addBox(upperStoryGroup, 44.2, secondH, 16.2, 0, secondY + secondH / 2, -6.0, mats.facade, true, true);

  // Decorative 2nd floor window recesses across front facade
  [-18.5, -13.2, -7.8, 7.8, 13.2, 18.5].forEach((wx) => {
    addBox(upperStoryGroup, 3.6, 2.05, 0.16, wx, secondY + 1.9, 2.12, mats.darkMetal, false, false);
    addBox(upperStoryGroup, 3.35, 1.85, 0.18, wx, secondY + 1.9, 2.14, mats.glassWindow, false, false);
    addBox(upperStoryGroup, 3.8, 0.1, 0.34, wx, secondY + 0.85, 2.2, mats.curbStone, false, false);
  });

  // Central Architectural Pediment with School Sign & Clock
  addBox(upperStoryGroup, 10.4, 4.4, 0.65, 0, secondY + 2.2, 2.22, mats.facade, true, true);
  addBox(upperStoryGroup, 10.8, 0.28, 0.9, 0, secondY + 4.45, 2.3, mats.facadeTrim, true, true);

  // School Name Signboard on Center Facade
  const signFrame = addBox(upperStoryGroup, 8.6, 1.95, 0.14, 0, secondY + 1.35, 2.58, mats.facadeTrim, false, false);
  signFrame.castShadow = false;
  const signFace = new THREE.Mesh(
    new THREE.PlaneGeometry(8.3, 1.75),
    new THREE.MeshStandardMaterial({ map: signs.facadeTexture, roughness: 0.38, metalness: 0.1 }),
  );
  signFace.position.set(0, secondY + 1.35, 2.66);
  upperStoryGroup.add(signFace);

  // Architectural School Clock above the sign
  const clockRim = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.16, 24), mats.brass);
  clockRim.rotation.x = Math.PI / 2;
  clockRim.position.set(0, secondY + 3.25, 2.58);
  upperStoryGroup.add(clockRim);

  const clockDisc = new THREE.Mesh(new THREE.CircleGeometry(0.78, 24), mats.clockFace);
  clockDisc.position.set(0, secondY + 3.25, 2.67);
  upperStoryGroup.add(clockDisc);

  // Roof cornice & pitched architectural roof
  const roofBaseY = secondY + secondH;
  addBox(upperStoryGroup, 45.2, 0.36, 17.2, 0, roofBaseY + 0.18, -6.0, mats.facadeTrim, true, true);
  addBox(upperStoryGroup, 43.2, 0.75, 15.2, 0, roofBaseY + 0.72, -6.0, mats.roofTile, true, true);
  addBox(upperStoryGroup, 38.0, 0.55, 11.4, 0, roofBaseY + 1.32, -6.0, mats.roofTile, true, true);

  // Ceiling LED light panels inside corridor & rooms (attached to upperStoryGroup so cutaway stays clean)
  const addCeilingPanel = (x: number, z: number) => {
    addBox(
      upperStoryGroup,
      1.6,
      0.06,
      0.42,
      x,
      FLOOR_Y + WALL_H - 0.04,
      z,
      mats.lampGlow,
      false,
      false,
    );
  };
  [-15, -5, 5, 15].forEach((x) => {
    addCeilingPanel(x, -0.75);
    addCeilingPanel(x, -6.8);
    addCeilingPanel(x, -10.8);
  });

  root.add(upperStoryGroup);

  // =========================================================================
  // 4. INTERIOR FURNISHINGS — CORRIDOR
  // =========================================================================
  // Lockers along the corridor walls between doors
  [-10.5, 10.5].forEach((lx) => {
    const lockers = createLockerBank(mats, 5);
    lockers.position.set(lx, FLOOR_Y, -3.02);
    root.add(lockers);
  });

  // Corridor Benches overlooking the sunny courtyard windows
  [-10.5, 10.5].forEach((bx) => {
    const bench = createBench(mats);
    bench.position.set(bx, FLOOR_Y, 1.15);
    bench.rotation.y = Math.PI;
    root.add(bench);
  });

  // Potted Plants flanking the Main Entrance Lobby
  [-3.8, 3.8, -19.8, 19.8].forEach((px) => {
    const plant = createPottedPlant(mats);
    plant.position.set(px, FLOOR_Y, -2.85);
    root.add(plant);
  });

  // Clickable Corridor Rules Board right in the central lobby facing the main entrance!
  const corridorZone = SCHOOL_ZONES.find((z) => z.id === 'corridor')!;
  const corridorBoard = createRulesBoard(
    mats,
    signs.boardTextures.get('corridor')!.texture,
    'corridor',
    corridorZone.accentHex,
    false,
  );
  corridorBoard.group.position.set(0, FLOOR_Y + 1.95, -3.24);
  root.add(corridorBoard.group);
  clickables.push(corridorBoard.hitMesh);

  // =========================================================================
  // 5. ROOM 101 — MATHEMATICS CLASSROOM (X: -21.5..-11.0, Z: -13.7..-3.5)
  // =========================================================================
  const mathChalk = createChalkboardUnit(mats, signs.chalkboardTextures.get('classroom-math')!.texture);
  mathChalk.position.set(-16.25, FLOOR_Y + 1.95, -13.68);
  root.add(mathChalk);

  const mathTeacherDesk = createTeacherDesk(mats);
  mathTeacherDesk.position.set(-18.2, FLOOR_Y, -11.9);
  mathTeacherDesk.rotation.y = Math.PI;
  root.add(mathTeacherDesk);

  // 6 Student Desks in 2 columns x 3 rows facing the chalkboard (-Z)
  const notebookPalette = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#e11d48', '#0284c7'];
  let nbIdx = 0;
  [-18.6, -14.0].forEach((dx) => {
    [-9.8, -7.8, -5.8].forEach((dz) => {
      const desk = createStudentDeskSet(mats, notebookPalette[nbIdx++ % notebookPalette.length]);
      desk.position.set(dx, FLOOR_Y, dz);
      root.add(desk);
    });
  });

  // Bookshelf along east interior wall of Room 101
  const mathShelf = createBookshelf(mats, 11);
  mathShelf.position.set(-11.28, FLOOR_Y, -10.8);
  mathShelf.rotation.y = -Math.PI / 2;
  root.add(mathShelf);

  // Clickable Math Classroom Rules Board on East wall
  const mathZone = SCHOOL_ZONES.find((z) => z.id === 'classroom-math')!;
  const mathRules = createRulesBoard(
    mats,
    signs.boardTextures.get('classroom-math')!.texture,
    'classroom-math',
    mathZone.accentHex,
    false,
  );
  mathRules.group.position.set(-11.08, FLOOR_Y + 1.95, -7.2);
  mathRules.group.rotation.y = -Math.PI / 2;
  root.add(mathRules.group);
  clickables.push(mathRules.hitMesh);

  // =========================================================================
  // 6. ROOM 102 — SCIENCE & CHEMISTRY LAB (X: -10.7..-0.2, Z: -13.7..-3.5)
  // =========================================================================
  const sciChalk = createChalkboardUnit(mats, signs.chalkboardTextures.get('classroom-science')!.texture);
  sciChalk.position.set(-5.5, FLOOR_Y + 1.95, -13.68);
  root.add(sciChalk);

  // Periodic Table wall chart on West wall
  const periodicFrame = addBox(root, 0.06, 1.56, 3.06, -10.72, FLOOR_Y + 2.0, -9.2, mats.darkMetal, false, false);
  periodicFrame.castShadow = false;
  const periodicChart = new THREE.Mesh(new THREE.PlaneGeometry(2.94, 1.44), mats.periodicTable);
  periodicChart.position.set(-10.68, FLOOR_Y + 2.0, -9.2);
  periodicChart.rotation.y = Math.PI / 2;
  root.add(periodicChart);

  // 4 Chemistry Lab Benches
  [-8.0, -3.0].forEach((lx) => {
    [-10.2, -6.8].forEach((lz) => {
      const bench = createLabBench(mats);
      bench.position.set(lx, FLOOR_Y, lz);
      root.add(bench);
    });
  });

  // Clickable Lab Safety Rules Board on East wall
  const sciZone = SCHOOL_ZONES.find((z) => z.id === 'classroom-science')!;
  const sciRules = createRulesBoard(
    mats,
    signs.boardTextures.get('classroom-science')!.texture,
    'classroom-science',
    sciZone.accentHex,
    false,
  );
  sciRules.group.position.set(-0.18, FLOOR_Y + 1.95, -7.8);
  sciRules.group.rotation.y = -Math.PI / 2;
  root.add(sciRules.group);
  clickables.push(sciRules.hitMesh);

  // =========================================================================
  // 7. ROOM 103 — SCHOOL LIBRARY (X: 0.2..10.7, Z: -13.7..-3.5)
  // =========================================================================
  const libSign = createChalkboardUnit(
    mats,
    signs.chalkboardTextures.get('classroom-library')!.texture,
    3.6,
    1.45,
  );
  libSign.position.set(5.5, FLOOR_Y + 2.1, -13.68);
  root.add(libSign);

  // Perimeter Bookshelves along West & East walls
  [-11.4, -9.0, -6.6].forEach((bz, idx) => {
    const shelfW = createBookshelf(mats, idx + 1);
    shelfW.position.set(0.42, FLOOR_Y, bz);
    shelfW.rotation.y = Math.PI / 2;
    root.add(shelfW);
  });

  [-11.4, -9.0].forEach((bz, idx) => {
    const shelfE = createBookshelf(mats, idx + 6);
    shelfE.position.set(10.52, FLOOR_Y, bz);
    shelfE.rotation.y = -Math.PI / 2;
    root.add(shelfE);
  });

  // Two Reading Tables with green banker's lamps
  [-10.1, -6.5].forEach((tz) => {
    const table = createReadingTable(mats);
    table.position.set(5.5, FLOOR_Y, tz);
    root.add(table);
  });

  // Clickable Library Etiquette Board on East wall
  const libZone = SCHOOL_ZONES.find((z) => z.id === 'classroom-library')!;
  const libRules = createRulesBoard(
    mats,
    signs.boardTextures.get('classroom-library')!.texture,
    'classroom-library',
    libZone.accentHex,
    false,
  );
  libRules.group.position.set(10.72, FLOOR_Y + 1.95, -6.4);
  libRules.group.rotation.y = -Math.PI / 2;
  root.add(libRules.group);
  clickables.push(libRules.hitMesh);

  // =========================================================================
  // 8. ROOM 104 — IT & ROBOTICS LAB (X: 11.0..21.5, Z: -13.7..-3.5)
  // =========================================================================
  const itBoard = createChalkboardUnit(mats, signs.chalkboardTextures.get('classroom-it')!.texture);
  itBoard.position.set(16.25, FLOOR_Y + 1.95, -13.68);
  root.add(itBoard);

  // 6 Computer Workstation Desks (12 PCs!)
  let screenIdx = 0;
  [13.6, 18.8].forEach((ix) => {
    [-10.4, -8.1, -5.8].forEach((iz) => {
      const station = createComputerStation(mats, screenIdx++);
      station.position.set(ix, FLOOR_Y, iz);
      root.add(station);
    });
  });

  // Server rack cabinet in North-East corner
  const rack = addBox(root, 0.85, 2.2, 0.85, 20.9, FLOOR_Y + 1.1, -12.8, mats.darkMetal, true, true);
  rack.castShadow = true;
  [0.6, 1.0, 1.4, 1.8].forEach((ry) => {
    addBox(root, 0.65, 0.04, 0.04, 20.9, FLOOR_Y + ry, -12.36, mats.lampGlow, false, false);
  });

  // Clickable IT Digital Citizenship Rules Board on West wall
  const itZone = SCHOOL_ZONES.find((z) => z.id === 'classroom-it')!;
  const itRules = createRulesBoard(
    mats,
    signs.boardTextures.get('classroom-it')!.texture,
    'classroom-it',
    itZone.accentHex,
    false,
  );
  itRules.group.position.set(11.08, FLOOR_Y + 1.95, -7.4);
  itRules.group.rotation.y = Math.PI / 2;
  root.add(itRules.group);
  clickables.push(itRules.hitMesh);

  // Helper to detect which zone the player is standing in during Walk Mode
  const detectZoneAt = (x: number, z: number): ZoneId => {
    if (z > 2.0) return 'courtyard';
    if (z > -3.4) return 'corridor';
    if (x < -10.9) return 'classroom-math';
    if (x < 0.0) return 'classroom-science';
    if (x < 10.9) return 'classroom-library';
    return 'classroom-it';
  };

  return {
    root,
    upperStoryGroup,
    clickables,
    animatedDoors,
    flagMesh,
    colliders,
    detectZoneAt,
  };
}
