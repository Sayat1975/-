import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CUTAWAY_CAMERA,
  FLOOR_PALETTES,
  FloorPaletteId,
  getZoneById,
  Lang,
  TimePreset,
  UI_COPY,
  WALL_PALETTES,
  WallPaletteId,
  ZoneId,
} from '../data/schoolData';
import { buildSchoolScene, BuiltSchoolScene } from '../scene/buildSchoolScene';
import { CharacterPopulation, createSchoolCharacters } from '../scene/characters';
import { createSchoolMaterials, SchoolMaterials } from '../scene/materials';
import { createDynamicTrilingualTextures, DynamicSignHandles } from '../scene/textures';

export interface HoveredTarget {
  type: 'door' | 'rules-board';
  zoneId: ZoneId;
}

interface SchoolViewport3DProps {
  lang: Lang;
  activeZone: ZoneId;
  zoneTransitionNonce: number;
  walkMode: boolean;
  cutaway: boolean;
  timePreset: TimePreset;
  wallPalette: WallPaletteId;
  floorPalette: FloorPaletteId;
  teacherCount: number;
  studentCount: number;
  onSelectZone: (zoneId: ZoneId, fromWalk?: boolean) => void;
  onOpenRules: (zoneId: ZoneId) => void;
  onHoverChange: (target: HoveredTarget | null) => void;
}

