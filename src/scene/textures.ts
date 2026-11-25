import * as THREE from 'three';
import { Lang, SCHOOL_ZONES, UI_COPY, ZoneId } from '../data/schoolData';

function configureColorTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(maxAnisotropy, 8);
  if (repeatX !== 1 || repeatY !== 1) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
  }
  texture.needsUpdate = true;
  return texture;
}

export function createCourtyardPavingTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c8c3b8';
  ctx.fillRect(0, 0, 512, 512);

  const cols = 8;
  const rows = 8;
  const cellW = 512 / cols;
  const cellH = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cellW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const shade = 205 + ((r * 7 + c * 13) % 18) - 9;
      const warm = shade + 6;
      const cool = shade - 6;
      ctx.fillStyle = `rgb(${warm}, ${shade}, ${cool})`;
      ctx.fillRect(c * cellW + offset + 2, r * cellH + 2, cellW - 4, cellH - 4);

      // Subtle mineral grain
      ctx.fillStyle = 'rgba(110, 105, 95, 0.08)';
      ctx.fillRect(c * cellW + offset + 6, r * cellH + 6, cellW - 14, 3);
    }
  }

  return configureColorTexture(canvas, maxAnisotropy, 12, 12);
}

export function createGrassTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5f8b4c';
  ctx.fillRect(0, 0, 512, 512);

  // Organic mowed lawn stripes & subtle blade noise
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(120, 165, 86, 0.14)' : 'rgba(62, 102, 48, 0.12)';
    ctx.fillRect(i * 64, 0, 64, 512);
  }

  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 4000; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const g = 120 + Math.floor(rand() * 50);
    ctx.fillStyle = `rgba(${Math.floor(g * 0.62)}, ${g}, ${Math.floor(g * 0.45)}, 0.28)`;
    ctx.fillRect(x, y, 2, 5);
  }

  return configureColorTexture(canvas, maxAnisotropy, 24, 24);
}

export function createBasketballCourtTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Terracotta sports acrylic surface
  ctx.fillStyle = '#b45a3c';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle court texture speckle
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 1200; i++) {
    ctx.fillRect((i * 73) % 1024, (i * 139) % 1024, 3, 3);
  }

  // Deep teal painted key
  ctx.fillStyle = '#1f5c6e';
  ctx.fillRect(352, 40, 320, 380);

  // Crisp white lines
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 12;
  ctx.strokeRect(40, 40, 944, 944);

  // Key outline & free throw circle
  ctx.strokeRect(352, 40, 320, 380);
  ctx.beginPath();
  ctx.arc(512, 420, 140, 0, Math.PI * 2);
  ctx.stroke();

  // Three-point arc
  ctx.beginPath();
  ctx.arc(512, 140, 410, 0.14 * Math.PI, 0.86 * Math.PI);
  ctx.stroke();

  // Half-court accent circle at bottom edge
  ctx.beginPath();
  ctx.arc(512, 984, 140, Math.PI, Math.PI * 2);
  ctx.stroke();

  return configureColorTexture(canvas, maxAnisotropy, 1, 1);
}

export function createFacadeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ebe5d8';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle architectural stone panel seams
  ctx.strokeStyle = 'rgba(130, 120, 102, 0.18)';
  ctx.lineWidth = 2;
  for (let y = 0; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  return configureColorTexture(canvas, maxAnisotropy, 6, 3);
}

export function createWoodFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c9a679';
  ctx.fillRect(0, 0, 512, 512);

  const plankH = 32;
  for (let r = 0; r < 16; r++) {
    const offset = (r % 3) * 85;
    for (let c = -1; c < 4; c++) {
      const x = c * 170 + offset;
      const y = r * plankH;
      const tone = ((r * 11 + c * 7) % 16) - 8;
      ctx.fillStyle = `rgb(${201 + tone}, ${166 + tone}, ${120 + tone})`;
      ctx.fillRect(x + 1, y + 1, 168, plankH - 2);

      // Subtle wood grain line
      ctx.fillStyle = 'rgba(110, 74, 36, 0.09)';
      ctx.fillRect(x + 4, y + 10, 160, 2);
      ctx.fillRect(x + 12, y + 22, 144, 1.5);
    }
  }

  return configureColorTexture(canvas, maxAnisotropy, 5, 5);
}

