import * as THREE from 'three';
import { SchoolMaterials } from './materials';
import { addContactShadow } from './models';

export interface AnimatedCharacter {
  group: THREE.Group;
  role: 'teacher' | 'student';
  mode: 'stand' | 'sit' | 'walk';
  phase: number;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  headGroup: THREE.Group;
  walkPath?: Array<[number, number]>;
  walkSpeed?: number;
  baseY: number;
  baseRotY: number;
}

export interface CharacterPopulation {
  root: THREE.Group;
  teachers: AnimatedCharacter[];
  students: AnimatedCharacter[];
  setCounts: (teacherCount: number, studentCount: number) => void;
  update: (elapsed: number) => void;
  dispose: () => void;
}

const SKIN_TONES = ['#f1c7a5', '#e4b38d', '#d39c73', '#f5d2b8', '#c68b62'];
const HAIR_TONES = ['#1f1a17', '#3b281c', '#5c3c24', '#262220', '#704c2c'];
const TEACHER_JACKETS = ['#1e3a5f', '#4a2545', '#284b3e', '#334155', '#5b3a29', '#1f4e5f'];
const BACKPACK_COLORS = ['#0284c7', '#e11d48', '#d97706', '#0d9488', '#6366f1', '#16a34a'];

function makeMat(
  color: string,
  roughness: number,
  metalness: number,
  disposables: THREE.Material[],
): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  disposables.push(mat);
  return mat;
}

