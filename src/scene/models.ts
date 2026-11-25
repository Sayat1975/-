import * as THREE from 'three';
import { ZoneId } from '../data/schoolData';
import { SchoolMaterials } from './materials';

export interface InteractiveTarget {
  mesh: THREE.Object3D;
  type: 'door' | 'rules-board';
  zoneId: ZoneId;
  doorPivot?: THREE.Group;
}

export interface AnimatedDoor {
  zoneId: ZoneId;
  pivot: THREE.Group;
  worldPos: THREE.Vector3;
  closedAngle: number;
  openAngle: number;
  currentAngle: number;
  isDouble?: boolean;
  rightPivot?: THREE.Group;
}

const shadowPlaneGeo = new THREE.PlaneGeometry(1, 1);

export function addContactShadow(
  parent: THREE.Group,
  mats: SchoolMaterials,
  width: number,
  depth: number,
  yOffset = 0.015,
): void {
  const shadow = new THREE.Mesh(shadowPlaneGeo, mats.contactShadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(width, depth, 1);
  shadow.position.y = yOffset;
  parent.add(shadow);
}

/**
 * Composite 7-part deciduous courtyard tree (root flare, tapered trunk, branches, 4 layered foliage clusters + shadow)
 */
export function createTree(mats: SchoolMaterials, seed = 1, scale = 1): THREE.Group {
  const group = new THREE.Group();
  const s = (n: number) => Math.sin(seed * 19.13 + n * 7.7) * 0.5 + 0.5;

  // Root flare
  const roots = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 0.55, 7), mats.trunk);
  roots.position.y = 0.275;
  roots.castShadow = true;
  group.add(roots);

  // Tapered main trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.25, 2.5, 8), mats.trunk);
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Primary angled branches
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + seed;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 1.3, 6), mats.trunk);
    branch.position.set(Math.cos(angle) * 0.32, 2.75, Math.sin(angle) * 0.32);
    branch.rotation.z = Math.cos(angle) * -0.52;
    branch.rotation.x = Math.sin(angle) * 0.52;
    branch.castShadow = true;
    group.add(branch);
  }

  // Multi-cluster organic canopy
  const foliageMats = [mats.foliageA, mats.foliageB, mats.foliageC];
  const clusters: Array<[number, number, number, number]> = [
    [0, 3.85, 0, 1.45],
    [0.85, 3.25, 0.35, 1.05],
    [-0.78, 3.35, 0.45, 1.12],
    [0.15, 3.4, -0.85, 1.08],
    [-0.35, 4.45, -0.15, 0.95],
  ];

  clusters.forEach(([cx, cy, cz, r], idx) => {
    const jitter = 0.9 + s(idx) * 0.22;
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r * jitter, 1),
      foliageMats[(idx + seed) % foliageMats.length],
    );
    mesh.position.set(cx, cy, cz);
    mesh.scale.set(1.06, 0.86, 1.02);
    mesh.rotation.set(s(idx + 3) * 0.5, s(idx + 5) * Math.PI, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  addContactShadow(group, mats, 4.2, 4.2, 0.02);
  group.scale.setScalar(scale);
  return group;
}

/**
 * Composite 8-part wooden & wrought-iron courtyard bench
 */
export function createBench(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  // Left & right cast-iron leg frames + armrests
  [-0.82, 0.82].forEach((x) => {
    const frontLeg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.46, 0.07), mats.darkMetal);
    frontLeg.position.set(x, 0.23, 0.22);
    frontLeg.castShadow = true;
    group.add(frontLeg);

    const backLeg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.86, 0.07), mats.darkMetal);
    backLeg.position.set(x, 0.43, -0.22);
    backLeg.rotation.x = -0.1;
    backLeg.castShadow = true;
    group.add(backLeg);

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.52), mats.darkMetal);
    crossbar.position.set(x, 0.42, 0);
    group.add(crossbar);

    const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.46), mats.darkMetal);
    armrest.position.set(x, 0.62, 0.02);
    group.add(armrest);
  });

  // Seat slats
  [-0.14, 0, 0.14].forEach((z) => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.045, 0.11), mats.woodOak);
    slat.position.set(0, 0.46, z + 0.04);
    slat.castShadow = true;
    slat.receiveShadow = true;
    group.add(slat);
  });

  // Backrest slats
  [0.64, 0.78].forEach((y) => {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.04), mats.woodOak);
    slat.position.set(0, y, -0.21);
    slat.rotation.x = -0.12;
    slat.castShadow = true;
    group.add(slat);
  });

  addContactShadow(group, mats, 2.2, 0.9, 0.018);
  return group;
}