// Pre-allocated scratch vectors for zero-GC render loop
const _goalCamPos = new THREE.Vector3();
const _goalTarget = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();
const _lookAtPt = new THREE.Vector3();
const _rayMouse = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function SchoolViewport3D({
  lang,
  activeZone,
  zoneTransitionNonce,
  walkMode,
  cutaway,
  timePreset,
  wallPalette,
  floorPalette,
  teacherCount,
  studentCount,
  onSelectZone,
  onOpenRules,
  onHoverChange,
}: SchoolViewport3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  // Refs synced to latest React props so WebGL canvas never tears down
  const propsRef = useRef({
    lang,
    activeZone,
    walkMode,
    cutaway,
    timePreset,
    wallPalette,
    floorPalette,
    teacherCount,
    studentCount,
    onSelectZone,
    onOpenRules,
    onHoverChange,
  });
  propsRef.current = {
    lang,
    activeZone,
    walkMode,
    cutaway,
    timePreset,
    wallPalette,
    floorPalette,
    teacherCount,
    studentCount,
    onSelectZone,
    onOpenRules,
    onHoverChange,
  };

  const signsRef = useRef<DynamicSignHandles | null>(null);
  const builtRef = useRef<BuiltSchoolScene | null>(null);
  const matsRef = useRef<SchoolMaterials | null>(null);
  const peopleRef = useRef<CharacterPopulation | null>(null);
  const transitionRef = useRef<{
    active: boolean;
    camPos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    camPos: new THREE.Vector3(),
    target: new THREE.Vector3(),
  });

  const walkStateRef = useRef({
    yaw: 0,
    pitch: -0.04,
    dragging: false,
    lastX: 0,
    lastY: 0,
    keys: {} as Record<string, boolean>,
    lastDetectedZone: activeZone,
  });

  const lightingRef = useRef<{
    scene: THREE.Scene;
    sun: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
    fog: THREE.FogExp2;
  } | null>(null);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Redraw 3D signage textures cleanly whenever language switches
  useEffect(() => {
    signsRef.current?.redrawAll(lang);
  }, [lang]);

  // Apply interior wall & floor color palettes live without rebuilding the scene
  useEffect(() => {
    const mats = matsRef.current;
    if (!mats) return;
    const wp = WALL_PALETTES.find((p) => p.id === wallPalette) ?? WALL_PALETTES[0];
    mats.interiorWall.color.set(wp.wallHex);
    mats.interiorWallAccent.color.set(wp.accentHex);
  }, [wallPalette]);

  useEffect(() => {
    const mats = matsRef.current;
    if (!mats) return;
    const fp = FLOOR_PALETTES.find((p) => p.id === floorPalette) ?? FLOOR_PALETTES[0];
    mats.woodFloor.color.set(fp.woodTintHex);
    mats.corridorFloor.color.set(fp.corridorTintHex);
    mats.labFloor.color.set(fp.labFloorHex);
  }, [floorPalette]);

  // Update visible teacher & student counts live
  useEffect(() => {
    peopleRef.current?.setCounts(teacherCount, studentCount);
  }, [teacherCount, studentCount]);

  // Apply Floorplan Cutaway visibility + camera transition
  useEffect(() => {
    const built = builtRef.current;
    if (!built) return;
    built.upperStoryGroup.visible = !cutaway;

    if (cutaway && !propsRef.current.walkMode) {
      transitionRef.current.camPos.set(...CUTAWAY_CAMERA.pos);
      transitionRef.current.target.set(...CUTAWAY_CAMERA.target);
      transitionRef.current.active = true;
    } else if (!cutaway && !propsRef.current.walkMode) {
      const z = getZoneById(propsRef.current.activeZone);
      transitionRef.current.camPos.set(...z.cameraPos);
      transitionRef.current.target.set(...z.cameraTarget);
      transitionRef.current.active = true;
    }
  }, [cutaway]);

  // Trigger smooth camera glide when user picks a zone from UI or clicks a 3D door
  useEffect(() => {
    if (zoneTransitionNonce === 0) return;
    const zone = getZoneById(activeZone);
    const cam = cameraRef.current;

    if (propsRef.current.walkMode && cam) {
      cam.position.set(...zone.walkSpawn);
      walkStateRef.current.yaw = zone.walkYaw;
      walkStateRef.current.pitch = -0.03;
      walkStateRef.current.lastDetectedZone = activeZone;
      transitionRef.current.active = false;
      return;
    }

    transitionRef.current.camPos.set(...zone.cameraPos);
    transitionRef.current.target.set(...zone.cameraTarget);
    transitionRef.current.active = true;
  }, [activeZone, zoneTransitionNonce]);

  // Switch between OrbitControls and Walk Mode smoothly
  useEffect(() => {
    const controls = controlsRef.current;
    const cam = cameraRef.current;
    if (!controls || !cam) return;

    controls.enabled = !walkMode;
    transitionRef.current.active = false;

    if (walkMode) {
      const zone = getZoneById(propsRef.current.activeZone);
      cam.position.set(...zone.walkSpawn);
      walkStateRef.current.yaw = zone.walkYaw;
      walkStateRef.current.pitch = -0.03;
      walkStateRef.current.lastDetectedZone = propsRef.current.activeZone;
    } else {
      const zone = getZoneById(propsRef.current.activeZone);
      transitionRef.current.camPos.set(...zone.cameraPos);
      transitionRef.current.target.set(...zone.cameraTarget);
      transitionRef.current.active = true;
    }
  }, [walkMode]);

  // Update Lighting & Horizon Fog preset (Morning Sun vs Golden Hour)
  useEffect(() => {
    const rig = lightingRef.current;
    if (!rig) return;
    if (timePreset === 'morning') {
      const sky = new THREE.Color('#cbe4f6');
      rig.scene.background = sky;
      rig.fog.color.copy(sky);
      rig.fog.density = 0.0058;
      rig.sun.color.set('#fff6e5');
      rig.sun.intensity = 2.15;
      rig.sun.position.set(24, 34, 26);
      rig.hemi.color.set('#b8dff8');
      rig.hemi.groundColor.set('#6d7c59');
      rig.hemi.intensity = 0.85;
    } else {
      const sky = new THREE.Color('#f2c79d');
      rig.scene.background = sky;
      rig.fog.color.copy(sky);
      rig.fog.density = 0.0068;
      rig.sun.color.set('#ffbe78');
      rig.sun.intensity = 2.35;
      rig.sun.position.set(-32, 16, 22);
      rig.hemi.color.set('#ffd7b3');
      rig.hemi.groundColor.set('#5a4b41');
      rig.hemi.intensity = 0.72;
    }
  }, [timePreset]);

  // One-time WebGL & Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(canvas);

    // WebGL context loss safety
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // Scene, Studio Environment Map & Horizon Fog
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color('#cbe4f6');
    scene.background = skyColor;
    const fog = new THREE.FogExp2('#cbe4f6', 0.0058);
    scene.fog = fog;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Camera
    const initialZone = getZoneById(propsRef.current.activeZone);
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.15, 220);
    camera.position.set(...initialZone.cameraPos);
    cameraRef.current = camera;

    // OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minDistance = 2.2;
    controls.maxDistance = 58;
    controls.target.set(...initialZone.cameraTarget);
    controls.update();
    controlsRef.current = controls;

    // Cancel scripted camera transition as soon as user interacts
    const onControlsStart = () => {
      transitionRef.current.active = false;
    };
    controls.addEventListener('start', onControlsStart);

    // Balanced Lighting Rig (1 shadow-casting directional sun + cool/warm hemisphere + soft interior fills)
    const hemi = new THREE.HemisphereLight('#b8dff8', '#6d7c59', 0.85);
    hemi.position.set(0, 40, 0);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight('#fff6e5', 2.15);
    sun.position.set(24, 34, 26);
    sun.castShadow = !isSoftwareGl;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 96;
    const d = 34;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.025;
    scene.add(sun);

    // Soft shadowless interior point lights so classrooms & corridor stay warm and bright
    const interiorLightCoords: Array<[number, number, number, number]> = [
      [0, 3.8, -0.7, 1.3],
      [-16.2, 3.8, -8.5, 1.25],
      [-5.5, 3.8, -8.5, 1.25],
      [5.5, 3.8, -8.5, 1.25],
      [16.2, 3.8, -8.5, 1.25],
    ];
    interiorLightCoords.forEach(([lx, ly, lz, intensity]) => {
      const pt = new THREE.PointLight('#fff8eb', intensity, 16, 1.5);
      pt.position.set(lx, ly, lz);
      scene.add(pt);
    });

    lightingRef.current = { scene, sun, hemi, fog };

    // Build Procedural Materials, Trilingual Signage, 3D School World & Characters
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const mats = createSchoolMaterials(maxAnisotropy, isSoftwareGl);
    matsRef.current = mats;

    // Apply initial wall & floor palette
    const initWall =
      WALL_PALETTES.find((p) => p.id === propsRef.current.wallPalette) ?? WALL_PALETTES[0];
    mats.interiorWall.color.set(initWall.wallHex);
    mats.interiorWallAccent.color.set(initWall.accentHex);
    const initFloor =
      FLOOR_PALETTES.find((p) => p.id === propsRef.current.floorPalette) ?? FLOOR_PALETTES[0];
    mats.woodFloor.color.set(initFloor.woodTintHex);
    mats.corridorFloor.color.set(initFloor.corridorTintHex);
    mats.labFloor.color.set(initFloor.labFloorHex);

    const signs = createDynamicTrilingualTextures(maxAnisotropy, propsRef.current.lang);
    signsRef.current = signs;

    const built = buildSchoolScene(mats, signs);
    builtRef.current = built;
    scene.add(built.root);

    const people = createSchoolCharacters(mats);
    people.setCounts(propsRef.current.teacherCount, propsRef.current.studentCount);
    peopleRef.current = people;
    scene.add(people.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting for Clickable Doors & 3D Rules Boards
    const raycaster = new THREE.Raycaster();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;
    let currentHoveredKey: string | null = null;

    const updateRayFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      _rayMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _rayMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_rayMouse, camera);
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      if (propsRef.current.walkMode) {
        walkStateRef.current.dragging = true;
        walkStateRef.current.lastX = e.clientX;
        walkStateRef.current.lastY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (propsRef.current.walkMode && walkStateRef.current.dragging) {
        const dx = e.clientX - walkStateRef.current.lastX;
        const dy = e.clientY - walkStateRef.current.lastY;
        walkStateRef.current.lastX = e.clientX;
        walkStateRef.current.lastY = e.clientY;
        walkStateRef.current.yaw -= dx * 0.0042;
        walkStateRef.current.pitch = THREE.MathUtils.clamp(
          walkStateRef.current.pitch - dy * 0.0032,
          -0.65,
          0.65,
        );
      }

      // Throttled hover raycast (max 20Hz)
      const now = performance.now();
      if (now - lastHoverTime < 50) return;
      lastHoverTime = now;

      updateRayFromEvent(e);
      const hits = raycaster.intersectObjects(built.clickables, false);
      if (hits.length > 0) {
        const { interactType, zoneId } = hits[0].object.userData as {
          interactType: 'door' | 'rules-board';
          zoneId: ZoneId;
        };
        const key = `${interactType}:${zoneId}`;
        if (key !== currentHoveredKey) {
          currentHoveredKey = key;
          canvas.style.cursor = 'pointer';
          propsRef.current.onHoverChange({ type: interactType, zoneId });
        }
      } else if (currentHoveredKey !== null) {
        currentHoveredKey = null;
        canvas.style.cursor = propsRef.current.walkMode ? 'grab' : 'default';
        propsRef.current.onHoverChange(null);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      walkStateRef.current.dragging = false;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // User was orbiting/looking, not clicking

      updateRayFromEvent(e);
      const hits = raycaster.intersectObjects(built.clickables, false);
      if (hits.length > 0) {
        const { interactType, zoneId } = hits[0].object.userData as {
          interactType: 'door' | 'rules-board';
          zoneId: ZoneId;
        };
        if (interactType === 'rules-board') {
          propsRef.current.onOpenRules(zoneId);
        } else if (interactType === 'door') {
          propsRef.current.onSelectZone(zoneId, false);
        }
      }
    };

    // Keyboard Controls for Walk Mode
    const onKeyDown = (e: KeyboardEvent) => {
      walkStateRef.current.keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      walkStateRef.current.keys[e.code] = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Resize handling
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Collision helper for smooth wall sliding in Walk Mode
    const collidesAt = (nx: number, nz: number): boolean => {
      if (nx < -24.4 || nx > 24.4 || nz < -13.2 || nz > 27.6) return true;
      const r = 0.42;
      for (let i = 0; i < built.colliders.length; i++) {
        const c = built.colliders[i];
        if (nx + r > c.minX && nx - r < c.maxX && nz + r > c.minZ && nz - r < c.maxZ) {
          return true;
        }
      }
      return false;
    };

    // Flag geometry original Z cache for wave animation
    const flagPosAttr = built.flagMesh.geometry.attributes.position as THREE.BufferAttribute;
    const flagVertexCount = flagPosAttr.count;

    // Frame Loop with Software-WebGL Fence Pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;

      const dt = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();

      // 1. Gentle breeze animation on courtyard flag
      for (let i = 0; i < flagVertexCount; i++) {
        const fx = flagPosAttr.getX(i);
        const fy = flagPosAttr.getY(i);
        const wave = Math.sin(fx * 2.8 - elapsed * 4.2 + fy * 0.9) * (fx / 2.2) * 0.14;
        flagPosAttr.setZ(i, wave);
      }
      flagPosAttr.needsUpdate = true;

      // 2. Smooth Walk Mode or Orbit Camera Transitions
      if (propsRef.current.walkMode) {
        const ws = walkStateRef.current;
        const speed = ws.keys['ShiftLeft'] || ws.keys['ShiftRight'] ? 7.8 : 4.8;
        _forward.set(-Math.sin(ws.yaw), 0, -Math.cos(ws.yaw));
        _right.set(Math.cos(ws.yaw), 0, -Math.sin(ws.yaw));
        _move.set(0, 0, 0);

        if (ws.keys['KeyW'] || ws.keys['ArrowUp']) _move.add(_forward);
        if (ws.keys['KeyS'] || ws.keys['ArrowDown']) _move.sub(_forward);
        if (ws.keys['KeyD'] || ws.keys['ArrowRight']) _move.add(_right);
        if (ws.keys['KeyA'] || ws.keys['ArrowLeft']) _move.sub(_right);

        if (_move.lengthSq() > 0.0001) {
          _move.normalize().multiplyScalar(speed * dt);
          const nextX = camera.position.x + _move.x;
          const nextZ = camera.position.z + _move.z;
          if (!collidesAt(nextX, camera.position.z)) camera.position.x = nextX;
          if (!collidesAt(camera.position.x, nextZ)) camera.position.z = nextZ;

          const detected = built.detectZoneAt(camera.position.x, camera.position.z);
          if (detected !== ws.lastDetectedZone) {
            ws.lastDetectedZone = detected;
            propsRef.current.onSelectZone(detected, true);
          }
        }

        // Smooth eye-level step up onto building plinth (Y=0.3 -> eye=1.95 vs courtyard eye=1.65)
        const targetEyeY = camera.position.z < 2.6 ? 1.95 : 1.65;
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetEyeY, 8, dt);

        _lookAtPt.set(
          camera.position.x - Math.sin(ws.yaw) * Math.cos(ws.pitch),
          camera.position.y + Math.sin(ws.pitch),
          camera.position.z - Math.cos(ws.yaw) * Math.cos(ws.pitch),
        );
        camera.lookAt(_lookAtPt);
      } else {
        if (transitionRef.current.active) {
          _goalCamPos.copy(transitionRef.current.camPos);
          _goalTarget.copy(transitionRef.current.target);

          const alpha = 1 - Math.exp(-5.2 * dt);
          camera.position.lerp(_goalCamPos, alpha);
          controls.target.lerp(_goalTarget, alpha);

          if (
            camera.position.distanceToSquared(_goalCamPos) < 0.004 &&
            controls.target.distanceToSquared(_goalTarget) < 0.004
          ) {
            camera.position.copy(_goalCamPos);
            controls.target.copy(_goalTarget);
            transitionRef.current.active = false;
          }
        }
        controls.update();
      }

      // 3. Smooth Door Swing Animation (opens when player is nearby OR inside/entering that room)
      for (let i = 0; i < built.animatedDoors.length; i++) {
        const door = built.animatedDoors[i];
        const camDistSq =
          (camera.position.x - door.worldPos.x) ** 2 +
          (camera.position.z - door.worldPos.z) ** 2;

        const isActiveDoor =
          propsRef.current.activeZone === door.zoneId ||
          (door.zoneId === 'corridor' && propsRef.current.activeZone !== 'courtyard');

        const shouldOpen = camDistSq < 12.25 || isActiveDoor;
        const targetAngle = shouldOpen ? door.openAngle : door.closedAngle;
        door.currentAngle = THREE.MathUtils.damp(door.currentAngle, targetAngle, 6.5, dt);

        door.pivot.rotation.y = door.currentAngle;
        if (door.isDouble && door.rightPivot) {
          door.rightPivot.rotation.y = -door.currentAngle;
        }
      }

      // 4. Animate Teachers & Students
      people.update(elapsed);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlsStart);
      controls.dispose();
      envTarget.dispose();
      people.dispose();
      signs.dispose();
      mats.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <div ref={mountRef} className="w-full h-full" />
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-6 z-20">
          <div className="max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
            <h2 className="font-display text-lg font-semibold text-white">
              {UI_COPY.webglUnavailableTitle[lang]}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {UI_COPY.webglUnavailableDesc[lang]}
            </p>
            <button
              type="button"
              onClick={() => onOpenRules(activeZone)}
              className="mt-5 px-4 py-2 text-sm font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors cursor-pointer"
            >
              {UI_COPY.rulesButton[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
