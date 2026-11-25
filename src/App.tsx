/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Footprints,
  Layers,
  Minus,
  Paintbrush,
  Plus,
  Sun,
  Sunset,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SchoolAmbientAudio } from './audio/schoolAmbientAudio';
import {
  FLOOR_PALETTES,
  FloorPaletteId,
  getZoneById,
  Lang,
  LANG_LABELS,
  MAX_STUDENTS,
  MAX_TEACHERS,
  SCHOOL_ZONES,
  TimePreset,
  UI_COPY,
  WALL_PALETTES,
  WallPaletteId,
  ZoneId,
} from './data/schoolData';
import { SchoolRulesModal } from './components/SchoolRulesModal';
import { HoveredTarget, SchoolViewport3D } from './components/SchoolViewport3D';

type DockTab = 'spaces' | 'customize';

export default function App() {
  const [lang, setLang] = useState<Lang>('ru');
  const [activeZone, setActiveZone] = useState<ZoneId>('courtyard');
  const [zoneTransitionNonce, setZoneTransitionNonce] = useState(0);
  const [walkMode, setWalkMode] = useState(false);
  const [cutaway, setCutaway] = useState(false);
  const [timePreset, setTimePreset] = useState<TimePreset>('morning');
  const [wallPalette, setWallPalette] = useState<WallPaletteId>('ivory');
  const [floorPalette, setFloorPalette] = useState<FloorPaletteId>('oak');
  const [teacherCount, setTeacherCount] = useState<number>(4);
  const [studentCount, setStudentCount] = useState<number>(12);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState<boolean>(false);
  const [dockTab, setDockTab] = useState<DockTab>('spaces');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesZoneId, setRulesZoneId] = useState<ZoneId>('courtyard');
  const [hovered, setHovered] = useState<HoveredTarget | null>(null);
  const audioRef = useRef<SchoolAmbientAudio | null>(null);

  const currentZone = getZoneById(activeZone);
  const langs: Lang[] = ['kk', 'ru', 'en'];

  // Clean up procedural Web Audio engine on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  // Sync ambient sound mix whenever toggle, current zone, or population changes
  useEffect(() => {
    if (!ambientSoundEnabled && !audioRef.current) return;
    if (!audioRef.current) {
      audioRef.current = new SchoolAmbientAudio();
    }
    const populationRatio =
      (teacherCount + studentCount) / (MAX_TEACHERS + MAX_STUDENTS);
    audioRef.current.updateState({
      enabled: ambientSoundEnabled,
      zone: activeZone,
      populationRatio,
    });
  }, [ambientSoundEnabled, activeZone, teacherCount, studentCount]);

  // Keyboard shortcuts: H collapses HUD, Esc closes Rules Modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && rulesOpen) {
        setRulesOpen(false);
      } else if ((e.key === 'h' || e.key === 'H') && !rulesOpen) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rulesOpen]);

  const handleSelectZone = useCallback((zoneId: ZoneId, fromWalk = false) => {
    setActiveZone(zoneId);
    if (!fromWalk) {
      if (zoneId !== 'courtyard') {
        setCutaway(false);
      }
      setZoneTransitionNonce((n) => n + 1);
    }
  }, []);

  const handleOpenRules = useCallback((zoneId: ZoneId) => {
    setRulesZoneId(zoneId);
    setRulesOpen(true);
  }, []);

  const handleToggleCutaway = useCallback(() => {
    setWalkMode(false);
    setCutaway((prev) => !prev);
  }, []);

  const handleToggleWalk = useCallback(() => {
    setCutaway(false);
    setWalkMode((prev) => !prev);
  }, []);

  const hoveredZone = hovered ? getZoneById(hovered.zoneId) : null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Full-bleed 3D WebGL School Scene */}
      <SchoolViewport3D
        lang={lang}
        activeZone={activeZone}
        zoneTransitionNonce={zoneTransitionNonce}
        walkMode={walkMode}
        cutaway={cutaway}
        timePreset={timePreset}
        wallPalette={wallPalette}
        floorPalette={floorPalette}
        teacherCount={teacherCount}
        studentCount={studentCount}
        onSelectZone={handleSelectZone}
        onOpenRules={handleOpenRules}
        onHoverChange={setHovered}
      />

      {/* Minimal Top-Left Identity & Current Location Header (no backdrop-filter over WebGL) */}
      <header className="pointer-events-none fixed top-4 left-4 right-4 z-20 flex items-center justify-between gap-4">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-lg">
          <div className="min-w-0">
            <h1 className="font-display text-sm sm:text-base font-bold text-white tracking-tight whitespace-nowrap">
              {UI_COPY.appName[lang]}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
              <span className="font-mono-num text-sky-400 font-semibold">
                {currentZone.code}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[200px] sm:max-w-[280px]">
                {currentZone.name[lang]}
              </span>
            </div>
          </div>
        </div>

        {/* Trilingual Selector (Қаз / Рус / Eng) */}
        <div
          className="pointer-events-auto flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-lg"
          role="group"
          aria-label="Language"
        >
          {langs.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                lang === code
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {LANG_LABELS[code]}
            </button>
          ))}
        </div>
      </header>

      {/* Contextual 3D Hover Action Prompt */}
      {hovered && hoveredZone && !rulesOpen && (
        <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-36 z-20 px-4 py-2 rounded-lg bg-slate-950/95 border border-sky-500/60 text-xs sm:text-sm text-white shadow-lg whitespace-nowrap">
          <span className="font-semibold text-sky-400">
            {hovered.type === 'door'
              ? UI_COPY.enterRoomPrompt[lang]
              : UI_COPY.readBoardPrompt[lang]}
          </span>
          <span className="mx-2 text-slate-500" aria-hidden="true">
            ·
          </span>
          <span>{hoveredZone.name[lang]}</span>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 bottom-4 z-20 w-[min(960px,95vw)] transition-transform duration-200 ease-out ${
          dockCollapsed ? 'translate-y-[calc(100%-34px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Handle */}
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/92 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer shadow"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>{UI_COPY.showControls[lang]}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>{UI_COPY.hideControls[lang]}</span>
              </>
            )}
          </button>
        </div>

        {/* Main Consolidated Dock Panel */}
        <div className="rounded-2xl bg-slate-950/92 border border-slate-700/80 px-3.5 py-3 shadow-2xl">
          {/* Top Dock Bar: Mode Tabs + Always-Visible School Rules CTA */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/90">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setDockTab('spaces')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dockTab === 'spaces'
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{UI_COPY.dockTabSpaces[lang]}</span>
              </button>
              <button
                type="button"
                onClick={() => setDockTab('customize')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  dockTab === 'customize'
                    ? 'bg-slate-100 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>{UI_COPY.dockTabCustomize[lang]}</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
              <span>
                {UI_COPY.teachersLabel[lang]}:{' '}
                <strong className="font-mono-num text-slate-200">{teacherCount}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {UI_COPY.studentsLabel[lang]}:{' '}
                <strong className="font-mono-num text-slate-200">{studentCount}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenRules(activeZone)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-700" />
              <span>{UI_COPY.rulesButton[lang]}</span>
            </button>
          </div>

          {/* Tab 1: Spaces & Navigation */}
          {dockTab === 'spaces' && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {SCHOOL_ZONES.map((zone) => {
                  const isActive = activeZone === zone.id && !cutaway;
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => handleSelectZone(zone.id, false)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      {zone.shortName[lang]}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleWalk}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    walkMode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{UI_COPY.walkMode[lang]}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleCutaway}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cutaway
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{UI_COPY.cutawayRoof[lang]}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTimePreset((prev) => (prev === 'morning' ? 'golden' : 'morning'))
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {timePreset === 'morning' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{UI_COPY.morningLight[lang]}</span>
                    </>
                  ) : (
                    <>
                      <Sunset className="w-3.5 h-3.5 text-orange-400" />
                      <span>{UI_COPY.goldenLight[lang]}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Interior Wall/Floor Colors + Teachers & Students Counts */}
          {dockTab === 'customize' && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
              {/* Interior Colors (Walls & Floors) */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                    {UI_COPY.wallColorLabel[lang]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {WALL_PALETTES.map((p) => {
                      const active = wallPalette === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          title={p.name[lang]}
                          aria-label={`${UI_COPY.wallColorLabel[lang]}: ${p.name[lang]}`}
                          onClick={() => setWallPalette(p.id)}
                          className={`w-6 h-6 rounded-md border transition-transform cursor-pointer ${
                            active
                              ? 'border-sky-400 ring-2 ring-sky-400/60 scale-110'
                              : 'border-slate-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: p.swatchHex }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                    {UI_COPY.floorColorLabel[lang]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {FLOOR_PALETTES.map((p) => {
                      const active = floorPalette === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          title={p.name[lang]}
                          aria-label={`${UI_COPY.floorColorLabel[lang]}: ${p.name[lang]}`}
                          onClick={() => setFloorPalette(p.id)}
                          className={`w-6 h-6 rounded-md border transition-transform cursor-pointer ${
                            active
                              ? 'border-sky-400 ring-2 ring-sky-400/60 scale-110'
                              : 'border-slate-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: p.swatchHex }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Teachers & Students Population Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                    {UI_COPY.teachersLabel[lang]}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      aria-label="-"
                      disabled={teacherCount <= 0}
                      onClick={() => setTeacherCount((c) => Math.max(0, c - 1))}
                      className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-num text-xs font-semibold text-white w-7 text-center">
                      {teacherCount}
                    </span>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={teacherCount >= MAX_TEACHERS}
                      onClick={() => setTeacherCount((c) => Math.min(MAX_TEACHERS, c + 1))}
                      className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                    {UI_COPY.studentsLabel[lang]}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      aria-label="-"
                      disabled={studentCount <= 0}
                      onClick={() => setStudentCount((c) => Math.max(0, c - 1))}
                      className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono-num text-xs font-semibold text-white w-7 text-center">
                      {studentCount}
                    </span>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={studentCount >= MAX_STUDENTS}
                      onClick={() => setStudentCount((c) => Math.min(MAX_STUDENTS, c + 1))}
                      className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={MAX_STUDENTS}
                    value={studentCount}
                    aria-label={UI_COPY.studentsLabel[lang]}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-20 accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Ambient School Sounds Toggle */}
                <button
                  type="button"
                  aria-pressed={ambientSoundEnabled}
                  onClick={() => {
                    const nextEnabled = !ambientSoundEnabled;
                    if (nextEnabled && !audioRef.current) {
                      audioRef.current = new SchoolAmbientAudio();
                    }
                    audioRef.current?.updateState({
                      enabled: nextEnabled,
                      zone: activeZone,
                      populationRatio:
                        (teacherCount + studentCount) / (MAX_TEACHERS + MAX_STUDENTS),
                    });
                    setAmbientSoundEnabled(nextEnabled);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    ambientSoundEnabled
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {ambientSoundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  )}
                  <span>{UI_COPY.ambientSoundLabel[lang]}</span>
                  <span aria-hidden="true" className="opacity-60">
                    ·
                  </span>
                  <span>
                    {ambientSoundEnabled
                      ? UI_COPY.ambientSoundOn[lang]
                      : UI_COPY.ambientSoundOff[lang]}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trilingual School Rules Handbook & Self-Check Modal */}
      <SchoolRulesModal
        open={rulesOpen}
        lang={lang}
        zoneId={rulesZoneId}
        onChangeLang={setLang}
        onNavigateToZone={(z) => handleSelectZone(z, false)}
        onClose={() => setRulesOpen(false)}
      />
    </main>
  );
}