/**
 * Composite 7-part courtyard streetlamp
 */
export function createLampPost(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.45, 8), mats.darkMetal);
  plinth.position.y = 0.225;
  plinth.castShadow = true;
  group.add(plinth);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 3.3, 10), mats.darkMetal);
  pole.position.y = 2.05;
  pole.castShadow = true;
  group.add(pole);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.07, 0.16, 10), mats.brass);
  collar.position.y = 3.72;
  group.add(collar);

  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mats.lampGlow);
  lantern.position.y = 3.96;
  group.add(lantern);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 10), mats.darkMetal);
  cap.position.y = 4.22;
  cap.castShadow = true;
  group.add(cap);

  addContactShadow(group, mats, 0.85, 0.85, 0.018);
  return group;
}

/**
 * Composite 6-part flagpole with waving banner mesh reference
 */
export function createFlagpole(mats: SchoolMaterials): { group: THREE.Group; flagMesh: THREE.Mesh } {
  const group = new THREE.Group();

  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.24, 8), mats.plinthStone);
  base1.position.y = 0.12;
  base1.receiveShadow = true;
  group.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.26, 8), mats.curbStone);
  base2.position.y = 0.37;
  group.add(base2);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.085, 8.2, 12), mats.brushedSteel);
  mast.position.y = 4.5;
  mast.castShadow = true;
  group.add(mast);

  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), mats.brass);
  orb.position.y = 8.68;
  group.add(orb);

  // Flag geometry with segments so vertices wave smoothly
  const flagGeo = new THREE.PlaneGeometry(2.2, 1.12, 14, 4);
  flagGeo.translate(1.1, 0, 0);
  const flagMesh = new THREE.Mesh(flagGeo, mats.flag);
  flagMesh.position.set(0.05, 7.9, 0);
  flagMesh.castShadow = true;
  group.add(flagMesh);

  addContactShadow(group, mats, 2.0, 2.0, 0.02);
  return { group, flagMesh };
}

/**
 * Composite 7-part basketball hoop & backboard assembly
 */
export function createBasketballHoop(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.65), mats.plinthStone);
  base.position.y = 0.175;
  base.castShadow = true;
  group.add(base);

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 3.65, 10), mats.darkMetal);
  post.position.y = 2.0;
  post.castShadow = true;
  group.add(post);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.05), mats.darkMetal);
  arm.position.set(0, 3.4, 0.52);
  arm.castShadow = true;
  group.add(arm);

  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.15, 8), mats.darkMetal);
  strut.position.set(0, 2.95, 0.42);
  strut.rotation.x = Math.PI / 4;
  group.add(strut);

  // Backboard frame + white board
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.18, 0.06), mats.darkMetal);
  boardFrame.position.set(0, 3.45, 1.04);
  boardFrame.castShadow = true;
  group.add(boardFrame);

  const boardFace = new THREE.Mesh(new THREE.BoxGeometry(1.76, 1.06, 0.07), mats.whitePaint);
  boardFace.position.set(0, 3.45, 1.05);
  group.add(boardFace);

  const targetBox = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.08), mats.hoopOrange);
  targetBox.position.set(0, 3.26, 1.055);
  group.add(targetBox);

  const targetInner = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.085), mats.whitePaint);
  targetInner.position.set(0, 3.26, 1.058);
  group.add(targetInner);

  // Rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 8, 18), mats.hoopOrange);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 3.05, 1.34);
  group.add(rim);

  // Tapered net (lathe/cylinder wireframe-look)
  const net = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.14, 0.44, 12, 1, true),
    new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.9,
      wireframe: true,
    }),
  );
  net.position.set(0, 2.83, 1.34);
  group.add(net);

  addContactShadow(group, mats, 1.4, 1.4, 0.02);
  return group;
}

/**
 * Composite 6-part flowerbed with curb stones, soil, and shrubs/blossoms
 */
