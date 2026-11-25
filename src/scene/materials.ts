import * as THREE from 'three';
import {
  createBasketballCourtTexture,
  createClockFaceTexture,
  createContactShadowTexture,
  createCorridorFloorTexture,
  createCourtyardPavingTexture,
  createFacadeTexture,
  createFlagTexture,
  createGrassTexture,
  createMonitorScreenTexture,
  createPeriodicTableTexture,
  createWoodFloorTexture,
} from './textures';

export interface SchoolMaterials {
  grass: THREE.MeshStandardMaterial;
  paving: THREE.MeshStandardMaterial;
  curbStone: THREE.MeshStandardMaterial;
  basketballCourt: THREE.MeshStandardMaterial;
  facade: THREE.MeshStandardMaterial;
  facadeTrim: THREE.MeshStandardMaterial;
  roofTile: THREE.MeshStandardMaterial;
  plinthStone: THREE.MeshStandardMaterial;
  interiorWall: THREE.MeshStandardMaterial;
  interiorWallAccent: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  corridorFloor: THREE.MeshStandardMaterial;
  woodFloor: THREE.MeshStandardMaterial;
  labFloor: THREE.MeshStandardMaterial;
  darkMetal: THREE.MeshStandardMaterial;
  brushedSteel: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  woodOak: THREE.MeshStandardMaterial;
  woodBirch: THREE.MeshStandardMaterial;
  woodDoor: THREE.MeshStandardMaterial;
  lockerBlue: THREE.MeshStandardMaterial;
  labCounter: THREE.MeshStandardMaterial;
  glassWindow: THREE.MeshPhysicalMaterial;
  glassDoor: THREE.MeshPhysicalMaterial;
  trunk: THREE.MeshStandardMaterial;
  foliageA: THREE.MeshStandardMaterial;
  foliageB: THREE.MeshStandardMaterial;
  foliageC: THREE.MeshStandardMaterial;
  flowerRed: THREE.MeshStandardMaterial;
  flowerYellow: THREE.MeshStandardMaterial;
  lampGlow: THREE.MeshStandardMaterial;
  chairFabric: THREE.MeshStandardMaterial;
  hoopOrange: THREE.MeshStandardMaterial;
  whitePaint: THREE.MeshStandardMaterial;
  contactShadow: THREE.MeshBasicMaterial;
  clockFace: THREE.MeshStandardMaterial;
  periodicTable: THREE.MeshStandardMaterial;
  flag: THREE.MeshStandardMaterial;
  monitorScreens: THREE.MeshStandardMaterial[];
  dispose: () => void;
}