function createPersonMesh(
  mats: SchoolMaterials,
  disposables: THREE.Material[],
  options: {
    role: 'teacher' | 'student';
    seated: boolean;
    seed: number;
    hasBackpack: boolean;
  },
): {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  headGroup: THREE.Group;
} {
  const { role, seated, seed, hasBackpack } = options;
  const group = new THREE.Group();

  const skinMat = makeMat(SKIN_TONES[seed % SKIN_TONES.length], 0.72, 0.0, disposables);
  const hairMat = makeMat(HAIR_TONES[(seed * 3 + 1) % HAIR_TONES.length], 0.82, 0.02, disposables);
  const jacketColor =
    role === 'teacher'
      ? TEACHER_JACKETS[seed % TEACHER_JACKETS.length]
      : seed % 2 === 0
        ? '#1d3557'
        : '#264653';
  const torsoMat = makeMat(jacketColor, 0.78, 0.02, disposables);
  const pantsMat = makeMat(role === 'teacher' ? '#1e293b' : '#2b3445', 0.85, 0.0, disposables);
  const shirtMat = mats.whitePaint;
  const tieMat = makeMat(role === 'teacher' ? '#b45309' : '#0284c7', 0.55, 0.05, disposables);

  const isTeacher = role === 'teacher';
  const scale = isTeacher ? 1.0 : 0.86 + (seed % 3) * 0.035;

  // --- Articulated Legs (Hip pivot at Y = 0.78) ---
  const buildLeg = (side: -1 | 1): THREE.Group => {
    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.105, 0.78, 0);

    if (seated) {
      // Bent thigh forward (+Z) & shin down
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.06, 0.38, 8), pantsMat);
      thigh.rotation.x = Math.PI / 2;
      thigh.position.set(0, -0.02, 0.17);
      thigh.castShadow = true;
      legPivot.add(thigh);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.42, 8), pantsMat);
      shin.position.set(0, -0.22, 0.34);
      shin.castShadow = true;
      legPivot.add(shin);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.21), mats.darkMetal);
      shoe.position.set(0, -0.43, 0.38);
      legPivot.add(shoe);
    } else {
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.052, 0.7, 8), pantsMat);
      legMesh.position.y = -0.35;
      legMesh.castShadow = true;
      legPivot.add(legMesh);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.22), mats.darkMetal);
      shoe.position.set(0, -0.74, 0.04);
      shoe.castShadow = true;
      legPivot.add(shoe);
    }

    return legPivot;
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);
  group.add(leftLeg, rightLeg);

  // --- Torso (Pelvis + Blazer/Uniform + Collar + Tie) ---
  const hipOffsetY = seated ? -0.3 : 0;
  const upperBody = new THREE.Group();
  upperBody.position.y = hipOffsetY;
  group.add(upperBody);

  // Adjust leg pivot height when seated so figure sits flush on chair (~0.48m seat)
  if (seated) {
    leftLeg.position.y = 0.48;
    rightLeg.position.y = 0.48;
  }

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.155, 0.56, 10), torsoMat);
  torso.scale.set(1.18, 1, 0.72);
  torso.position.y = 1.07;
  torso.castShadow = true;
  torso.receiveShadow = true;
  upperBody.add(torso);

  // Crisp white shirt collar V-front
  const shirtFront = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.04), shirtMat);
  shirtFront.position.set(0, 1.24, 0.115);
  upperBody.add(shirtFront);

  // Tie / lapel accent
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.22, 0.02), tieMat);
  tie.position.set(0, 1.19, 0.135);
  upperBody.add(tie);

  // Student Backpack
  if (!isTeacher && hasBackpack && !seated) {
    const bpMat = makeMat(
      BACKPACK_COLORS[seed % BACKPACK_COLORS.length],
      0.68,
      0.04,
      disposables,
    );
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.14), bpMat);
    pack.position.set(0, 1.1, -0.17);
    pack.castShadow = true;
    upperBody.add(pack);

    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.05), mats.darkMetal);
    pocket.position.set(0, 1.01, -0.25);
    upperBody.add(pocket);
  }

  // --- Articulated Arms (Shoulder pivot at Y = 1.3) ---
  const buildArm = (side: -1 | 1): THREE.Group => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.235, 1.3, 0);

    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.044, 0.46, 8), torsoMat);
    sleeve.position.y = -0.22;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.044, 8, 8), skinMat);
    hand.position.y = -0.47;
    armPivot.add(hand);

    // Teacher carries a neat lesson folder in left hand
    if (isTeacher && side === -1) {
      const folder = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.2), mats.woodOak);
      folder.position.set(-0.04, -0.42, 0.08);
      folder.rotation.x = 0.35;
      armPivot.add(folder);
    }

    if (seated) {
      armPivot.rotation.x = -0.68;
    }

    return armPivot;
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  upperBody.add(leftArm, rightArm);

  // --- Head Group (Neck, Head, Hair Volume, Teacher Glasses) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.4, 0);
  upperBody.add(headGroup);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.056, 0.1, 8), skinMat);
  neck.position.y = 0.02;
  headGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10), skinMat);
  head.scale.set(0.94, 1.06, 0.96);
  head.position.y = 0.165;
  head.castShadow = true;
  headGroup.add(head);

  // Hair cap
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.142, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat,
  );
  hairCap.scale.set(0.98, 1.04, 1.02);
  hairCap.position.set(0, 0.185, -0.012);
  headGroup.add(hairCap);

  // Hair variation: ponytail / bun on alternate figures
  if (seed % 2 === 1) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 8), hairMat);
    bun.position.set(0, 0.17, -0.145);
    headGroup.add(bun);
  }

  // Subtle glasses detail on teachers
  if (isTeacher) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.036, 0.025), mats.darkMetal);
    frame.position.set(0, 0.17, 0.128);
    headGroup.add(frame);
  }

  if (!seated) {
    addContactShadow(group, mats, 0.68, 0.68, 0.018);
  }

  group.scale.setScalar(scale);
  return { group, leftArm, rightArm, leftLeg, rightLeg, headGroup };
}