export function createFlowerbed(mats: SchoolMaterials, width: number, depth: number): THREE.Group {
  const group = new THREE.Group();

  const border = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, depth), mats.curbStone);
  border.position.y = 0.14;
  border.castShadow = true;
  border.receiveShadow = true;
  group.add(border);

  const soil = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.26, 0.26, depth - 0.26),
    mats.trunk,
  );
  soil.position.y = 0.17;
  group.add(soil);

  const count = Math.max(3, Math.floor(width / 1.1));
  for (let i = 0; i < count; i++) {
    const px = -width / 2 + 0.55 + (i / Math.max(1, count - 1)) * (width - 1.1);
    const bush = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.32 + (i % 2) * 0.07, 0),
      i % 2 === 0 ? mats.foliageB : mats.foliageA,
    );
    bush.position.set(px, 0.42, (i % 2 === 0 ? 1 : -1) * Math.min(0.18, depth * 0.14));
    bush.scale.set(1.1, 0.78, 1.0);
    bush.castShadow = true;
    group.add(bush);

    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      i % 2 === 0 ? mats.flowerYellow : mats.flowerRed,
    );
    flower.position.set(px + 0.1, 0.62, bush.position.z + 0.12);
    group.add(flower);
  }

  return group;
}

/**
 * Composite interactive Rules Stand (outdoor architectural kiosk or indoor wall-mounted board)
 */
export function createRulesBoard(
  mats: SchoolMaterials,
  boardTexture: THREE.CanvasTexture,
  zoneId: ZoneId,
  accentHex: string,
  isOutdoor: boolean,
): { group: THREE.Group; hitMesh: THREE.Mesh } {
  const group = new THREE.Group();
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    roughness: 0.35,
    metalness: 0.45,
  });
  const posterMat = new THREE.MeshStandardMaterial({
    map: boardTexture,
    roughness: 0.35,
    metalness: 0.02,
  });

  if (isOutdoor) {
    // Grounded stone plinth + twin metal posts + peaked canopy + framed poster
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.22, 0.65), mats.plinthStone);
    plinth.position.y = 0.11;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    [-0.86, 0.86].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.35, 10), mats.darkMetal);
      post.position.set(x, 1.35, 0);
      post.castShadow = true;
      group.add(post);
    });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.66, 2.02, 0.12), mats.darkMetal);
    frame.position.set(0, 1.56, 0);
    frame.castShadow = true;
    group.add(frame);

    const accentBar = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.1, 0.14), accentMat);
    accentBar.position.set(0, 2.58, 0);
    group.add(accentBar);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.09, 0.72), mats.facadeTrim);
    canopy.position.set(0, 2.72, 0);
    canopy.rotation.x = 0.08;
    canopy.castShadow = true;
    group.add(canopy);

    const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.9), posterMat);
    frontFace.position.set(0, 1.56, 0.065);
    group.add(frontFace);

    const backFace = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.9), posterMat);
    backFace.position.set(0, 1.56, -0.065);
    backFace.rotation.y = Math.PI;
    group.add(backFace);

    addContactShadow(group, mats, 2.5, 1.2, 0.02);

    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.5, 0.5),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitMesh.position.set(0, 1.5, 0);
    hitMesh.userData = { interactType: 'rules-board', zoneId };
    group.add(hitMesh);

    return { group, hitMesh };
  }

  // Indoor wall-mounted framed school conduct board
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.34, 1.72, 0.06), mats.darkMetal);
  frame.castShadow = true;
  group.add(frame);

  const accentStrip = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.07, 0.075), accentMat);
  accentStrip.position.y = 0.87;
  group.add(accentStrip);

  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 1.6), posterMat);
  poster.position.z = 0.034;
  group.add(poster);

  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 1.82, 0.25),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.userData = { interactType: 'rules-board', zoneId };
  group.add(hitMesh);

  return { group, hitMesh };
}

/**
 * Interactive Classroom Door with hinged swing pivot, wooden panel, transom glass, brass handle, and dynamic room plaque
 */