export function createSchoolMaterials(
  maxAnisotropy: number,
  isSoftwareGl: boolean,
): SchoolMaterials {
  const textures: THREE.Texture[] = [];
  const track = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const grassMap = track(createGrassTexture(maxAnisotropy));
  const pavingMap = track(createCourtyardPavingTexture(maxAnisotropy));
  const courtMap = track(createBasketballCourtTexture(maxAnisotropy));
  const facadeMap = track(createFacadeTexture(maxAnisotropy));
  const woodFloorMap = track(createWoodFloorTexture(maxAnisotropy));
  const corridorFloorMap = track(createCorridorFloorTexture(maxAnisotropy));
  const contactShadowMap = track(createContactShadowTexture());
  const clockMap = track(createClockFaceTexture(maxAnisotropy));
  const periodicMap = track(createPeriodicTableTexture(maxAnisotropy));
  const flagMap = track(createFlagTexture(maxAnisotropy));

  const monitorScreens = [0, 1, 2].map(
    (v) =>
      new THREE.MeshStandardMaterial({
        map: track(createMonitorScreenTexture(maxAnisotropy, v)),
        emissive: new THREE.Color('#2563eb'),
        emissiveIntensity: 0.22,
        roughness: 0.22,
        metalness: 0.05,
      }),
  );

  const mats: Omit<SchoolMaterials, 'dispose'> = {
    grass: new THREE.MeshStandardMaterial({
      map: grassMap,
      roughness: 0.94,
      metalness: 0.0,
    }),
    paving: new THREE.MeshStandardMaterial({
      map: pavingMap,
      roughness: 0.86,
      metalness: 0.02,
    }),
    curbStone: new THREE.MeshStandardMaterial({
      color: '#a8a29e',
      roughness: 0.82,
      metalness: 0.04,
    }),
    basketballCourt: new THREE.MeshStandardMaterial({
      map: courtMap,
      roughness: 0.78,
      metalness: 0.02,
    }),
    facade: new THREE.MeshStandardMaterial({
      map: facadeMap,
      roughness: 0.84,
      metalness: 0.02,
    }),
    facadeTrim: new THREE.MeshStandardMaterial({
      color: '#1b435d',
      roughness: 0.45,
      metalness: 0.22,
    }),
    roofTile: new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.62,
      metalness: 0.28,
    }),
    plinthStone: new THREE.MeshStandardMaterial({
      color: '#8c857b',
      roughness: 0.88,
      metalness: 0.04,
    }),
    interiorWall: new THREE.MeshStandardMaterial({
      color: '#f1efe9',
      roughness: 0.88,
      metalness: 0.0,
    }),
    interiorWallAccent: new THREE.MeshStandardMaterial({
      color: '#d8e3e7',
      roughness: 0.82,
      metalness: 0.02,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.92,
      metalness: 0.0,
    }),
    corridorFloor: new THREE.MeshStandardMaterial({
      map: corridorFloorMap,
      roughness: 0.36,
      metalness: 0.06,
    }),
    woodFloor: new THREE.MeshStandardMaterial({
      map: woodFloorMap,
      roughness: 0.48,
      metalness: 0.04,
    }),
    labFloor: new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.42,
      metalness: 0.05,
    }),
    darkMetal: new THREE.MeshStandardMaterial({
      color: '#27313d',
      roughness: 0.34,
      metalness: 0.82,
    }),
    brushedSteel: new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.24,
      metalness: 0.88,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: '#d4a94a',
      roughness: 0.25,
      metalness: 0.92,
    }),
    woodOak: new THREE.MeshStandardMaterial({
      color: '#8f623c',
      roughness: 0.58,
      metalness: 0.02,
    }),
    woodBirch: new THREE.MeshStandardMaterial({
      color: '#d8b98c',
      roughness: 0.52,
      metalness: 0.02,
    }),
    woodDoor: new THREE.MeshStandardMaterial({
      color: '#9c6b43',
      roughness: 0.48,
      metalness: 0.05,
    }),
    lockerBlue: new THREE.MeshStandardMaterial({
      color: '#3b6e8c',
      roughness: 0.42,
      metalness: 0.48,
    }),
    labCounter: new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.28,
      metalness: 0.14,
    }),
    glassWindow: new THREE.MeshPhysicalMaterial({
      color: '#bfe3f5',
      roughness: 0.08,
      metalness: 0.08,
      transparent: true,
      opacity: isSoftwareGl ? 0.34 : 0.32,
      reflectivity: 0.9,
      depthWrite: false,
    }),
    glassDoor: new THREE.MeshPhysicalMaterial({
      color: '#cfe9f8',
      roughness: 0.06,
      metalness: 0.05,
      transparent: true,
      opacity: isSoftwareGl ? 0.36 : 0.32,
      depthWrite: false,
    }),
    trunk: new THREE.MeshStandardMaterial({
      color: '#6b4f3a',
      roughness: 0.92,
      metalness: 0.0,
    }),
    foliageA: new THREE.MeshStandardMaterial({
      color: '#4c7c3e',
      roughness: 0.84,
      metalness: 0.0,
    }),
    foliageB: new THREE.MeshStandardMaterial({
      color: '#5f9449',
      roughness: 0.8,
      metalness: 0.0,
    }),
    foliageC: new THREE.MeshStandardMaterial({
      color: '#3f6d34',
      roughness: 0.88,
      metalness: 0.0,
    }),
    flowerRed: new THREE.MeshStandardMaterial({
      color: '#e11d48',
      roughness: 0.65,
      metalness: 0.0,
    }),
    flowerYellow: new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.65,
      metalness: 0.0,
    }),
    lampGlow: new THREE.MeshStandardMaterial({
      color: '#fffbeb',
      emissive: new THREE.Color('#fef3c7'),
      emissiveIntensity: 0.95,
      roughness: 0.2,
      metalness: 0.0,
    }),
    chairFabric: new THREE.MeshStandardMaterial({
      color: '#2c5364',
      roughness: 0.86,
      metalness: 0.0,
    }),
    hoopOrange: new THREE.MeshStandardMaterial({
      color: '#ea580c',
      roughness: 0.32,
      metalness: 0.65,
    }),
    whitePaint: new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.55,
      metalness: 0.05,
    }),
    contactShadow: new THREE.MeshBasicMaterial({
      map: contactShadowMap,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    clockFace: new THREE.MeshStandardMaterial({
      map: clockMap,
      roughness: 0.35,
      metalness: 0.05,
    }),
    periodicTable: new THREE.MeshStandardMaterial({
      map: periodicMap,
      roughness: 0.5,
      metalness: 0.02,
    }),
    flag: new THREE.MeshStandardMaterial({
      map: flagMap,
      roughness: 0.68,
      metalness: 0.02,
      side: THREE.DoubleSide,
    }),
    monitorScreens,
  };

  return {
    ...mats,
    dispose: () => {
      textures.forEach((t) => t.dispose());
      Object.values(mats).forEach((m) => {
        if (Array.isArray(m)) {
          m.forEach((item) => item.dispose());
        } else {
          m.dispose();
        }
      });
    },
  };
}