export function createCorridorFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#dde2e6';
  ctx.fillRect(0, 0, 512, 512);

  const size = 128;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7eaee' : '#dce1e6';
      ctx.fillRect(c * size + 2, r * size + 2, size - 4, size - 4);
    }
  }

  // Terrazzo flecks
  for (let i = 0; i < 360; i++) {
    ctx.fillStyle = i % 3 === 0 ? 'rgba(90,104,120,0.12)' : 'rgba(180,150,115,0.12)';
    ctx.fillRect((i * 89) % 512, (i * 151) % 512, 3, 3);
  }

  return configureColorTexture(canvas, maxAnisotropy, 12, 3);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createClockFaceTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 8;
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const inner = i % 3 === 0 ? 88 : 98;
    ctx.beginPath();
    ctx.lineWidth = i % 3 === 0 ? 5 : 3;
    ctx.moveTo(128 + Math.cos(angle) * inner, 128 + Math.sin(angle) * inner);
    ctx.lineTo(128 + Math.cos(angle) * 110, 128 + Math.sin(angle) * 110);
    ctx.stroke();
  }

  // Hands at 08:30 (school start!)
  ctx.strokeStyle = '#0f172a';
  ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(78, 152);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 204);
  ctx.stroke();

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(128, 128, 8, 0, Math.PI * 2);
  ctx.fill();

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createPeriodicTableTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 1008, 496);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PERIODIC TABLE OF ELEMENTS', 512, 48);

  const cellW = 50;
  const cellH = 48;
  const startX = 62;
  const startY = 82;
  const palette = ['#38bdf8', '#fb923c', '#facc15', '#4ade80', '#a78bfa', '#f472b6'];

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 18; col++) {
      if (row === 0 && col > 0 && col < 17) continue;
      if ((row === 1 || row === 2) && col > 1 && col < 12) continue;

      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const color =
        col <= 1
          ? palette[0]
          : col >= 12 && col <= 16
            ? palette[3]
            : col === 17
              ? palette[4]
              : palette[2];

      ctx.fillStyle = color;
      ctx.fillRect(x + 3, y + 3, cellW - 6, cellH - 6);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(x + 11, y + 18, cellW - 22, 6);
      ctx.fillRect(x + 15, y + 29, cellW - 30, 4);
    }
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createMonitorScreenTexture(maxAnisotropy: number, variant: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 320);

  // Top bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 34);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(16, 12, 86, 10);

  // Sidebar
  ctx.fillStyle = '#172033';
  ctx.fillRect(0, 34, 110, 286);

  // Code lines
  const colors = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#e2e8f0'];
  for (let i = 0; i < 11; i++) {
    const indent = ((i + variant) % 3) * 20;
    const width = 90 + ((i * 53 + variant * 37) % 190);
    ctx.fillStyle = colors[(i + variant) % colors.length];
    ctx.fillRect(132 + indent, 56 + i * 22, width, 9);
  }

  return configureColorTexture(canvas, maxAnisotropy);
}

export function createFlagTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Kazakh sky blue with golden sun emblem & subtle ornamental band
  ctx.fillStyle = '#00a3d9';
  ctx.fillRect(0, 0, 512, 256);

  // Left vertical golden ornament strip
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(22, 16, 18, 224);
  ctx.fillStyle = '#00a3d9';
  for (let y = 26; y < 230; y += 26) {
    ctx.fillRect(26, y, 10, 10);
  }

  // Golden sun with rays
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(268, 128, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = 4;
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(268 + Math.cos(a) * 46, 128 + Math.sin(a) * 46);
    ctx.lineTo(268 + Math.cos(a) * 64, 128 + Math.sin(a) * 64);
    ctx.stroke();
  }

  // Stylized soaring wings arc beneath sun
  ctx.beginPath();
  ctx.lineWidth = 7;
  ctx.arc(268, 145, 76, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  return configureColorTexture(canvas, maxAnisotropy);
}