export function createClassroomDoor(
  mats: SchoolMaterials,
  signTexture: THREE.CanvasTexture,
  zoneId: ZoneId,
): { group: THREE.Group; pivot: THREE.Group; hitMesh: THREE.Mesh } {
  const group = new THREE.Group();

  // Outer door frame (width 1.4, height 2.55)
  const leftJamb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.55, 0.28), mats.darkMetal);
  leftJamb.position.set(-0.7, 1.275, 0);
  group.add(leftJamb);

  const rightJamb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.55, 0.28), mats.darkMetal);
  rightJamb.position.set(0.7, 1.275, 0);
  group.add(rightJamb);

  const header = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.28), mats.darkMetal);
  header.position.set(0, 2.55, 0);
  group.add(header);

  // Room plaque mounted beside/above the doorway (visible from corridor)
  const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.44, 0.04), mats.darkMetal);
  plaqueFrame.position.set(0, 2.9, 0.15);
  group.add(plaqueFrame);

  const plaqueFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.12, 0.38),
    new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.3, metalness: 0.1 }),
  );
  plaqueFace.position.set(0, 2.9, 0.175);
  group.add(plaqueFace);

  // Hinged door leaf pivot at left jamb (-0.65, 0, 0)
  const pivot = new THREE.Group();
  pivot.position.set(-0.65, 0, 0);

  const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.48, 0.07), mats.woodDoor);
  leaf.position.set(0.65, 1.24, 0);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  pivot.add(leaf);

  // Glass vision window inside door
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.82, 0.08), mats.glassDoor);
  glass.position.set(0.78, 1.65, 0);
  pivot.add(glass);

  // Brass handles on both sides
  [-0.06, 0.06].forEach((z) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.045), mats.brass);
    handle.position.set(1.12, 1.08, z);
    pivot.add(handle);
  });

  group.add(pivot);

  // Clickable proxy hitbox
  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 3.0, 0.55),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, 1.5, 0);
  hitMesh.userData = { interactType: 'door', zoneId };
  group.add(hitMesh);

  return { group, pivot, hitMesh };
}

/**
 * Composite 9-part Student Desk + Paired Chair
 */
export function createStudentDeskSet(mats: SchoolMaterials, notebookColor = '#2563eb'): THREE.Group {
  const group = new THREE.Group();

  // Desk metal frame legs
  [-0.58, 0.58].forEach((x) => {
    [-0.24, 0.24].forEach((z) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.72, 6), mats.darkMetal);
      leg.position.set(x, 0.36, z);
      leg.castShadow = true;
      group.add(leg);
    });
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.56), mats.darkMetal);
    foot.position.set(x, 0.02, 0);
    group.add(foot);
  });

  // Modesty panel
  const modesty = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.26, 0.03), mats.woodOak);
  modesty.position.set(0, 0.52, -0.22);
  group.add(modesty);

  // Desktop
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.045, 0.62), mats.woodBirch);
  top.position.y = 0.74;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // Open notebook accent
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.02, 0.21),
    new THREE.MeshStandardMaterial({ color: notebookColor, roughness: 0.7 }),
  );
  book.position.set(-0.26, 0.77, 0.04);
  book.rotation.y = 0.12;
  group.add(book);

  // Two student chairs tucked behind the desk (+Z)
  [-0.32, 0.32].forEach((cx) => {
    const chair = new THREE.Group();
    chair.position.set(cx, 0, 0.52);

    [-0.17, 0.17].forEach((lx) => {
      [-0.17, 0.17].forEach((lz) => {
        const cleg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 6), mats.darkMetal);
        cleg.position.set(lx, 0.22, lz);
        chair.add(cleg);
      });
    });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.035, 0.38), mats.woodBirch);
    seat.position.y = 0.45;
    seat.castShadow = true;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.035), mats.woodBirch);
    back.position.set(0, 0.68, 0.18);
    chair.add(back);

    group.add(chair);
  });

  return group;
}

/**
 * Composite 8-part Teacher's Desk with globe & open textbook
 */
