"use client";

import {
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  GraduationCap,
  Images,
  Layers,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Play,
  Printer,
  RotateCcw,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  finalQuizQuestions,
  lunasQuizQuestions,
  decirNoQuizQuestions,
  MODULE_EXPERIENCE_TOKENS,
  sacModules,
  trainingExamples,
  type SacModule,
  type TrainingCapsule,
  type TrainingExample,
} from "@/lib/sac-content";
import type { CompletionResult, SacUser } from "../sac-platform";

type Props = {
  completedModules: Set<string>;
  certified: boolean;
  user: SacUser;
  onComplete: (
    activityId: string,
    answers?: Array<number | string>,
  ) => Promise<CompletionResult>;
};

type CapsuleFilter = "capsule-recepcion" | "capsule-lunas" | "capsule-decir-no" | "all";

type Track = {
  id: string;
  label: string;
  tag: string;
  moduleIds?: string[];
  capsuleId?: "capsule-recepcion" | "capsule-lunas" | "capsule-decir-no";
};

const recepcionTracks: Track[] = [
  { id: "all-rec", label: "Toda la Cápsula 1", tag: "8 MÓDULOS" },
  {
    id: "rec-1",
    label: "Ruta 1: Recepción e Inspección",
    tag: "MÓDULOS 01 - 04",
    moduleIds: ["sac-01", "sac-02", "sac-03", "sac-04"],
  },
  {
    id: "rec-2",
    label: "Ruta 2: Manipulación y Taller",
    tag: "MÓDULOS 05 - 07",
    moduleIds: ["sac-05", "sac-06", "sac-07"],
  },
  {
    id: "rec-3",
    label: "Ruta 3: Casos Críticos",
    tag: "MÓDULO 08",
    moduleIds: ["sac-08"],
  },
];

const lunasTracks: Track[] = [
  { id: "all-lun", label: "Toda la Cápsula 2", tag: "8 MÓDULOS" },
  {
    id: "lun-1",
    label: "Ruta 1: Materiales y Defectos",
    tag: "MÓDULOS 01 - 03",
    moduleIds: ["sac-luna-01", "sac-luna-02", "sac-luna-03"],
  },
  {
    id: "lun-2",
    label: "Ruta 2: Multifocales y Lensometría",
    tag: "MÓDULOS 04 - 05",
    moduleIds: ["sac-luna-04", "sac-luna-05"],
  },
  {
    id: "lun-3",
    label: "Ruta 3: Auditoría y Dictamen",
    tag: "MÓDULOS 06 - 08",
    moduleIds: ["sac-luna-06", "sac-luna-07", "sac-luna-08"],
  },
];

const decirNoTracks: Track[] = [
  { id: "all-no", label: "Toda la Cápsula 3", tag: "8 MÓDULOS" },
  {
    id: "no-1",
    label: "Ruta 1: Límites y Sandwich",
    tag: "MÓDULOS 01 - 03",
    moduleIds: ["sac-no-01", "sac-no-02", "sac-no-03"],
  },
  {
    id: "no-2",
    label: "Ruta 2: Criterio Clínico y Garantías",
    tag: "MÓDULOS 04 - 05",
    moduleIds: ["sac-no-04", "sac-no-05"],
  },
  {
    id: "no-3",
    label: "Ruta 3: Desescalamiento y Alternativas",
    tag: "MÓDULOS 06 - 08",
    moduleIds: ["sac-no-06", "sac-no-07", "sac-no-08"],
  },
];

const allTracks: Track[] = [
  { id: "all", label: "Todos los cursos", tag: "24 MÓDULOS" },
  {
    id: "cap-rec",
    label: "Cápsula 1: Recepción Segura",
    tag: "8 MÓDULOS",
    capsuleId: "capsule-recepcion",
  },
  {
    id: "cap-luna",
    label: "Cápsula 2: Garantía de Lunas",
    tag: "8 MÓDULOS",
    capsuleId: "capsule-lunas",
  },
  {
    id: "cap-no",
    label: "Cápsula 3: Cómo Decir NO",
    tag: "8 MÓDULOS",
    capsuleId: "capsule-decir-no",
  },
];