// =========================================================================
// Dynamic Trilingual Canvas Textures (redrawn cleanly on language switch!)
// =========================================================================

export interface DynamicSignHandles {
  facadeCanvas: HTMLCanvasElement;
  facadeTexture: THREE.CanvasTexture;
  doorTextures: Map<string, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; accent: string; code: string; zoneId: ZoneId }>;
  boardTextures: Map<ZoneId, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }>;
  chalkboardTextures: Map<ZoneId, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }>;
  redrawAll: (lang: Lang) => void;
  dispose: () => void;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
): number {
  const words = text.split(' ');
  let line = '';
  let currY = y;
  let count = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      count++;
      if (count >= maxLines) {
        ctx.fillText(`${line}…`, x, currY);
        return currY + lineHeight;
      }
      ctx.fillText(line, x, currY);
      line = words[i];
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currY);
    currY += lineHeight;
  }
  return currY;
}

export function createDynamicTrilingualTextures(maxAnisotropy: number, initialLang: Lang): DynamicSignHandles {
  const facadeCanvas = document.createElement('canvas');
  facadeCanvas.width = 1024;
  facadeCanvas.height = 256;
  const facadeTexture = configureColorTexture(facadeCanvas, maxAnisotropy);

  const doorTextures = new Map<
    string,
    { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; accent: string; code: string; zoneId: ZoneId }
  >();
  const boardTextures = new Map<ZoneId, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }>();
  const chalkboardTextures = new Map<ZoneId, { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture }>();

  for (const zone of SCHOOL_ZONES) {
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 768;
    bCanvas.height = 1024;
    boardTextures.set(zone.id, {
      canvas: bCanvas,
      texture: configureColorTexture(bCanvas, maxAnisotropy),
    });

    if (zone.id.startsWith('classroom-')) {
      const dCanvas = document.createElement('canvas');
      dCanvas.width = 512;
      dCanvas.height = 192;
      doorTextures.set(zone.id, {
        canvas: dCanvas,
        texture: configureColorTexture(dCanvas, maxAnisotropy),
        accent: zone.accentHex,
        code: zone.code,
        zoneId: zone.id,
      });

      const cCanvas = document.createElement('canvas');
      cCanvas.width = 1024;
      cCanvas.height = 512;
      chalkboardTextures.set(zone.id, {
        canvas: cCanvas,
        texture: configureColorTexture(cCanvas, maxAnisotropy),
      });
    }
  }

  // Main entrance & exit door signs
  const entCanvas = document.createElement('canvas');
  entCanvas.width = 512;
  entCanvas.height = 140;
  doorTextures.set('entrance', {
    canvas: entCanvas,
    texture: configureColorTexture(entCanvas, maxAnisotropy),
    accent: '#0EA5E9',
    code: '01',
    zoneId: 'corridor',
  });

  const redrawFacade = (lang: Lang) => {
    const ctx = facadeCanvas.getContext('2d')!;
    ctx.fillStyle = '#133146';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = '#d4a94a';
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, 996, 228);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 68px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(UI_COPY.facadeTitle[lang], 512, 108);

    ctx.fillStyle = '#eab308';
    ctx.font = '600 30px Manrope, sans-serif';
    ctx.fillText(UI_COPY.facadeMotto[lang], 512, 182);

    facadeTexture.needsUpdate = true;
  };

  const redrawDoors = (lang: Lang) => {
    doorTextures.forEach((entry, key) => {
      const ctx = entry.canvas.getContext('2d')!;
      const w = entry.canvas.width;
      const h = entry.canvas.height;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = entry.accent;
      ctx.fillRect(0, 0, 18, h);

      if (key === 'entrance') {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 44px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(UI_COPY.entranceLabel[lang], w / 2 + 6, h / 2);
      } else {
        const zone = SCHOOL_ZONES.find((z) => z.id === entry.zoneId)!;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 54px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(entry.code, 40, h * 0.36);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 30px Manrope, sans-serif';
        ctx.fillText(zone.shortName[lang].replace(/^\d+\s*/, ''), 40, h * 0.72);
      }
      entry.texture.needsUpdate = true;
    });
  };

  const redrawBoards = (lang: Lang) => {
    for (const zone of SCHOOL_ZONES) {
      const entry = boardTextures.get(zone.id);
      if (!entry) continue;
      const ctx = entry.canvas.getContext('2d')!;

      // Clean ivory architectural poster surface
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 768, 1024);

      // Header band
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 768, 184);

      ctx.fillStyle = zone.accentHex;
      ctx.fillRect(0, 174, 768, 10);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px Manrope, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(UI_COPY.boardHeader[lang], 48, 66);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 40px Montserrat, sans-serif';
      ctx.fillText(zone.name[lang], 48, 128);

      // Rules list
      let y = 246;
      zone.rules.forEach((rule, idx) => {
        ctx.fillStyle = zone.accentHex;
        ctx.font = '700 28px JetBrains Mono, monospace';
        ctx.fillText(`0${idx + 1}.`, 48, y);

        ctx.fillStyle = '#0f172a';
        ctx.font = '700 28px Manrope, sans-serif';
        wrapText(ctx, rule.title[lang], 112, y, 608, 34, 2);

        ctx.fillStyle = '#475569';
        ctx.font = '500 22px Manrope, sans-serif';
        y = wrapText(ctx, rule.description[lang], 112, y + 42, 608, 30, 3);
        y += 32;

        if (idx < zone.rules.length - 1) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(48, y - 16, 672, 2);
          y += 14;
        }
      });

      // Footer prompt
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 938, 768, 86);
      ctx.fillStyle = '#1e293b';
      ctx.font = '600 24px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(UI_COPY.boardFooter[lang], 384, 988);

      entry.texture.needsUpdate = true;
    }
  };

  const redrawChalkboards = (lang: Lang) => {
    const drawBase = (ctx: CanvasRenderingContext2D, bg: string) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 512);
      // Soft chalk dust patina
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(40, 40, 944, 432);
    };

    // Math 101
    const math = chalkboardTextures.get('classroom-math');
    if (math) {
      const ctx = math.canvas.getContext('2d')!;
      drawBase(ctx, '#1c4435');
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '600 38px Manrope, sans-serif';
      ctx.textAlign = 'left';
      const title =
        lang === 'kk' ? 'Геометрия және Алгебра' : lang === 'ru' ? 'Геометрия и Алгебра' : 'Geometry & Algebra';
      ctx.fillText(title, 56, 76);

      ctx.font = '500 36px JetBrains Mono, monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('a² + b² = c²', 64, 172);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('S = π · r²', 64, 248);
      ctx.fillText('f(x) = ax² + bx + c', 64, 326);
      ctx.fillText('sin²α + cos²α = 1', 64, 404);

      // Right triangle diagram
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(640, 380);
      ctx.lineTo(900, 380);
      ctx.lineTo(640, 160);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeRect(640, 344, 36, 36);
      ctx.fillStyle = '#93c5fd';
      ctx.font = '600 28px JetBrains Mono, monospace';
      ctx.fillText('a', 606, 280);
      ctx.fillText('b', 762, 420);
      ctx.fillText('c', 784, 250);
      math.texture.needsUpdate = true;
    }

    // Science 102
    const sci = chalkboardTextures.get('classroom-science');
    if (sci) {
      const ctx = sci.canvas.getContext('2d')!;
      drawBase(ctx, '#1b3b36');
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 38px Manrope, sans-serif';
      ctx.textAlign = 'left';
      const title =
        lang === 'kk'
          ? 'Зертханалық жұмыс · H₂O'
          : lang === 'ru'
            ? 'Лабораторная работа · H₂O'
            : 'Lab Experiment · H₂O';
      ctx.fillText(title, 56, 76);

      ctx.font = '500 34px JetBrains Mono, monospace';
      ctx.fillStyle = '#86efac';
      ctx.fillText('2H₂ + O₂ → 2H₂O', 64, 180);
      ctx.fillStyle = '#fde68a';
      ctx.fillText('NaOH + HCl → NaCl + H₂O', 64, 260);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('pH = -log₁₀[H⁺]', 64, 340);

      // Molecule diagram
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(760, 260);
      ctx.lineTo(670, 340);
      ctx.moveTo(760, 260);
      ctx.lineTo(850, 340);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(760, 260, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(670, 340, 24, 0, Math.PI * 2);
      ctx.arc(850, 340, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 28px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('O', 760, 270);
      ctx.fillText('H', 670, 350);
      ctx.fillText('H', 850, 350);
      sci.texture.needsUpdate = true;
    }

    // Library 103
    const lib = chalkboardTextures.get('classroom-library');
    if (lib) {
      const ctx = lib.canvas.getContext('2d')!;
      drawBase(ctx, '#1e293b');
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.strokeRect(24, 24, 976, 464);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 40px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      const title =
        lang === 'kk' ? 'ОҚУ ЗАЛЫ · КІТАПХАНА' : lang === 'ru' ? 'ЧИТАЛЬНЫЙ ЗАЛ · БИБЛИОТЕКА' : 'READING ROOM · LIBRARY';
      ctx.fillText(title, 512, 146);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 32px Manrope, sans-serif';
      const quote =
        lang === 'kk'
          ? '«Кітап — білім бұлағы, білім — өмір шырағы»'
          : lang === 'ru'
            ? '«Книга — источник знаний и тихого вдохновения»'
            : '“A library is a quiet bridge to every world of knowledge”';
      ctx.fillText(quote, 512, 268);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 26px Manrope, sans-serif';
      const hours =
        lang === 'kk' ? 'Дүйсенбі – Сенбі · 08:00 – 18:00' : lang === 'ru' ? 'Пн – Сб · 08:00 – 18:00' : 'Mon – Sat · 08:00 – 18:00';
      ctx.fillText(hours, 512, 370);
      lib.texture.needsUpdate = true;
    }

    // IT 104
    const it = chalkboardTextures.get('classroom-it');
    if (it) {
      const ctx = it.canvas.getContext('2d')!;
      drawBase(ctx, '#0f172a');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1024, 62);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 28px Montserrat, sans-serif';
      ctx.textAlign = 'left';
      const title =
        lang === 'kk'
          ? 'Алгоритмдер және Бағдарламалау'
          : lang === 'ru'
            ? 'Алгоритмы и Программирование'
            : 'Algorithms & Programming';
      ctx.fillText(title, 36, 40);

      ctx.font = '500 30px JetBrains Mono, monospace';
      ctx.fillStyle = '#c084fc';
      ctx.fillText('function', 54, 140);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('learnSafely(student) {', 214, 140);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('const focus = true;', 104, 210);
      ctx.fillText('const respect = true;', 104, 270);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('return focus && respect;', 104, 340);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('}', 54, 410);
      it.texture.needsUpdate = true;
    }
  };

  const redrawAll = (lang: Lang) => {
    redrawFacade(lang);
    redrawDoors(lang);
    redrawBoards(lang);
    redrawChalkboards(lang);
  };

  redrawAll(initialLang);

  return {
    facadeCanvas,
    facadeTexture,
    doorTextures,
    boardTextures,
    chalkboardTextures,
    redrawAll,
    dispose: () => {
      facadeTexture.dispose();
      doorTextures.forEach((v) => v.texture.dispose());
      boardTextures.forEach((v) => v.texture.dispose());
      chalkboardTextures.forEach((v) => v.texture.dispose());
    },
  };
}