export function createTeacherDesk(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.055, 0.8), mats.woodOak);
  top.position.y = 0.78;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.74, 0.72), mats.woodOak);
  pedestal.position.set(0.54, 0.37, 0);
  pedestal.castShadow = true;
  group.add(pedestal);

  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.74, 0.72), mats.woodOak);
  leftPanel.position.set(-0.76, 0.37, 0);
  group.add(leftPanel);

  const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.54, 0.04), mats.woodOak);
  frontPanel.position.set(-0.08, 0.46, 0.34);
  group.add(frontPanel);

  // Brass globe on stand
  const globeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.04, 12), mats.brass);
  globeBase.position.set(-0.52, 0.83, -0.12);
  group.add(globeBase);

  const globeStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.14, 8), mats.brass);
  globeStem.position.set(-0.52, 0.91, -0.12);
  group.add(globeStem);

  const globeSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 12),
    new THREE.MeshStandardMaterial({ color: '#1d6f9e', roughness: 0.32, metalness: 0.08 }),
  );
  globeSphere.position.set(-0.52, 1.09, -0.12);
  group.add(globeSphere);

  // Teacher chair behind desk
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.07, 0.46), mats.chairFabric);
  seat.position.set(-0.1, 0.48, -0.58);
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.48, 0.07), mats.chairFabric);
  back.position.set(-0.1, 0.74, -0.8);
  group.add(back);

  const baseStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.45, 8), mats.darkMetal);
  baseStem.position.set(-0.1, 0.24, -0.58);
  group.add(baseStem);

  return group;
}

/**
 * Framed Chalkboard / Smartboard with aluminum ledge & chalk
 */
export function createChalkboardUnit(
  mats: SchoolMaterials,
  boardTexture: THREE.CanvasTexture,
  width = 4.2,
  height = 1.65,
): THREE.Group {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.06),
    mats.woodOak,
  );
  group.add(frame);

  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: boardTexture, roughness: 0.72, metalness: 0.02 }),
  );
  surface.position.z = 0.035;
  group.add(surface);

  const tray = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 0.12), mats.brushedSteel);
  tray.position.set(0, -height / 2 - 0.05, 0.07);
  group.add(tray);

  return group;
}

/**
 * Composite 9-part Science Lab Bench with faucet, basin, and LatheGeometry Erlenmeyer flasks
 */
export function createLabBench(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.82, 0.92), mats.interiorWallAccent);
  cabinet.position.y = 0.41;
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  group.add(cabinet);

  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.07, 1.02), mats.labCounter);
  counter.position.y = 0.855;
  counter.castShadow = true;
  group.add(counter);

  // Sink basin + curved gooseneck faucet
  const sink = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.36), mats.brushedSteel);
  sink.position.set(-0.85, 0.88, 0);
  group.add(sink);

  const faucetStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.28, 8), mats.brushedSteel);
  faucetStem.position.set(-0.85, 1.02, -0.22);
  group.add(faucetStem);

  const faucetSpout = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.16), mats.brushedSteel);
  faucetSpout.position.set(-0.85, 1.15, -0.14);
  group.add(faucetSpout);

  // LatheGeometry chemistry flasks with colored liquids
  const flaskPoints = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.09, 0.0),
    new THREE.Vector2(0.08, 0.08),
    new THREE.Vector2(0.03, 0.18),
    new THREE.Vector2(0.03, 0.25),
    new THREE.Vector2(0.04, 0.26),
  ];
  const flaskGeo = new THREE.LatheGeometry(flaskPoints, 12);

  const liquidColors = ['#10b981', '#0ea5e9', '#f59e0b'];
  [0.2, 0.5, 0.78].forEach((x, idx) => {
    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.075, 0.08, 10),
      new THREE.MeshStandardMaterial({
        color: liquidColors[idx],
        roughness: 0.2,
        emissive: liquidColors[idx],
        emissiveIntensity: 0.15,
      }),
    );
    liquid.position.set(x, 0.935, 0.05 * (idx - 1));
    group.add(liquid);

    const flask = new THREE.Mesh(flaskGeo, mats.glassDoor);
    flask.position.set(x, 0.89, 0.05 * (idx - 1));
    group.add(flask);
  });

  // Lab stools
  [-0.55, 0.55].forEach((sx) => {
    const stoolTop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12), mats.woodOak);
    stoolTop.position.set(sx, 0.56, 0.72);
    group.add(stoolTop);

    const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.55, 8), mats.darkMetal);
    stoolLeg.position.set(sx, 0.28, 0.72);
    group.add(stoolLeg);

    const stoolFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 10), mats.darkMetal);
    stoolFoot.position.set(sx, 0.02, 0.72);
    group.add(stoolFoot);
  });

  return group;
}

/**
 * Composite Library Bookshelf populated with colorful book rows
 */