export default function TrainingExperience({
  completedModules,
  certified,
  user,
  onComplete,
}: Props) {
  const [activeModule, setActiveModule] = useState<SacModule | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [activeQuizType, setActiveQuizType] = useState<"reception" | "lunas" | "decir-no">("reception");
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<CapsuleFilter | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>("all-rec");
  const [selectedRole, setSelectedRole] = useState<"all" | "Asesor" | "Optómetra">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hiddenCapsules, setHiddenCapsules] = useState<string[]>([]);
  const [customCapsulesList, setCustomCapsulesList] = useState<TrainingCapsule[]>([]);

  useEffect(() => {
    const loadCoursesConfig = () => {
      try {
        const raw = localStorage.getItem("sac-courses-config");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.hiddenCapsuleIds)) setHiddenCapsules(parsed.hiddenCapsuleIds);
          if (Array.isArray(parsed.customCapsules)) setCustomCapsulesList(parsed.customCapsules);
        } else {
          setHiddenCapsules([]);
          setCustomCapsulesList([]);
        }
      } catch {
        // ignore
      }
    };
    loadCoursesConfig();
    window.addEventListener("sac-courses-updated", loadCoursesConfig);
    return () => window.removeEventListener("sac-courses-updated", loadCoursesConfig);
  }, []);

  const isModuleCompleted = (module: SacModule) =>
    completedModules.has(module.id) ||
    (module.capsuleId === "capsule-lunas"
      ? completedModules.has(`luna-${module.order}`) ||
        completedModules.has(`module-luna-${module.order}`)
      : module.capsuleId === "capsule-decir-no"
        ? completedModules.has(`no-${module.order}`) ||
          completedModules.has(`module-no-${module.order}`)
        : completedModules.has(String(module.order)) ||
          completedModules.has(`module-${module.order}`));

  const recepcionModules = sacModules.filter(
    (m) => m.capsuleId === "capsule-recepcion" || !m.capsuleId,
  );
  const lunasModules = sacModules.filter((m) => m.capsuleId === "capsule-lunas");
  const decirNoModules = sacModules.filter((m) => m.capsuleId === "capsule-decir-no");

  const recepcionCompletedCount = recepcionModules.filter(isModuleCompleted).length;
  const lunasCompletedCount = lunasModules.filter(isModuleCompleted).length;
  const decirNoCompletedCount = decirNoModules.filter(isModuleCompleted).length;

  const totalCompleted = recepcionCompletedCount + lunasCompletedCount + decirNoCompletedCount;
  const percent = Math.round((totalCompleted / sacModules.length) * 100);
  const totalDuration = sacModules.reduce((acc, m) => acc + m.duration, 0);
  const totalXp = sacModules.reduce((acc, m) => acc + m.xp, 0);

  const activeTracks =
    selectedCapsule === "capsule-recepcion"
      ? recepcionTracks
      : selectedCapsule === "capsule-lunas"
        ? lunasTracks
        : selectedCapsule === "capsule-decir-no"
          ? decirNoTracks
          : allTracks;

  const activeTrackObj = activeTracks.find((t) => t.id === selectedTrack);

  const filteredModules = sacModules.filter((module) => {
    if (!selectedCapsule) return false;
    if (selectedCapsule !== "all") {
      const modCapsule = module.capsuleId || "capsule-recepcion";
      if (modCapsule !== selectedCapsule) return false;
    }
    if (activeTrackObj) {
      if (activeTrackObj.moduleIds && !activeTrackObj.moduleIds.includes(module.id)) {
        return false;
      }
      if (activeTrackObj.capsuleId && (module.capsuleId || "capsule-recepcion") !== activeTrackObj.capsuleId) {
        return false;
      }
    }
    if (selectedRole !== "all" && module.role !== "Todos" && module.role !== selectedRole) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = module.title.toLowerCase().includes(q);
      const inSummary = module.summary.toLowerCase().includes(q);
      const inKicker = module.kicker.toLowerCase().includes(q);
      const inSections = module.sections.some(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.body.toLowerCase().includes(q) ||
          (s.tip && s.tip.toLowerCase().includes(q)),
      );
      if (!inTitle && !inSummary && !inKicker && !inSections) return false;
    }
    return true;
  });

  const handleSelectCapsule = (capId: CapsuleFilter) => {
    if (selectedCapsule === capId) {
      setSelectedCapsule(null);
      return;
    }
    setSelectedCapsule(capId);
    if (capId === "capsule-recepcion") setSelectedTrack("all-rec");
    else if (capId === "capsule-lunas") setSelectedTrack("all-lun");
    else if (capId === "capsule-decir-no") setSelectedTrack("all-no");
    else setSelectedTrack("all");

    setTimeout(() => {
      document.getElementById("capsule-modules-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  const recepcionReady = recepcionCompletedCount === recepcionModules.length;
  const lunasReady = lunasCompletedCount === lunasModules.length;
  const decirNoReady = decirNoCompletedCount === decirNoModules.length;

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">FORMACIÓN PROFESIONAL SAC · 3 CÁPSULAS ({sacModules.length} EXPERIENCIAS)</span>
          <h1>Aprende mirando, explorando y practicando</h1>
          <p>
            Videos interactivos multi-toma, ejemplos fotográficos y práctica técnica guiada. Las evaluaciones quedan exclusivamente en la certificación.
          </p>
        </div>
        <div className="completion-badge">
          <strong>{percent}%</strong>
          <span>{totalCompleted} de {sacModules.length}</span>
        </div>
      </header>

      {/* Selector de Cápsulas Formativas */}
      <section className="capsule-switcher" aria-label="Cápsulas de aprendizaje">
        {!hiddenCapsules.includes("capsule-recepcion") && (
          <button
            type="button"
            className={`capsule-card ${selectedCapsule === "capsule-recepcion" ? "active" : ""}`}
            onClick={() => handleSelectCapsule("capsule-recepcion")}
            aria-pressed={selectedCapsule === "capsule-recepcion"}
          >
            <div className="capsule-card-top">
              <span className="capsule-kicker">CÁPSULA 01</span>
              <span className="capsule-stats-pill">
                {recepcionCompletedCount}/{recepcionModules.length} completados
              </span>
            </div>
            <h2 className="capsule-title">Protocolo de Recepción Segura</h2>
            <p className="capsule-desc">
              Armazones, Monturas e Inspección Fisonómica de Taller.
            </p>
            <div className="capsule-progress-bar">
              <div
                className="capsule-progress-fill"
                style={{ width: `${Math.round((recepcionCompletedCount / recepcionModules.length) * 100)}%` }}
              />
            </div>
            <div className="capsule-foot">
              <span className="capsule-meta">8 módulos · 120 min</span>
              {selectedCapsule === "capsule-recepcion" ? (
                <span className="capsule-tag-active">
                  Desplegado <ChevronUp />
                </span>
              ) : recepcionReady ? (
                <span className="capsule-tag-done">
                  <Check /> Completada · Ver <ChevronDown />
                </span>
              ) : (
                <span className="capsule-tag-pending">
                  {recepcionCompletedCount > 0 ? "Continuar" : "Ver módulos"} <ChevronDown />
                </span>
              )}
            </div>
          </button>
        )}

        {!hiddenCapsules.includes("capsule-lunas") && (
          <button
            type="button"
            className={`capsule-card ${selectedCapsule === "capsule-lunas" ? "active" : ""}`}
            onClick={() => handleSelectCapsule("capsule-lunas")}
            aria-pressed={selectedCapsule === "capsule-lunas"}
          >
            <div className="capsule-card-top">
              <span className="capsule-kicker accent">CÁPSULA 02</span>
              <span className="capsule-stats-pill">
                {lunasCompletedCount}/{lunasModules.length} completados
              </span>
            </div>
            <h2 className="capsule-title">Garantía y Gestión Técnica de Lunas</h2>
            <p className="capsule-desc">
              Criterios Ópticos, Tratamientos, Adaptación y Dictamen.
            </p>
            <div className="capsule-progress-bar">
              <div
                className="capsule-progress-fill"
                style={{ width: `${Math.round((lunasCompletedCount / lunasModules.length) * 100)}%` }}
              />
            </div>
            <div className="capsule-foot">
              <span className="capsule-meta">8 módulos · 124 min</span>
              {selectedCapsule === "capsule-lunas" ? (
                <span className="capsule-tag-active">
                  Desplegado <ChevronUp />
                </span>
              ) : lunasReady ? (
                <span className="capsule-tag-done">
                  <Check /> Completada · Ver <ChevronDown />
                </span>
              ) : (
                <span className="capsule-tag-pending">
                  {lunasCompletedCount > 0 ? "Continuar" : "Ver módulos"} <ChevronDown />
                </span>
              )}
            </div>
          </button>
        )}

        {!hiddenCapsules.includes("capsule-decir-no") && (
          <button
            type="button"
            className={`capsule-card ${selectedCapsule === "capsule-decir-no" ? "active" : ""}`}
            onClick={() => handleSelectCapsule("capsule-decir-no")}
            aria-pressed={selectedCapsule === "capsule-decir-no"}
          >
            <div className="capsule-card-top">
              <span className="capsule-kicker accent-purple">CÁPSULA 03 · NUEVA</span>
              <span className="capsule-stats-pill">
                {decirNoCompletedCount}/{decirNoModules.length} completados
              </span>
            </div>
            <h2 className="capsule-title">Cómo Decir NO al Cliente</h2>
            <p className="capsule-desc">
              Límites Técnicos, Técnica Sandwich, Desescalamiento y Alternativas.
            </p>
            <div className="capsule-progress-bar">
              <div
                className="capsule-progress-fill"
                style={{ width: `${Math.round((decirNoCompletedCount / decirNoModules.length) * 100)}%` }}
              />
            </div>
            <div className="capsule-foot">
              <span className="capsule-meta">8 módulos · 132 min</span>
              {selectedCapsule === "capsule-decir-no" ? (
                <span className="capsule-tag-active">
                  Desplegado <ChevronUp />
                </span>
              ) : decirNoReady ? (
                <span className="capsule-tag-done">
                  <Check /> Completada · Ver <ChevronDown />
                </span>
              ) : (
                <span className="capsule-tag-pending">
                  {decirNoCompletedCount > 0 ? "Continuar" : "Ver módulos"} <ChevronDown />
                </span>
              )}
            </div>
          </button>
        )}

        {customCapsulesList.filter((c) => !hiddenCapsules.includes(c.id)).map((customCap) => (
          <button
            type="button"
            key={customCap.id}
            className={`capsule-card ${selectedCapsule === customCap.id ? "active" : ""}`}
            onClick={() => handleSelectCapsule(customCap.id as CapsuleFilter)}
            aria-pressed={selectedCapsule === customCap.id}
          >
            <div className="capsule-card-top">
              <span className="capsule-kicker">{customCap.kicker || "CÁPSULA ESPECIAL"}</span>
              <span className="capsule-stats-pill">{customCap.moduleIds.length} módulos</span>
            </div>
            <h2 className="capsule-title">{customCap.title}</h2>
            <p className="capsule-desc">{customCap.subtitle || customCap.description}</p>
            <div className="capsule-foot">
              <span className="capsule-meta">{customCap.moduleIds.length} módulos</span>
              <span className="capsule-tag-pending">
                {selectedCapsule === customCap.id ? "Desplegado" : "Ver programa"} <ChevronDown />
              </span>
            </div>
          </button>
        ))}
      </section>

      {/* Despliegue de módulos solo al dar clic a una cápsula */}
      {selectedCapsule !== null && (
        <div id="capsule-modules-section" className="capsule-modules-container">
          <div className="capsule-open-header">
            <div className="capsule-open-info">
              <span className="capsule-kicker-open">
                {selectedCapsule === "capsule-recepcion"
                  ? "CÁPSULA 01 SELECCIONADA"
                  : selectedCapsule === "capsule-lunas"
                    ? "CÁPSULA 02 SELECCIONADA"
                    : selectedCapsule === "capsule-decir-no"
                      ? "CÁPSULA 03 SELECCIONADA"
                      : "CATÁLOGO COMPLETO"}
              </span>
              <h3>
                {selectedCapsule === "capsule-recepcion"
                  ? "Protocolo de Recepción Segura (8 Módulos)"
                  : selectedCapsule === "capsule-lunas"
                    ? "Garantía y Gestión Técnica de Lunas (8 Módulos)"
                    : selectedCapsule === "capsule-decir-no"
                      ? "Cómo Decir NO al Cliente con Asertividad (8 Módulos)"
                      : "Todos los cursos de formación (24 Módulos)"}
              </h3>
            </div>
            <button
              type="button"
              className="collapse-capsule-btn"
              onClick={() => setSelectedCapsule(null)}
              aria-label="Contraer módulos de la cápsula"
            >
              <ChevronUp /> Ocultar módulos
            </button>
          </div>

      {/* Barra de herramientas y filtros del catálogo */}
      <section className="catalog-toolbar" aria-label="Filtros del catálogo de formación">
        <div className="catalog-search-row">
          <div className="catalog-search-input">
            <Search className="search-icon" />
            <input
              type="search"
              placeholder="Buscar por material, bisel, craquelado, progresivos, lensometría, fotos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar módulos"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
              >
                <X />
              </button>
            )}
          </div>
          <div className="catalog-meta-stats">
            <span className="stat-pill"><Layers />{filteredModules.length} de {sacModules.length}</span>
            <span className="stat-pill"><Clock3 />{Math.round((totalDuration / 60) * 10) / 10}h</span>
            <span className="stat-pill xp"><Sparkles />+{totalXp} XP</span>
          </div>
        </div>

        <div className="catalog-tabs-row">
          <div className="catalog-track-tabs" role="tablist" aria-label="Rutas temáticas">
            {activeTracks.map((track) => {
              const active = selectedTrack === track.id;
              const count = track.moduleIds
                ? sacModules.filter((m) => track.moduleIds!.includes(m.id)).length
                : track.capsuleId
                  ? sacModules.filter((m) => (m.capsuleId || "capsule-recepcion") === track.capsuleId).length
                  : selectedCapsule === "capsule-recepcion"
                    ? recepcionModules.length
                    : selectedCapsule === "capsule-lunas"
                      ? lunasModules.length
                      : selectedCapsule === "capsule-decir-no"
                        ? decirNoModules.length
                        : sacModules.length;

              return (
                <button
                  key={track.id}
                  role="tab"
                  aria-selected={active}
                  className={`catalog-track-tab ${active ? "active" : ""}`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <span className="tab-label">{track.label}</span>
                  <span className="tab-badge">{count}</span>
                </button>
              );
            })}

            {selectedCapsule !== "all" ? (
              <button
                type="button"
                className="catalog-track-tab show-all-toggle"
                onClick={() => handleSelectCapsule("all")}
              >
                <span className="tab-label">Ver catálogo completo</span>
                <span className="tab-badge">{sacModules.length}</span>
              </button>
            ) : (
              <button
                type="button"
                className="catalog-track-tab show-all-toggle"
                onClick={() => handleSelectCapsule("capsule-recepcion")}
              >
                <span className="tab-label">Volver a Cápsula 1</span>
              </button>
            )}
          </div>

          <div className="catalog-role-filters">
            <label htmlFor="role-select" className="role-filter-label">Rol:</label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "all" | "Asesor" | "Optómetra")}
              className="catalog-role-select"
            >
              <option value="all">Todos los roles</option>
              <option value="Asesor">Asesores</option>
              <option value="Optómetra">Optómetras</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grilla de Módulos */}
      {filteredModules.length === 0 ? (
        <div className="catalog-empty-state">
          <ScanSearch className="empty-icon" />
          <h3>No se encontraron cursos con estos filtros</h3>
          <p>Intenta con otros términos de búsqueda o restablece los filtros para explorar todo el catálogo.</p>
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              handleSelectCapsule("capsule-recepcion");
              setSelectedRole("all");
              setSearchQuery("");
            }}
          >
            <RotateCcw />Restablecer filtros
          </button>
        </div>
      ) : (
        <section className="learning-grid" aria-label="Módulos de formación SAC">
          {filteredModules.map((module) => {
            const completed = isModuleCompleted(module);
            const isLuna = module.capsuleId === "capsule-lunas";
            const isNo = module.capsuleId === "capsule-decir-no";
            return (
              <article className={`learning-card ${completed ? "completed" : ""}`} key={module.id}>
                <div className="learning-poster">
                  <Image
                    src={module.poster}
                    alt={`Ejemplo visual de ${module.title.replace("SAC | ", "")}`}
                    fill
                    sizes="(max-width: 620px) 100vw, 190px"
                  />
                  <span>{module.kicker}</span>
                  {completed && <i><Check /></i>}
                </div>
                <div className="learning-copy">
                  <div className="learning-meta">
                    <span className={`capsule-tag-inline ${isLuna ? "luna" : isNo ? "decir-no" : "recepcion"}`}>
                      {isLuna ? "CÁPSULA 02 · LUNAS" : isNo ? "CÁPSULA 03 · LÍMITES" : "CÁPSULA 01 · RECEPCIÓN"}
                    </span>
                    <span>MÓDULO {String(module.order).padStart(2, "0")}</span>
                    <span><Clock3 />{module.duration} min</span>
                  </div>
                  <h2>{module.title.replace("SAC | ", "")}</h2>
                  <p>{module.summary}</p>
                  <div className="learning-foot">
                    <span className="role-pill">{module.role}</span>
                    <span className="visual-pill"><Images />3 ejemplos</span>
                    <span className="xp-pill">+{module.xp} XP</span>
                  </div>
                  <button
                    className={completed ? "secondary-action" : "primary-action"}
                    onClick={() => setActiveModule(module)}
                  >
                    {completed ? <BookOpenCheck /> : <Play />}
                    {completed ? "Repasar módulo" : "Comenzar módulo"}
                    <ChevronRight />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Banner de Certificación Adaptable */}
      {selectedCapsule === "capsule-decir-no" ? (
        <section className={`certification-banner ${decirNoReady ? "ready" : ""}`}>
          <span className="certification-seal"><GraduationCap /></span>
          <div>
            <span className="eyebrow">CERTIFICACIÓN SAC · CÁPSULA 03</span>
            <h2>Evaluación de asertividad y límites técnicos</h2>
            <p>
              {decirNoReady
                ? `Responde ${decirNoQuizQuestions.length} casos integradores de técnica sandwich, límites de taller, desescalamiento y deslinde. Se aprueba con ${Math.max(1, Math.ceil(decirNoQuizQuestions.length * 0.85))} respuestas correctas.`
                : `Completa los ${decirNoModules.length - decirNoCompletedCount} módulo${decirNoModules.length - decirNoCompletedCount === 1 ? "" : "s"} restantes de la Cápsula 03 para habilitar esta evaluación.`}
            </p>
          </div>
          <button
            className="primary-action"
            disabled={!decirNoReady}
            onClick={() => {
              setActiveQuizType("decir-no");
              setQuizOpen(true);
            }}
          >
            {decirNoReady ? <FileCheck2 /> : <LockKeyhole />}
            {decirNoReady ? "Presentar evaluación de asertividad" : "Aún bloqueada"}
          </button>
        </section>
      ) : selectedCapsule === "capsule-lunas" ? (
        <section className={`certification-banner ${lunasReady ? "ready" : ""}`}>
          <span className="certification-seal"><GraduationCap /></span>
          <div>
            <span className="eyebrow">CERTIFICACIÓN SAC · CÁPSULA 02</span>
            <h2>Evaluación final de garantía de lunas</h2>
            <p>
              {lunasReady
                ? `Responde ${lunasQuizQuestions.length} casos integradores de criterios ópticos, craquelado, adaptación y dictamen. Se aprueba con ${Math.max(1, Math.ceil(lunasQuizQuestions.length * 0.85))} respuestas correctas.`
                : `Completa los ${lunasModules.length - lunasCompletedCount} módulo${lunasModules.length - lunasCompletedCount === 1 ? "" : "s"} restantes de la Cápsula 02 para habilitar esta evaluación.`}
            </p>
          </div>
          <button
            className="primary-action"
            disabled={!lunasReady}
            onClick={() => {
              setActiveQuizType("lunas");
              setQuizOpen(true);
            }}
          >
            {lunasReady ? <FileCheck2 /> : <LockKeyhole />}
            {lunasReady ? "Presentar evaluación de lunas" : "Aún bloqueada"}
          </button>
        </section>
      ) : (
        <section className={`certification-banner ${recepcionReady ? "ready" : ""}`}>
          <span className="certification-seal"><GraduationCap /></span>
          <div>
            <span className="eyebrow">CERTIFICACIÓN SAC · CÁPSULA 01</span>
            <h2>{certified ? "Tu certificación está lista" : "Evaluación final de recepción segura"}</h2>
            <p>
              {certified
                ? "Aprobaste la evaluación. Puedes imprimir tu constancia oficial cuando la necesites."
                : recepcionReady
                  ? `Responde ${finalQuizQuestions.length} casos integradores de recepción y taller. Se aprueba con ${Math.max(1, Math.ceil(finalQuizQuestions.length * 0.85))} respuestas correctas.`
                  : `Completa los ${recepcionModules.length - recepcionCompletedCount} módulo${recepcionModules.length - recepcionCompletedCount === 1 ? "" : "s"} restantes de la Cápsula 01 para habilitar la evaluación.`}
            </p>
          </div>
          {certified ? (
            <button className="primary-action" onClick={() => setCertificateOpen(true)}>
              <BadgeCheck />Ver certificado
            </button>
          ) : (
            <button
              className="primary-action"
              disabled={!recepcionReady}
              onClick={() => {
                setActiveQuizType("reception");
                setQuizOpen(true);
              }}
            >
              {recepcionReady ? <FileCheck2 /> : <LockKeyhole />}
              {recepcionReady ? "Presentar evaluación de recepción" : "Aún bloqueada"}
            </button>
          )}
        </section>
      )}

          <div className="capsule-modules-bottom-bar">
            <button
              type="button"
              className="collapse-capsule-btn"
              onClick={() => {
                setSelectedCapsule(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <ChevronUp /> Subir y ocultar módulos
            </button>
          </div>
        </div>
      )}

      {activeModule && (
        <ModuleDialog
          module={activeModule}
          alreadyCompleted={isModuleCompleted(activeModule)}
          onClose={() => setActiveModule(null)}
          onComplete={onComplete}
        />
      )}

      {quizOpen && (
        <FinalQuizDialog
          quizType={activeQuizType}
          onClose={() => setQuizOpen(false)}
          onComplete={onComplete}
          onCertificate={() => {
            setQuizOpen(false);
            setCertificateOpen(true);
          }}
        />
      )}

      {certificateOpen && (
        <CertificateDialog
          user={user}
          quizType={activeQuizType}
          onClose={() => setCertificateOpen(false)}
        />
      )}
    </div>
  );
}

const lessonStages = [
  { label: "Mira", icon: Video },
  { label: "Explora", icon: ScanSearch },
  { label: "Practica", icon: Target },
  { label: "Cierra", icon: ShieldCheck },
] as const;

function ExampleVisual({
  example,
  compact = false,
}: {
  example: TrainingExample;
  compact?: boolean;
}) {
  return (
    <div
      className={`training-example-visual ${compact ? "compact" : ""} crop-${example.crop ?? "full"}`}
      role="img"
      aria-label={example.imageAlt}
      style={{ backgroundImage: `url(${example.image})` }}
    />
  );
}

function ModuleDialog({
  module,
  alreadyCompleted,
  onClose,
  onComplete,
}: {
  module: SacModule;
  alreadyCompleted: boolean;
  onClose: () => void;
  onComplete: Props["onComplete"];
}) {
  const examples = trainingExamples[module.id] ?? [];
  const [stage, setStage] = useState(0);
  const [videoSeen, setVideoSeen] = useState(alreadyCompleted);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [viewedExamples, setViewedExamples] = useState<Set<number>>(
    new Set(alreadyCompleted ? examples.map((_, index) => index) : []),
  );
  const [practiceStep, setPracticeStep] = useState(alreadyCompleted ? module.checklist.length : 0);
  const [saved, setSaved] = useState(alreadyCompleted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const examplesReady = examples.length > 0 && viewedExamples.size === examples.length;
  const practiceReady = practiceStep === module.checklist.length;
  const selected = selectedExample === null ? null : examples[selectedExample];
  const stageDone = [videoSeen, examplesReady, practiceReady, saved];

  const openExample = (index: number) => {
    setSelectedExample(index);
    setViewedExamples((current) => new Set(current).add(index));
  };

  const completeModule = async () => {
    setBusy(true);
    setError("");
    try {
      const actId =
        module.capsuleId === "capsule-lunas"
          ? `luna-${module.order}`
          : module.capsuleId === "capsule-decir-no"
            ? `no-${module.order}`
            : `module-${module.order}`;
      await onComplete(actId, [...MODULE_EXPERIENCE_TOKENS]);
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible guardar el módulo.");
    } finally {
      setBusy(false);
    }
  };

  const canOpenStage = (index: number) =>
    index === 0 ||
    (index === 1 && videoSeen) ||
    (index === 2 && videoSeen && examplesReady) ||
    (index === 3 && videoSeen && examplesReady && practiceReady);

  const footerMessage =
    stage === 0
      ? videoSeen
        ? "Demostración revisada. Continúa con los ejemplos."
        : "Reproduce al menos el 82 % de la demostración."
      : stage === 1
        ? examplesReady
          ? "Ya exploraste los tres ejemplos."
          : `Explora las imágenes: ${viewedExamples.size}/${examples.length}`
        : stage === 2
          ? practiceReady
            ? "Ruta práctica completada."
            : `Aplica el procedimiento paso a paso: ${practiceStep}/${module.checklist.length}`
          : saved
            ? "La experiencia ya consta como completada."
            : "Todo listo para guardar tu progreso.";

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="sac-modal lesson-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">
              {module.capsuleId === "capsule-lunas" ? "CÁPSULA 02 · LUNAS" : "CÁPSULA 01 · RECEPCIÓN"} · MÓDULO {String(module.order).padStart(2, "0")} · {module.kicker.toUpperCase()}
            </span>
            <h2 id="lesson-title">{module.title.replace("SAC | ", "")}</h2>
            <p>Demostración multi-toma, análisis visual y práctica guiada. Aquí no hay preguntas.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar módulo">
            <X />
          </button>
        </header>

        <nav className="lesson-stage-rail" aria-label="Etapas de la experiencia">
          {lessonStages.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setStage(index)}
                disabled={!canOpenStage(index)}
                aria-current={stage === index ? "step" : undefined}
                className={stageDone[index] ? "done" : ""}
              >
                <span>{stageDone[index] ? <Check /> : <Icon />}</span>
                <small>0{index + 1}</small>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </nav>

        <div className="lesson-body interactive-lesson-body">
          {stage === 0 && (
            <div className="lesson-stage-panel">
              <div className="video-shell">
                <video
                  controls
                  preload="metadata"
                  poster={module.poster}
                  onEnded={() => setVideoSeen(true)}
                  onTimeUpdate={(event) => {
                    if (
                      event.currentTarget.duration &&
                      event.currentTarget.currentTime / event.currentTarget.duration > 0.82
                    ) {
                      setVideoSeen(true);
                    }
                  }}
                >
                  <source src={module.video} type="video/mp4" />
                  <track kind="captions" src={module.captions} srcLang="es" label="Español" default />
                  Tu navegador no puede reproducir este video.
                </video>
                <div className={videoSeen ? "media-status done" : "media-status"}>
                  {videoSeen ? <CheckCircle2 /> : <Video />}
                  <span>{videoSeen ? "Demostración revisada" : "Mira al menos el 82 % para continuar"}</span>
                </div>
              </div>
              <div className="objective-panel">
                <span className="eyebrow">LO QUE VAS A PRACTICAR</span>
                <ul>
                  {module.objectives.map((objective) => (
                    <li key={objective}>
                      <Check />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              <section className="saci-learning-note">
                <Lightbulb />
                <div>
                  <span>SACI TE ACOMPAÑA</span>
                  <p>
                    No memorices respuestas. Observa cómo cambia el procedimiento cuando aparece una señal nueva y reproduce después la secuencia en la práctica guiada.
                  </p>
                </div>
              </section>
            </div>
          )}

          {stage === 1 && (
            <div className="lesson-stage-panel">
              <div className="stage-intro">
                <div>
                  <span className="eyebrow">LABORATORIO VISUAL</span>
                  <h3>Abre cada imagen y descubre cómo se actúa</h3>
                  <p>Selecciona los tres casos. SACI te muestra qué observar, qué hacer y qué evidencia debe quedar.</p>
                </div>
                <span className="stage-counter">
                  <Eye />{viewedExamples.size}/{examples.length} vistos
                </span>
              </div>
              <div className="training-example-tabs">
                {examples.map((example, index) => (
                  <button
                    key={example.id}
                    onClick={() => openExample(index)}
                    className={`${selectedExample === index ? "active" : ""} ${viewedExamples.has(index) ? "viewed" : ""}`}
                  >
                    <ExampleVisual example={example} compact />
                    <span>
                      <small>{example.label}</small>
                      <strong>{example.title}</strong>
                    </span>
                    {viewedExamples.has(index) && <CheckCircle2 />}
                  </button>
                ))}
              </div>
              {selected ? (
                <article className={`training-example-detail tone-${selected.tone}`}>
                  <ExampleVisual example={selected} />
                  <div className="example-analysis">
                    <span className="example-tone">{selected.label}</span>
                    <h3>{selected.title}</h3>
                    <p className="example-context">{selected.context}</p>
                    <dl>
                      <div>
                        <dt><ScanSearch />Qué observar</dt>
                        <dd>{selected.observe}</dd>
                      </div>
                      <div>
                        <dt><Target />Cómo actuar</dt>
                        <dd>{selected.action}</dd>
                      </div>
                      <div>
                        <dt><FileCheck2 />Qué debe quedar</dt>
                        <dd>{selected.evidence}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ) : (
                <div className="example-empty">
                  <Images />
                  <strong>Elige una imagen para comenzar</strong>
                  <span>Los detalles aparecerán aquí, sin calificaciones ni respuestas A, B, C o D.</span>
                </div>
              )}
            </div>
          )}

          {stage === 2 && (
            <div className="lesson-stage-panel">
              <div className="stage-intro">
                <div>
                  <span className="eyebrow">PRÁCTICA GUIADA</span>
                  <h3>Ejecuta el procedimiento con SACI</h3>
                  <p>Avanza una acción a la vez. Cada paso revela el criterio que debes aplicar en una recepción real.</p>
                </div>
                <span className="stage-counter">
                  <Target />{practiceStep}/{module.checklist.length} aplicados
                </span>
              </div>
              <div className="guided-practice">
                <div className="guided-practice-visual">
                  <Image
                    src={module.poster}
                    alt={`Ejemplo visual del módulo ${module.order}: ${module.title.replace("SAC | ", "")}`}
                    fill
                    sizes="(max-width: 620px) 100vw, 330px"
                  />
                  <span><Sparkles />SACI · modo práctica</span>
                </div>
                <div className="practice-timeline">
                  {module.checklist.map((item, index) => {
                    const completed = index < practiceStep;
                    const current = index === practiceStep;
                    const guide = module.sections[index % module.sections.length];
                    return (
                      <article key={item} className={completed ? "completed" : current ? "current" : "locked"}>
                        <span>{completed ? <Check /> : index + 1}</span>
                        <div>
                          <small>{completed ? "APLICADO" : current ? "PASO ACTUAL" : "SIGUIENTE"}</small>
                          <h4>{item}</h4>
                          {current && <p>{guide.body}</p>}
                          {current && guide.tip && (
                            <aside>
                              <Lightbulb />
                              {guide.tip}
                            </aside>
                          )}
                        </div>
                      </article>
                    );
                  })}
                  {!practiceReady && (
                    <button
                      className="practice-action"
                      onClick={() => setPracticeStep((current) => Math.min(current + 1, module.checklist.length))}
                    >
                      <Play />Aplicar este paso y continuar<ChevronRight />
                    </button>
                  )}
                  {practiceReady && (
                    <div className="practice-complete">
                      <CheckCircle2 />
                      <div>
                        <strong>Procedimiento recorrido</strong>
                        <span>Ya aplicaste cada acción con su contexto operativo.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="lesson-stage-panel">
              <div className="applied-summary-hero">
                <ShieldCheck />
                <div>
                  <span className="eyebrow">CIERRE APLICADO</span>
                  <h3>Ya puedes llevar este criterio a la recepción</h3>
                  <p>Revisaste una demostración multi-toma, analizaste tres casos visuales y ejecutaste el procedimiento completo.</p>
                </div>
              </div>
              <div className="applied-summary-grid">
                <section>
                  <span className="summary-icon"><Eye /></span>
                  <small>CASOS QUE YA RECONOCES</small>
                  {examples.map((example) => (
                    <p key={example.id}><Check />{example.title}</p>
                  ))}
                </section>
                <section>
                  <span className="summary-icon"><Target /></span>
                  <small>RUTA QUE YA PRACTICASTE</small>
                  {module.checklist.map((item) => (
                    <p key={item}><Check />{item}</p>
                  ))}
                </section>
              </div>
              <section className="saci-learning-note success">
                <CheckCircle2 />
                <div>
                  <span>FORMACIÓN SIN EXAMEN</span>
                  <p>Guardar este módulo confirma la experiencia práctica. Las preguntas calificadas permanecen separadas en Trivias y en la Evaluación final.</p>
                </div>
              </section>
              {saved && (
                <div className="result-banner success" role="status">
                  <strong>¡Experiencia completada!</strong>
                  <span>Tu avance y recompensa quedaron guardados.</span>
                </div>
              )}
              {error && <div className="form-alert error" role="alert">{error}</div>}
            </div>
          )}
        </div>

        <footer className="modal-footer interactive-lesson-footer">
          <button
            className="secondary-action"
            disabled={stage === 0}
            onClick={() => setStage((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft />Anterior
          </button>
          <span>{footerMessage}</span>
          {stage === 0 && (
            <button className="primary-action" disabled={!videoSeen} onClick={() => setStage(1)}>
              Explorar ejemplos<ChevronRight />
            </button>
          )}
          {stage === 1 && (
            <button className="primary-action" disabled={!examplesReady} onClick={() => setStage(2)}>
              Ir a la práctica<ChevronRight />
            </button>
          )}
          {stage === 2 && (
            <button className="primary-action" disabled={!practiceReady} onClick={() => setStage(3)}>
              Ver mi cierre<ChevronRight />
            </button>
          )}
          {stage === 3 &&
            (saved ? (
              <button className="primary-action" onClick={onClose}>
                <CheckCircle2 />Cerrar experiencia
              </button>
            ) : (
              <button className="primary-action" disabled={busy} onClick={completeModule}>
                {busy ? <LoaderCircle className="spin" /> : <CheckCircle2 />}
                {busy ? "Guardando…" : "Guardar módulo completado"}
              </button>
            ))}
        </footer>
      </section>
    </div>
  );
}

function FinalQuizDialog({
  quizType = "reception",
  onClose,
  onComplete,
  onCertificate,
}: {
  quizType?: "reception" | "lunas" | "decir-no";
  onClose: () => void;
  onComplete: Props["onComplete"];
  onCertificate: () => void;
}) {
  const questions =
    quizType === "lunas"
      ? lunasQuizQuestions
      : quizType === "decir-no"
        ? decirNoQuizQuestions
        : finalQuizQuestions;
  const activityId =
    quizType === "lunas"
      ? "quiz-lunas"
      : quizType === "decir-no"
        ? "quiz-decir-no"
        : "quiz-final";
  const quizTitle =
    quizType === "lunas"
      ? "Evaluación de Garantía y Gestión Técnica de Lunas"
      : quizType === "decir-no"
        ? "Evaluación de Asertividad y Límites Técnicos"
        : "Evaluación Integradora de Recepción Segura";
  const eyebrowText =
    quizType === "lunas"
      ? "CERTIFICACIÓN SAC · CÁPSULA 02"
      : quizType === "decir-no"
        ? "CERTIFICACIÓN SAC · CÁPSULA 03"
        : "CERTIFICACIÓN SAC · CÁPSULA 01";

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = questions.every((_, index) => answers[index] !== undefined);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      setResult(await onComplete(activityId, questions.map((_, index) => answers[index])));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible registrar la evaluación.");
    } finally {
      setBusy(false);
    }
  };

  const passThreshold = Math.max(1, Math.ceil(questions.length * 0.85));

  return (
    <div className="modal-backdrop">
      <section
        className="sac-modal quiz-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="final-title"
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">{eyebrowText}</span>
            <h2 id="final-title">{quizTitle}</h2>
            <p>
              {questions.length} situaciones · Aprobación: {passThreshold}/{questions.length}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar evaluación">
            <X />
          </button>
        </header>
        <div className="lesson-body">
          <div className="question-stack">
            {questions.map((question, index) => (
              <fieldset key={question.id} disabled={Boolean(result)}>
                <legend>
                  <small>{question.moduleId.replace("sac-", "MÓDULO ").toUpperCase()}</small>
                  {index + 1}. {question.prompt}
                </legend>
                <div className="option-grid">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={option}
                      className={answers[index] === optionIndex ? "selected" : ""}
                    >
                      <input
                        type="radio"
                        name={`final-${question.id}`}
                        checked={answers[index] === optionIndex}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [index]: optionIndex }))
                        }
                      />
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      {option}
                    </label>
                  ))}
                </div>
                {result && (
                  <p
                    className={
                      answers[index] === question.answer
                        ? "answer-note correct"
                        : "answer-note incorrect"
                    }
                  >
                    {answers[index] === question.answer
                      ? "Correcto. "
                      : `Respuesta correcta: ${String.fromCharCode(65 + question.answer)}. `}
                    {question.explanation}
                  </p>
                )}
              </fieldset>
            ))}
          </div>
          {result && (
            <div className={`result-banner ${result.attempt.passed ? "success" : "warning"}`}>
              <strong>
                {result.attempt.passed ? "Evaluación aprobada" : "Necesitas un nuevo intento"}
              </strong>
              <span>
                {result.attempt.score} de {result.attempt.maxScore} respuestas correctas.
              </span>
            </div>
          )}
          {error && <div className="form-alert error" role="alert">{error}</div>}
        </div>
        <footer className="modal-footer">
          <span>
            {result
              ? result.attempt.passed
                ? "Tu logro quedó guardado."
                : "Revisa la retroalimentación antes de reintentar."
              : `${Object.keys(answers).length}/${questions.length} respuestas`}
          </span>
          {result?.attempt.passed ? (
            <button className="primary-action" onClick={onCertificate}>
              <BadgeCheck />Abrir certificado
            </button>
          ) : result ? (
            <button
              className="secondary-action"
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
            >
              <Sparkles />Nuevo intento
            </button>
          ) : (
            <button className="primary-action" disabled={!ready || busy} onClick={submit}>
              {busy ? <LoaderCircle className="spin" /> : <FileCheck2 />}
              {busy ? "Evaluando…" : "Enviar evaluación"}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

function CertificateDialog({
  user,
  quizType = "reception",
  onClose,
}: {
  user: SacUser;
  quizType?: "reception" | "lunas" | "decir-no";
  onClose: () => void;
}) {
  const date = new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(new Date());
  const prefix =
    quizType === "lunas"
      ? "SAC-LUNA"
      : quizType === "decir-no"
        ? "SAC-ASERT"
        : "SAC-REC";
  const code = `${prefix}-${user.employeeCode.replace(/[^A-Z0-9]/gi, "")}-${new Date().getFullYear()}`;

  const certTitle =
    quizType === "lunas"
      ? "Certificación: Garantía y Gestión Técnica de Lunas"
      : quizType === "decir-no"
        ? "Certificación: Comunicación Asertiva y Cómo Decir NO al Cliente"
        : "Certificación: Protocolo de Recepción Segura";

  const certDesc =
    quizType === "lunas"
      ? "aprobó la ruta de formación técnica y la evaluación de criterios ópticos, materiales, tratamientos, adaptación de multifocales y dictamen de laboratorio de lunas."
      : quizType === "decir-no"
        ? "aprobó la ruta de formación en límites técnicos, técnica sandwich, desescalamiento verbal, manejo de garantías improcedentes y alternativas constructivas."
        : "aprobó la ruta de formación y la evaluación integradora del protocolo de recepción segura de armazones.";

  const brandSubtitle =
    quizType === "lunas"
      ? "GARANTÍA DE LUNAS"
      : quizType === "decir-no"
        ? "COMUNICACIÓN ASERTIVA"
        : "RECEPCIÓN SEGURA";

  return (
    <div className="modal-backdrop certificate-backdrop">
      <section
        className="certificate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-title"
      >
        <button
          className="icon-button certificate-close"
          onClick={onClose}
          aria-label="Cerrar certificado"
        >
          <X />
        </button>
        <div className="certificate-sheet">
          <div className="certificate-brand">
            <span>SAC</span>
            <small>{brandSubtitle}</small>
          </div>
          <BadgeCheck className="certificate-emblem" />
          <span className="eyebrow">CONSTANCIA DE APROBACIÓN OFICIAL</span>
          <h2 id="certificate-title">{certTitle}</h2>
          <p>Se deja constancia de que</p>
          <h3>{user.fullName}</h3>
          <p>{certDesc}</p>
          <div className="certificate-data">
            <span>
              <strong>Rol</strong>
              {user.role === "optometra"
                ? "Optómetra"
                : user.role === "admin"
                  ? "Administración"
                  : "Asesor"}
            </span>
            <span>
              <strong>Local</strong>
              {user.store}
            </span>
            <span>
              <strong>Fecha</strong>
              {date}
            </span>
          </div>
          <small className="certificate-code">Código verificable: {code}</small>
        </div>
        <div className="certificate-actions">
          <a className="secondary-action" href="/resources/formato-recepcion-sac.pdf" download>
            <Download />Formato SAC
          </a>
          <button className="primary-action" onClick={() => window.print()}>
            <Printer />Imprimir o guardar PDF
          </button>
        </div>
      </section>
    </div>
  );
}