export function createSchoolCharacters(mats: SchoolMaterials): CharacterPopulation {
  const root = new THREE.Group();
  const disposables: THREE.Material[] = [];
  const teachers: AnimatedCharacter[] = [];
  const students: AnimatedCharacter[] = [];

  const FLOOR_Y = 0.315;
  const COURT_Y = 0.06;

  // =========================================================================
  // 1. TEACHERS (Up to 6: 4 in Classrooms + 1 Corridor + 1 Courtyard)
  // =========================================================================
  const teacherSpecs: Array<{
    x: number;
    y: number;
    z: number;
    rotY: number;
    mode: 'stand' | 'walk';
    walkPath?: Array<[number, number]>;
  }> = [
    // 1. Room 101 Mathematics
    { x: -16.1, y: FLOOR_Y, z: -12.3, rotY: 0.15, mode: 'stand' },
    // 2. Room 102 Science Lab
    { x: -5.5, y: FLOOR_Y, z: -12.2, rotY: -0.1, mode: 'stand' },
    // 3. Room 103 Library
    { x: 5.5, y: FLOOR_Y, z: -12.1, rotY: 0.05, mode: 'stand' },
    // 4. Room 104 IT Lab
    { x: 16.2, y: FLOOR_Y, z: -12.3, rotY: -0.12, mode: 'stand' },
    // 5. Corridor Duty Teacher (calm stroll)
    {
      x: -7.5,
      y: FLOOR_Y,
      z: -1.1,
      rotY: Math.PI / 2,
      mode: 'walk',
      walkPath: [
        [-11.5, -1.2],
        [11.5, -1.2],
        [11.5, 0.1],
        [-11.5, 0.1],
      ],
    },
    // 6. Courtyard Greeting Teacher near Entrance Steps
    { x: -3.2, y: COURT_Y, z: 9.2, rotY: 0.35, mode: 'stand' },
  ];

  teacherSpecs.forEach((spec, idx) => {
    const built = createPersonMesh(mats, disposables, {
      role: 'teacher',
      seated: false,
      seed: idx + 1,
      hasBackpack: false,
    });
    built.group.position.set(spec.x, spec.y, spec.z);
    built.group.rotation.y = spec.rotY;
    root.add(built.group);

    teachers.push({
      ...built,
      role: 'teacher',
      mode: spec.mode,
      phase: idx * 1.3,
      walkPath: spec.walkPath,
      walkSpeed: 0.95,
      baseY: spec.y,
      baseRotY: spec.rotY,
    });
  });

  // =========================================================================
  // 2. STUDENTS (Up to 24 interleaved across Courtyard, Corridor & 4 Rooms)
  // =========================================================================
  const studentSpecs: Array<{
    x: number;
    y: number;
    z: number;
    rotY: number;
    mode: 'stand' | 'sit' | 'walk';
    hasBackpack: boolean;
    walkPath?: Array<[number, number]>;
    walkSpeed?: number;
  }> = [
    // Batch 1 (first 8 students: lively immediately across every single zone!)
    // Courtyard walking student 1
    {
      x: -2.2,
      y: COURT_Y,
      z: 19.5,
      rotY: 0,
      mode: 'walk',
      hasBackpack: true,
      walkPath: [
        [-2.5, 24.5],
        [-2.5, 8.2],
        [2.5, 8.2],
        [2.5, 24.5],
      ],
      walkSpeed: 1.35,
    },
    // Room 101 Math seated student
    { x: -18.92, y: FLOOR_Y, z: -9.28, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 102 Science standing/seated at lab stool
    { x: -8.55, y: FLOOR_Y, z: -9.48, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 103 Library reading seated
    { x: 4.95, y: FLOOR_Y, z: -9.4, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 104 IT coding seated
    { x: 13.22, y: FLOOR_Y, z: -9.84, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Corridor walking student 1
    {
      x: 4.0,
      y: FLOOR_Y,
      z: -0.3,
      rotY: -Math.PI / 2,
      mode: 'walk',
      hasBackpack: true,
      walkPath: [
        [16.0, -0.2],
        [-16.0, -0.2],
        [-16.0, -1.7],
        [16.0, -1.7],
      ],
      walkSpeed: 1.2,
    },
    // Courtyard basketball court student
    {
      x: -14.5,
      y: COURT_Y + 0.04,
      z: 17.5,
      rotY: Math.PI,
      mode: 'walk',
      hasBackpack: false,
      walkPath: [
        [-18.0, 15.5],
        [-13.0, 15.5],
        [-13.0, 21.0],
        [-18.0, 21.0],
      ],
      walkSpeed: 1.6,
    },
    // Room 101 Math seated student 2
    { x: -13.68, y: FLOOR_Y, z: -7.28, rotY: Math.PI, mode: 'sit', hasBackpack: false },

    // Batch 2 (students 9..16)
    // Room 102 Science seated student 2
    { x: -2.45, y: FLOOR_Y, z: -6.08, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 103 Library seated student 2
    { x: 6.05, y: FLOOR_Y, z: -7.2, rotY: 0, mode: 'sit', hasBackpack: false },
    // Room 104 IT seated student 2
    { x: 19.18, y: FLOOR_Y, z: -7.54, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Courtyard garden student standing near benches
    { x: 13.4, y: COURT_Y, z: 16.4, rotY: -0.7, mode: 'stand', hasBackpack: true },
    // Corridor walking student 2
    {
      x: -9.5,
      y: FLOOR_Y,
      z: -1.6,
      rotY: Math.PI / 2,
      mode: 'walk',
      hasBackpack: true,
      walkPath: [
        [-14.5, -1.65],
        [14.5, -1.65],
        [14.5, -0.15],
        [-14.5, -0.15],
      ],
      walkSpeed: 1.15,
    },
    // Room 101 Math seated student 3
    { x: -18.28, y: FLOOR_Y, z: -5.28, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Courtyard student reading near Outdoor Rules Kiosk
    { x: 4.5, y: COURT_Y, z: 10.6, rotY: 2.75, mode: 'stand', hasBackpack: true },
    // Room 104 IT seated student 3
    { x: 13.98, y: FLOOR_Y, z: -5.24, rotY: Math.PI, mode: 'sit', hasBackpack: false },

    // Batch 3 (students 17..24)
    // Room 101 Math seated student 4
    { x: -14.32, y: FLOOR_Y, z: -9.28, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 102 Science seated student 3
    { x: -7.45, y: FLOOR_Y, z: -6.08, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 102 Science seated student 4
    { x: -3.55, y: FLOOR_Y, z: -9.48, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 103 Library seated student 3
    { x: 4.95, y: FLOOR_Y, z: -5.8, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Room 103 Library seated student 4
    { x: 6.05, y: FLOOR_Y, z: -10.8, rotY: 0, mode: 'sit', hasBackpack: false },
    // Room 104 IT seated student 4
    { x: 18.42, y: FLOOR_Y, z: -9.84, rotY: Math.PI, mode: 'sit', hasBackpack: false },
    // Courtyard walking student 2 (east garden loop)
    {
      x: 15.5,
      y: COURT_Y,
      z: 14.0,
      rotY: 0,
      mode: 'walk',
      hasBackpack: true,
      walkPath: [
        [14.6, 12.2],
        [14.6, 23.8],
        [16.6, 23.8],
        [16.6, 12.2],
      ],
      walkSpeed: 1.25,
    },
    // Courtyard basketball student 2
    { x: -16.8, y: COURT_Y + 0.04, z: 18.8, rotY: 2.9, mode: 'stand', hasBackpack: false },
  ];

  studentSpecs.forEach((spec, idx) => {
    const built = createPersonMesh(mats, disposables, {
      role: 'student',
      seated: spec.mode === 'sit',
      seed: idx + 10,
      hasBackpack: spec.hasBackpack,
    });
    built.group.position.set(spec.x, spec.y, spec.z);
    built.group.rotation.y = spec.rotY;
    root.add(built.group);

    students.push({
      ...built,
      role: 'student',
      mode: spec.mode,
      phase: idx * 0.95,
      walkPath: spec.walkPath,
      walkSpeed: spec.walkSpeed ?? 1.2,
      baseY: spec.y,
      baseRotY: spec.rotY,
    });
  });

  const setCounts = (teacherCount: number, studentCount: number) => {
    for (let i = 0; i < teachers.length; i++) {
      teachers[i].group.visible = i < teacherCount;
    }
    for (let i = 0; i < students.length; i++) {
      students[i].group.visible = i < studentCount;
    }
  };

  // Pre-compute path segment lengths so update() does zero allocations
  const pathMeta = new Map<
    AnimatedCharacter,
    { segLens: number[]; totalLen: number }
  >();
  const registerPath = (ch: AnimatedCharacter) => {
    if (!ch.walkPath || ch.walkPath.length < 2) return;
    const segLens: number[] = [];
    let totalLen = 0;
    for (let i = 0; i < ch.walkPath.length; i++) {
      const a = ch.walkPath[i];
      const b = ch.walkPath[(i + 1) % ch.walkPath.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segLens.push(len);
      totalLen += len;
    }
    pathMeta.set(ch, { segLens, totalLen });
  };

  teachers.forEach(registerPath);
  students.forEach(registerPath);

  const animateChar = (ch: AnimatedCharacter, elapsed: number) => {
    if (!ch.group.visible) return;
    const t = elapsed + ch.phase;

    if (ch.mode === 'walk' && ch.walkPath) {
      const meta = pathMeta.get(ch);
      if (meta && meta.totalLen > 0) {
        const speed = ch.walkSpeed ?? 1.2;
        let dist = ((elapsed + ch.phase * 3.1) * speed) % meta.totalLen;
        let segIdx = 0;
        while (segIdx < meta.segLens.length - 1 && dist > meta.segLens[segIdx]) {
          dist -= meta.segLens[segIdx];
          segIdx++;
        }
        const a = ch.walkPath[segIdx];
        const b = ch.walkPath[(segIdx + 1) % ch.walkPath.length];
        const segLen = meta.segLens[segIdx] || 1;
        const u = dist / segLen;

        ch.group.position.x = a[0] + (b[0] - a[0]) * u;
        ch.group.position.z = a[1] + (b[1] - a[1]) * u;
        ch.group.position.y = ch.baseY + Math.abs(Math.sin(t * 6.0)) * 0.025;
        ch.group.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);

        // Stride swing
        const stride = Math.sin(t * 6.0) * 0.42;
        ch.leftLeg.rotation.x = stride;
        ch.rightLeg.rotation.x = -stride;
        ch.leftArm.rotation.x = -stride * 0.75;
        ch.rightArm.rotation.x = stride * 0.75;
        ch.headGroup.rotation.y = Math.sin(t * 1.4) * 0.1;
      }
      return;
    }

    if (ch.mode === 'sit') {
      // Subtle attentive studying motion
      ch.headGroup.rotation.x = 0.08 + Math.sin(t * 1.3) * 0.04;
      ch.headGroup.rotation.y = Math.sin(t * 0.85) * 0.12;
      ch.rightArm.rotation.x = -0.72 + Math.sin(t * 2.4) * 0.05;
      ch.leftArm.rotation.x = -0.68 + Math.cos(t * 1.9) * 0.04;
      return;
    }

    // Standing teacher / student subtle conversational gesture
    ch.headGroup.rotation.y = Math.sin(t * 1.1) * 0.22;
    ch.rightArm.rotation.x = ch.role === 'teacher' ? -0.35 + Math.sin(t * 2.1) * 0.22 : Math.sin(t * 1.5) * 0.08;
    ch.rightArm.rotation.z = ch.role === 'teacher' ? -0.14 - Math.sin(t * 2.1) * 0.08 : 0;
    ch.leftArm.rotation.x = ch.role === 'teacher' ? -0.18 : -Math.sin(t * 1.5) * 0.06;
  };

  const update = (elapsed: number) => {
    for (let i = 0; i < teachers.length; i++) animateChar(teachers[i], elapsed);
    for (let i = 0; i < students.length; i++) animateChar(students[i], elapsed);
  };

  const dispose = () => {
    disposables.forEach((m) => m.dispose());
  };

  return {
    root,
    teachers,
    students,
    setCounts,
    update,
    dispose,
  };
}