export function createBookshelf(mats: SchoolMaterials, seed = 1): THREE.Group {
  const group = new THREE.Group();

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 0.05), mats.woodOak);
  back.position.set(0, 1.15, -0.18);
  group.add(back);

  [-0.93, 0.93].forEach((x) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.3, 0.42), mats.woodOak);
    side.position.set(x, 1.15, 0);
    side.castShadow = true;
    group.add(side);
  });

  const bookColors = ['#b91c1c', '#1d4ed8', '#15803d', '#b45309', '#6d28d9', '#0f766e', '#334155'];
  for (let s = 0; s < 5; s++) {
    const y = 0.16 + s * 0.52;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.04, 0.38), mats.woodOak);
    shelf.position.set(0, y, 0);
    group.add(shelf);

    if (s < 4) {
      let xCursor = -0.82;
      let idx = 0;
      while (xCursor < 0.74) {
        const w = 0.06 + ((idx + seed + s) % 3) * 0.02;
        const h = 0.28 + ((idx * 3 + seed + s) % 4) * 0.035;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, 0.24),
          new THREE.MeshStandardMaterial({
            color: bookColors[(idx + s * 2 + seed) % bookColors.length],
            roughness: 0.78,
          }),
        );
        book.position.set(xCursor + w / 2, y + 0.02 + h / 2, 0.02);
        group.add(book);
        xCursor += w + 0.015;
        idx++;
      }
    }
  }

  return group;
}

/**
 * Library Reading Table with green banker's lamp & chairs
 */
export function createReadingTable(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.1), mats.woodOak);
  top.position.y = 0.76;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  [-0.96, 0.96].forEach((x) => {
    [-0.44, 0.44].forEach((z) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.07), mats.woodOak);
      leg.position.set(x, 0.37, z);
      leg.castShadow = true;
      group.add(leg);
    });
  });

  // Classic green library banker's lamp
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 10), mats.brass);
  lampBase.position.set(0, 0.81, 0);
  group.add(lampBase);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.3, 8), mats.brass);
  lampStem.position.set(0, 0.96, 0);
  group.add(lampStem);

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, 0.12, 10),
    new THREE.MeshStandardMaterial({
      color: '#047857',
      emissive: '#065f46',
      emissiveIntensity: 0.45,
      roughness: 0.25,
    }),
  );
  shade.position.set(0, 1.12, 0);
  group.add(shade);

  // 4 chairs around table
  [
    [-0.55, 0.7, 0],
    [0.55, 0.7, 0],
    [-0.55, -0.7, Math.PI],
    [0.55, -0.7, Math.PI],
  ].forEach(([cx, cz, ry]) => {
    const ch = new THREE.Group();
    ch.position.set(cx, 0, cz);
    ch.rotation.y = ry;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.42), mats.chairFabric);
    seat.position.y = 0.46;
    ch.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.045), mats.woodOak);
    back.position.set(0, 0.7, 0.19);
    ch.add(back);
    [-0.17, 0.17].forEach((lx) => {
      [-0.17, 0.17].forEach((lz) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 6), mats.woodOak);
        leg.position.set(lx, 0.225, lz);
        ch.add(leg);
      });
    });
    group.add(ch);
  });

  return group;
}

/**
 * Composite 8-part IT Computer Workstation (desk, dual/wide monitor, keyboard, mouse, ergonomic chair)
 */
export function createComputerStation(mats: SchoolMaterials, screenIndex = 0): THREE.Group {
  const group = new THREE.Group();

  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.72), mats.whitePaint);
  desk.position.y = 0.74;
  desk.castShadow = true;
  desk.receiveShadow = true;
  group.add(desk);

  [-0.68, 0.68].forEach((x) => {
    const legFrame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.73, 0.64), mats.darkMetal);
    legFrame.position.set(x, 0.365, 0);
    group.add(legFrame);
  });

  // Two student computers per wide IT desk
  [-0.38, 0.38].forEach((mx, idx) => {
    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.14), mats.darkMetal);
    standBase.position.set(mx, 0.775, -0.18);
    group.add(standBase);

    const standNeck = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.03), mats.darkMetal);
    standNeck.position.set(mx, 0.86, -0.2);
    group.add(standNeck);

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.34, 0.03), mats.darkMetal);
    bezel.position.set(mx, 1.03, -0.18);
    bezel.castShadow = true;
    group.add(bezel);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.3),
      mats.monitorScreens[(screenIndex + idx) % mats.monitorScreens.length],
    );
    screen.position.set(mx, 1.03, -0.162);
    group.add(screen);

    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.018, 0.11), mats.darkMetal);
    keyboard.position.set(mx - 0.04, 0.775, 0.08);
    group.add(keyboard);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.08), mats.darkMetal);
    mouse.position.set(mx + 0.18, 0.775, 0.08);
    group.add(mouse);

    // Ergonomic chair
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), mats.chairFabric);
    chairSeat.position.set(mx, 0.46, 0.56);
    group.add(chairSeat);

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.05), mats.chairFabric);
    chairBack.position.set(mx, 0.7, 0.76);
    group.add(chairBack);

    const chairPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.44, 8), mats.darkMetal);
    chairPost.position.set(mx, 0.23, 0.56);
    group.add(chairPost);
  });

  return group;
}

/**
 * Corridor Locker Bank (5 doors with vents & handles)
 */
export function createLockerBank(mats: SchoolMaterials, count = 5): THREE.Group {
  const group = new THREE.Group();
  const unitW = 0.46;
  const totalW = unitW * count;

  const body = new THREE.Mesh(new THREE.BoxGeometry(totalW, 1.95, 0.48), mats.lockerBlue);
  body.position.y = 0.975;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.04, 0.1, 0.5), mats.darkMetal);
  plinth.position.y = 0.05;
  group.add(plinth);

  for (let i = 0; i < count; i++) {
    const x = -totalW / 2 + unitW * (i + 0.5);
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.015, 1.82, 0.02), mats.darkMetal);
    seam.position.set(x - unitW / 2, 1.0, 0.245);
    group.add(seam);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), mats.brushedSteel);
    handle.position.set(x + 0.14, 1.15, 0.25);
    group.add(handle);

    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.015), mats.darkMetal);
    vent.position.set(x, 1.72, 0.245);
    group.add(vent);
  }

  return group;
}

/**
 * Indoor Potted Plant
 */
export function createPottedPlant(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.42, 10), mats.curbStone);
  pot.position.y = 0.21;
  pot.castShadow = true;
  group.add(pot);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.55, 6), mats.trunk);
  stem.position.y = 0.62;
  group.add(stem);

  const leafA = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), mats.foliageB);
  leafA.position.y = 0.96;
  leafA.scale.set(1.1, 1.25, 1.1);
  group.add(leafA);

  const leafB = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), mats.foliageA);
  leafB.position.set(0.16, 0.78, 0.1);
  group.add(leafB);

  return group;
}

/**
 * Outdoor Bicycle Rack with a stylized parked bicycle
 */
export function createBikeRack(mats: SchoolMaterials): THREE.Group {
  const group = new THREE.Group();

  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 0.45), mats.darkMetal);
  rail.position.y = 0.03;
  group.add(rail);

  for (let i = 0; i < 4; i++) {
    const x = -0.9 + i * 0.6;
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.022, 8, 16, Math.PI), mats.brushedSteel);
    hoop.position.set(x, 0.05, 0);
    hoop.castShadow = true;
    group.add(hoop);
  }

  // Stylized parked bicycle in slot 2
  const bike = new THREE.Group();
  bike.position.set(-0.3, 0.34, 0.25);
  bike.rotation.y = Math.PI / 2;

  [-0.5, 0.5].forEach((wx) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 18), mats.darkMetal);
    wheel.position.set(wx, 0, 0);
    bike.add(wheel);
  });

  const frameMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.3, metalness: 0.6 });
  const bar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.82, 6), frameMat);
  bar1.rotation.z = Math.PI / 2;
  bar1.position.set(0, 0.24, 0);
  bike.add(bar1);

  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.58, 6), frameMat);
  fork.position.set(0.45, 0.24, 0);
  fork.rotation.z = 0.25;
  bike.add(fork);

  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 6), mats.darkMetal);
  handlebar.rotation.x = Math.PI / 2;
  handlebar.position.set(0.38, 0.54, 0);
  bike.add(handlebar);

  group.add(bike);
  return group;
}
