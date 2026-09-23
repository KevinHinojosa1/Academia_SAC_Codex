"use client";

import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  LoaderCircle,
  Medal,
  Mic,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProgressPayload, RankingRow, SacUser } from "../sac-platform";
import { jsonRequest } from "../sac-platform";
import {
  REAL_AUDIO_REGISTRY,
  type RealAudioTrack,
} from "@/lib/sac-coach-engine";
import { trainingCapsules, type TrainingCapsule } from "@/lib/sac-content";

type ReceptionRow = {
  id: string;
  receiptNumber: string;
  receivedOn: string;
  store: string;
  workOrder: string;
  advisorName: string;
  clientName: string;
  clientDocument: string;
  risk: "bajo" | "medio" | "alto";
  status: string;
  evidenceCount: number;
};

type CollaboratorItem = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  role: string;
  store: string;
  active: boolean;
  lastLoginAt: number | null;
  xp: number;
  coins: number;
  completedModules: number;
};

type AdminTab = "cursos" | "restaurar" | "colaboradores" | "voz" | "recepciones" | "metricas";

const DEFAULT_COLLABORATORS: CollaboratorItem[] = [
  {
    id: "pilot-asesor",
    employeeCode: "SAC-1001",
    fullName: "Andrea Torres",
    email: "asesor@sac.local",
    role: "asesor",
    store: "Quito Norte",
    active: true,
    lastLoginAt: null,
    xp: 240,
    coins: 45,
    completedModules: 3,
  },
  {
    id: "pilot-optometra",
    employeeCode: "SAC-2001",
    fullName: "Mateo Vega",
    email: "optometra@sac.local",
    role: "optometra",
    store: "Quito Norte",
    active: true,
    lastLoginAt: null,
    xp: 180,
    coins: 30,
    completedModules: 2,
  },
  {
    id: "pilot-admin",
    employeeCode: "SAC-ADMIN",
    fullName: "Camila Ruiz",
    email: "admin@sac.local",
    role: "admin",
    store: "Operaciones SAC",
    active: true,
    lastLoginAt: null,
    xp: 500,
    coins: 100,
    completedModules: 8,
  },
];

export default function DataCenter({
  user,
  progress,
  ranking,
  notify,
}: {
  user: SacUser;
  progress: ProgressPayload | null;
  ranking: RankingRow[];
  notify: (message: string) => void;
}) {
  const isAdmin = user.role === "admin";
  const [activeTab, setActiveTab] = useState<AdminTab>(isAdmin ? "cursos" : "metricas");

  // Recepciones state
  const [receptions, setReceptions] = useState<ReceptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(isAdmin);
  const [error, setError] = useState("");
  const [risk, setRisk] = useState("");
  const [status, setStatus] = useState("");

  // Colaboradores state
  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>(DEFAULT_COLLABORATORS);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [searchCollab, setSearchCollab] = useState("");

  // Cursos state
  const [hiddenCapsuleIds, setHiddenCapsuleIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedConfig = localStorage.getItem("sac-courses-config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as { hiddenCapsuleIds?: string[] };
        return parsed.hiddenCapsuleIds || [];
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [customCapsules, setCustomCapsules] = useState<TrainingCapsule[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedConfig = localStorage.getItem("sac-courses-config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as { customCapsules?: TrainingCapsule[] };
        return parsed.customCapsules || [];
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [addCourseModalOpen, setAddCourseModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseSubtitle, setNewCourseSubtitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseKicker, setNewCourseKicker] = useState("CÁPSULA ESPECIAL");
  const [newCourseModules, setNewCourseModules] = useState(4);

  // Restaurar progreso state
  const [resetting, setResetting] = useState(false);
  const [resetRewardsToo, setResetRewardsToo] = useState(true);
  const [selectedCollabToReset, setSelectedCollabToReset] = useState<string>("");
  const [selectedCourseToReset, setSelectedCourseToReset] = useState<string>("capsule-recepcion");
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  // Estudio de Voz Real state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<"real" | "tts">(() => {
    if (typeof window === "undefined") return "real";
    try {
      const savedVoiceMode = localStorage.getItem("sac-voice-mode");
      if (savedVoiceMode === "tts-only") return "tts";
    } catch {
      // ignore
    }
    return "real";
  });
  const [customAudios, setCustomAudios] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const audiosMap: Record<string, string> = {};
    try {
      for (const track of REAL_AUDIO_REGISTRY) {
        const savedAudio = localStorage.getItem(`sac-custom-audio-${track.id}`);
        if (savedAudio) audiosMap[track.id] = savedAudio;
      }
    } catch {
      // ignore
    }
    return audiosMap;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const saveCourseConfig = useCallback(
    (hidden: string[], custom: TrainingCapsule[]) => {
      setHiddenCapsuleIds(hidden);
      setCustomCapsules(custom);
      if (typeof window !== "undefined") {
        const state = { hiddenCapsuleIds: hidden, customCapsules: custom };
        localStorage.setItem("sac-courses-config", JSON.stringify(state));
        window.dispatchEvent(new Event("sac-courses-updated"));
      }
      // Sincronizar con API
      jsonRequest("/api/admin/courses", {
        method: "POST",
        body: JSON.stringify({
          action: "sync",
          state: { hiddenCapsuleIds: hidden, customCapsules: custom },
        }),
      }).catch(() => undefined);
    },
    [],
  );

  const loadReceptions = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (risk) params.set("risk", risk);
      if (status) params.set("status", status);
      params.set("limit", "100");
      const data = await jsonRequest<{ receptions: ReceptionRow[]; total: number }>(
        `/api/admin/receptions?${params}`,
      );
      setReceptions(data.receptions);
      setTotal(data.total);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible cargar las recepciones.");
    } finally {
      setLoading(false);
    }
  }, [risk, status, isAdmin]);

  const loadCollaborators = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingCollabs(true);
    try {
      const data = await jsonRequest<{ collaborators: CollaboratorItem[] }>(
        "/api/admin/collaborators",
      );
      setCollaborators(data.collaborators);
    } catch {
      // ignore
    } finally {
      setLoadingCollabs(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(() => {
      void loadReceptions();
      void loadCollaborators();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, loadReceptions, loadCollaborators]);

  // Manejo de Cursos
  const allCourses = useMemo(() => {
    return [...trainingCapsules, ...customCapsules];
  }, [customCapsules]);

  const toggleCourseVisibility = (capsuleId: string) => {
    const isHidden = hiddenCapsuleIds.includes(capsuleId);
    let nextHidden: string[];
    if (isHidden) {
      nextHidden = hiddenCapsuleIds.filter((id) => id !== capsuleId);
      notify("Curso publicado nuevamente en la formación.");
    } else {
      nextHidden = [...hiddenCapsuleIds, capsuleId];
      notify("Curso ocultado de la vista de formación para los alumnos.");
    }
    saveCourseConfig(nextHidden, customCapsules);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newId = `custom-capsule-${Date.now()}`;
    const generatedModuleIds = Array.from(
      { length: newCourseModules },
      (_, idx) => `${newId}-mod-${idx + 1}`,
    );

    const newCapsule: TrainingCapsule = {
      id: newId,
      order: allCourses.length + 1,
      title: newCourseTitle.trim(),
      subtitle: newCourseSubtitle.trim() || "Cápsula Especializada de Formación",
      kicker: newCourseKicker.trim().toUpperCase(),
      description:
        newCourseDesc.trim() ||
        "Contenido y protocolo operativo configurado por la administración de SAC.",
      moduleIds: generatedModuleIds,
    };

    const nextCustom = [...customCapsules, newCapsule];
    saveCourseConfig(hiddenCapsuleIds, nextCustom);
    setAddCourseModalOpen(false);
    setNewCourseTitle("");
    setNewCourseSubtitle("");
    setNewCourseDesc("");
    notify(`Curso "${newCapsule.title}" agregado con éxito.`);
  };

  const handleDeleteCustomCourse = (capsuleId: string) => {
    const nextCustom = customCapsules.filter((c) => c.id !== capsuleId);
    const nextHidden = hiddenCapsuleIds.filter((id) => id !== capsuleId);
    saveCourseConfig(nextHidden, nextCustom);
    notify("Curso eliminado del catálogo.");
  };

  const handleRestoreDefaultCourses = () => {
    saveCourseConfig([], []);
    notify("Catálogo restaurado a las cápsulas oficiales originales.");
  };

  // Manejo de Restauración / Reset de Progreso
  const executeReset = async (
    target: "all" | "collaborator" | "course",
    extra?: { collaboratorId?: string; capsuleId?: string; moduleIds?: string[] },
  ) => {
    setResetting(true);
    try {
      const payload = {
        target,
        resetRewards: resetRewardsToo,
        collaboratorId: extra?.collaboratorId,
        capsuleId: extra?.capsuleId,
        moduleIds: extra?.moduleIds,
      };
      await jsonRequest("/api/admin/progress/reset", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Disparar actualización global
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sac-progress-reset"));
      }
      await loadCollaborators();
      notify(
        target === "all"
          ? "¡Toda la plataforma ha sido restaurada en 0% exitosamente!"
          : target === "collaborator"
          ? "El progreso del colaborador ha sido restaurado a cero."
          : "El curso ha sido restaurado en cero para todos los estudiantes.",
      );
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Error al restaurar progreso.");
    } finally {
      setResetting(false);
      setConfirmModal(null);
    }
  };

  // Manejo de Audio y Voz Real
  const handlePlayAudio = (track: RealAudioTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingAudioId === track.id) {
      setPlayingAudioId(null);
      return;
    }

    const audioUrl = customAudios[track.id] || track.defaultAudioUrl;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingAudioId(track.id);

    audio.onended = () => {
      setPlayingAudioId(null);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setPlayingAudioId(null);
      audioRef.current = null;
      notify(`El archivo de audio (${audioUrl}) aún no está disponible en disco.`);
    };
    audio.play().catch(() => {
      setPlayingAudioId(null);
      notify("No fue posible reproducir el audio. Puedes cargar un archivo .mp3.");
    });
  };

  const handleUploadAudioFile = (trackId: string, file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const updated = { ...customAudios, [trackId]: fileUrl };
    setCustomAudios(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`sac-custom-audio-${trackId}`, fileUrl);
      } catch {
        // storage quota
      }
    }
    notify(`Grabación asignada a ${trackId}. Puedes probarla de inmediato.`);
  };

  const toggleVoiceModeSetting = (mode: "real" | "tts") => {
    setVoiceMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("sac-voice-mode", mode === "real" ? "real-preferred" : "tts-only");
    }
    notify(
      mode === "real"
        ? "Modo configurado: Priorizar Grabaciones de Voz Real Humana."
        : "Modo configurado: Solo Síntesis Neural (TTS).",
    );
  };

  // Toggle estado de colaborador
  const toggleCollaboratorActive = async (collab: CollaboratorItem) => {
    try {
      await jsonRequest("/api/admin/collaborators", {
        method: "PATCH",
        body: JSON.stringify({
          collaboratorId: collab.id,
          active: !collab.active,
        }),
      });
      await loadCollaborators();
      notify(`Colaborador ${collab.fullName} ahora está ${!collab.active ? "Activo" : "Inactivo"}.`);
    } catch {
      notify("No fue posible actualizar el estado del colaborador.");
    }
  };

  // Filtrado de colaboradores
  const filteredCollabs = collaborators.filter((c) => {
    const q = searchCollab.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.employeeCode.toLowerCase().includes(q) ||
      c.store.toLowerCase().includes(q)
    );
  });

  const exportQuery = new URLSearchParams();
  if (risk) exportQuery.set("risk", risk);
  if (status) exportQuery.set("status", status);

  // VISTA ESTUDIANTE (Asesor y Optómetra)
  if (!isAdmin) {
    return (
      <div className="page-stack">
        <header className="page-heading">
          <div>
            <span className="eyebrow">DATOS Y RECURSOS</span>
            <h1>Información lista para trabajar</h1>
            <p>
              Tu actividad se guarda en SAC. Los reportes pueden abrirse en Excel o importarse en
              Google Sheets.
            </p>
          </div>
          <div className="data-security">
            <ShieldCheck />
            <div>
              <strong>Persistencia real</strong>
              <span>D1 + evidencias R2</span>
            </div>
          </div>
        </header>

        <section className="download-grid">
          <article className="download-card">
            <span className="file-icon excel">
              <FileSpreadsheet />
            </span>
            <div>
              <small>LIBRO ADMINISTRATIVO</small>
              <h2>Registro SAC para Excel</h2>
              <p>
                Plantilla profesional con resumen, recepciones, formación, colaboradores,
                escalamientos, recompensas y diccionario.
              </p>
            </div>
            <a
              className="primary-action"
              href="/resources/registro-sac.xlsx"
              download
              onClick={() => notify("Descarga preparada para Excel o Google Sheets.")}
            >
              <Download />
              Descargar .xlsx
            </a>
            <span className="compatibility-note">Compatible con Excel · Importable en Sheets</span>
          </article>
          <article className="download-card">
            <span className="file-icon pdf">
              <FileText />
            </span>
            <div>
              <small>FORMATO OPERATIVO</small>
              <h2>Recepción segura SAC</h2>
              <p>
                Versión imprimible anonimizada, con campos de inspección, evidencia, nivel de riesgo
                y consentimiento informado.
              </p>
            </div>
            <a
              className="secondary-action"
              href="/resources/formato-recepcion-sac.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <FileText />
              Abrir PDF
            </a>
            <span className="compatibility-note">2 páginas · A4 · Sin datos de prueba</span>
          </article>
        </section>

        <section className="data-grid">
          <article className="surface activity-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">HISTORIAL PERSONAL</span>
                <h2>Últimas actividades</h2>
              </div>
              <span className="balance-pill">
                <Sparkles />
                {progress?.balance.xp ?? 0} XP
              </span>
            </div>
            {(progress?.recentAttempts.length ?? 0) === 0 ? (
              <EmptyState
                icon={CalendarDays}
                text="Completa un módulo o simulador para iniciar tu historial."
              />
            ) : (
              <div className="activity-list">
                {progress?.recentAttempts.slice(0, 8).map((attempt) => (
                  <div key={attempt.id}>
                    <span
                      className={
                        attempt.passed ? "activity-status passed" : "activity-status retry"
                      }
                    >
                      {attempt.passed ? <BadgeCheck /> : <RefreshCw />}
                    </span>
                    <div>
                      <strong>{activityName(attempt.activityId)}</strong>
                      <span>
                        {new Intl.DateTimeFormat("es-EC", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(attempt.completedAt * 1000))}
                      </span>
                    </div>
                    <b>
                      {attempt.score}/{attempt.maxScore}
                    </b>
                  </div>
                ))}
              </div>
            )}
          </article>
          <article className="surface ranking-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">EQUIPO SAC</span>
                <h2>Ranking verificado</h2>
              </div>
              <Medal />
            </div>
            {ranking.length === 0 ? (
              <EmptyState
                icon={Medal}
                text="El ranking aparecerá cuando el equipo gane experiencia."
              />
            ) : (
              <ol>
                {ranking.slice(0, 8).map((row) => (
                  <li
                    key={row.collaboratorId}
                    className={row.collaboratorId === user.id ? "is-you" : ""}
                  >
                    <strong>{row.position}</strong>
                    <span className="mini-avatar">{initials(row.fullName)}</span>
                    <div>
                      <b>
                        {row.fullName}
                        {row.collaboratorId === user.id ? " · Tú" : ""}
                      </b>
                      <small>
                        {row.store} · {row.completedModules} actividades
                      </small>
                    </div>
                    <span>{row.xp} XP</span>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </section>
      </div>
    );
  }

  // VISTA PANEL ADMINISTRADOR COMPLETO (LMS ADMIN)
  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN ACADÉMICA</span>
          <h1>Centro de Gestión de Academia Óptica</h1>
          <p>
            Administra cursos, publica o quita programas formativos, restaura avances en cero y
            gestiona las grabaciones de voz real.
          </p>
        </div>
        <div className="data-security">
          <ShieldCheck />
          <div>
            <strong>Modo Administrador</strong>
            <span>Camila Ruiz · Control Total</span>
          </div>
        </div>
      </header>

      {/* Pestañas de Navegación del Administrador */}
      <nav className="catalog-track-tabs lms-nav-tabs" aria-label="Secciones administrativas">
        <button
          type="button"
          className={`catalog-track-tab ${activeTab === "cursos" ? "active" : ""}`}
          onClick={() => setActiveTab("cursos")}
        >
          <GraduationCap />
          <span>Gestión de Cursos</span>
          <span className="tab-badge">{allCourses.length}</span>
        </button>

        <button
          type="button"
          className={`catalog-track-tab ${activeTab === "restaurar" ? "active" : ""}`}
          onClick={() => setActiveTab("restaurar")}
        >
          <RotateCcw />
          <span>Restaurar a Cero</span>
        </button>

        <button
          type="button"
          className={`catalog-track-tab ${activeTab === "colaboradores" ? "active" : ""}`}
          onClick={() => setActiveTab("colaboradores")}
        >
          <Users />
          <span>Alumnos y Equipo</span>
          <span className="tab-badge">{collaborators.length}</span>
        </button>

        <button
          type="button"
          className={`catalog-track-tab ${activeTab === "voz" ? "active" : ""}`}
          onClick={() => setActiveTab("voz")}
        >
          <Mic />
          <span>Estudio de Voz</span>
        </button>

        <button
          type="button"
          className={`catalog-track-tab ${activeTab === "recepciones" ? "active" : ""}`}
          onClick={() => setActiveTab("recepciones")}
        >
          <Database />
          <span>Recepciones de Tienda</span>
          <span className="tab-badge">{total}</span>
        </button>

        <button
          type="button"
          className={`catalog-track-tab ${activeTab === "metricas" ? "active" : ""}`}
          onClick={() => setActiveTab("metricas")}
        >
          <Layers />
          <span>Métricas y Descargas</span>
        </button>
      </nav>

      {/* TAB 1: GESTIÓN DE CURSOS Y CÁPSULAS */}
      {activeTab === "cursos" && (
        <section className="lms-content-stack">
          <div className="surface lms-toolbar-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">PROGRAMAS Y CÁPSULAS FORMATIVAS</span>
                <h2>Catálogo de Cursos de la Academia</h2>
                <p>
                  Publica o quita cursos para los colaboradores, crea nuevos programas o restablece los originales.
                </p>
              </div>
              <div className="table-actions">
                <button
                  type="button"
                  className="secondary-action compact"
                  onClick={handleRestoreDefaultCourses}
                  title="Restablecer catálogo por defecto"
                >
                  <RotateCcw /> Restablecer Originales
                </button>
                <button
                  type="button"
                  className="primary-action compact"
                  onClick={() => setAddCourseModalOpen(true)}
                >
                  <Plus /> Agregar Nuevo Curso
                </button>
              </div>
            </div>
          </div>

          <div className="lms-courses-grid">
            {allCourses.map((capsule) => {
              const isHidden = hiddenCapsuleIds.includes(capsule.id);
              const isCustom = customCapsules.some((c) => c.id === capsule.id);

              return (
                <article
                  key={capsule.id}
                  className={`lms-course-card ${isHidden ? "is-hidden" : ""}`}
                >
                  <div className="lms-card-top">
                    <span className="lms-kicker-tag">{capsule.kicker || "CÁPSULA FORMATIVA"}</span>
                    <span className={`status-pill ${isHidden ? "warning" : "online"}`}>
                      {isHidden ? (
                        <>
                          <EyeOff /> Oculto de alumnos
                        </>
                      ) : (
                        <>
                          <Check /> Publicado
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="lms-card-title">{capsule.title}</h3>
                    <p className="lms-card-subtitle">{capsule.subtitle}</p>
                    <p className="lms-card-desc">{capsule.description}</p>
                  </div>

                  <div className="lms-card-meta">
                    <span>
                      <BookOpen /> {capsule.moduleIds.length} módulos
                    </span>
                    <span>
                      <GraduationCap /> Asesores y Optómetras
                    </span>
                    {isCustom && <span className="lms-custom-tag">Personalizado</span>}
                  </div>

                  <div className="lms-card-actions">
                    <button
                      type="button"
                      className={`secondary-action compact ${isHidden ? "primary" : ""}`}
                      onClick={() => toggleCourseVisibility(capsule.id)}
                    >
                      {isHidden ? (
                        <>
                          <Eye /> Publicar en Formación
                        </>
                      ) : (
                        <>
                          <EyeOff /> Quitar curso (Ocultar)
                        </>
                      )}
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        className="icon-button danger compact"
                        onClick={() => handleDeleteCustomCourse(capsule.id)}
                        title="Eliminar curso personalizado"
                        aria-label="Eliminar curso personalizado"
                      >
                        <Trash2 />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: RESTAURAR EL CURSO EN CERO */}
      {activeTab === "restaurar" && (
        <section className="lms-content-stack">
          <div className="surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">REINICIO Y PERIODOS FORMATIVOS</span>
                <h2>Restaurar Cursos y Progreso en Cero</h2>
                <p>
                  Herramienta para reiniciar avances cuando comienza un nuevo periodo de formación,
                  una recertificación o para permitir que un estudiante comience desde el inicio.
                </p>
              </div>
            </div>

            <div className="lms-reset-grid">
              {/* Opción 1: Reset Masivo */}
              <div className="lms-reset-tile alert-tile">
                <div className="reset-tile-head">
                  <div className="reset-icon-badge danger">
                    <AlertTriangle />
                  </div>
                  <div>
                    <span className="eyebrow">REINICIO MASIVO</span>
                    <h3>Toda la Academia a Cero</h3>
                  </div>
                </div>
                <p>
                  Borra todos los intentos y reinicia el avance de <strong>todos los colaboradores</strong> (asesores y optómetras) al 0%. Ideal para iniciar un nuevo ciclo de certificación.
                </p>
                <label className="lms-checkbox-row">
                  <input
                    type="checkbox"
                    checked={resetRewardsToo}
                    onChange={(e) => setResetRewardsToo(e.target.checked)}
                  />
                  <span>Reiniciar también el balance de XP y Monedas a cero</span>
                </label>
                <button
                  type="button"
                  className="secondary-action danger compact"
                  disabled={resetting}
                  onClick={() =>
                    setConfirmModal({
                      open: true,
                      title: "⚠️ ¿Confirmas restaurar TODA la plataforma en cero?",
                      description:
                        "Esta acción regresará el progreso de todos los colaboradores al 0% y eliminará el historial de intentos formativos.",
                      action: () => executeReset("all"),
                    })
                  }
                >
                  <RotateCcw /> Restaurar Toda la Plataforma en 0%
                </button>
              </div>

              {/* Opción 2: Reset de un Curso Específico */}
              <div className="lms-reset-tile">
                <div className="reset-tile-head">
                  <div className="reset-icon-badge primary">
                    <GraduationCap />
                  </div>
                  <div>
                    <span className="eyebrow">POR CURSO</span>
                    <h3>Restaurar Curso a Cero</h3>
                  </div>
                </div>
                <p>
                  Reinicia los módulos y calificaciones de <strong>un solo curso</strong> para todos los estudiantes, conservando los demás cursos intactos.
                </p>
                <div className="lms-field-block">
                  <label htmlFor="course-select-reset">Selecciona el curso:</label>
                  <select
                    id="course-select-reset"
                    className="lms-native-select"
                    value={selectedCourseToReset}
                    onChange={(e) => setSelectedCourseToReset(e.target.value)}
                  >
                    {allCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.moduleIds.length} módulos)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="secondary-action compact"
                  disabled={resetting}
                  onClick={() => {
                    const c = allCourses.find((x) => x.id === selectedCourseToReset);
                    if (!c) return;
                    setConfirmModal({
                      open: true,
                      title: `¿Restaurar "${c.title}" a cero?`,
                      description: `Se reiniciará el avance y los intentos de todos los colaboradores únicamente en este curso. Los demás cursos no se verán afectados.`,
                      action: () =>
                        executeReset("course", {
                          capsuleId: c.id,
                          moduleIds: c.moduleIds,
                        }),
                    });
                  }}
                >
                  <RotateCcw /> Reiniciar Curso Seleccionado a 0%
                </button>
              </div>

              {/* Opción 3: Reset de un Colaborador Individual */}
              <div className="lms-reset-tile">
                <div className="reset-tile-head">
                  <div className="reset-icon-badge accent">
                    <Users />
                  </div>
                  <div>
                    <span className="eyebrow">POR ALUMNO</span>
                    <h3>Restaurar Alumno a Cero</h3>
                  </div>
                </div>
                <p>
                  Permite a un colaborador particular volver a rendir toda la formación desde el principio sin alterar el progreso del resto del equipo.
                </p>
                <div className="lms-field-block">
                  <label htmlFor="collab-select-reset">Selecciona el colaborador:</label>
                  <select
                    id="collab-select-reset"
                    className="lms-native-select"
                    value={selectedCollabToReset}
                    onChange={(e) => setSelectedCollabToReset(e.target.value)}
                  >
                    <option value="">-- Elige un colaborador --</option>
                    {collaborators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.employeeCode}) · {c.role}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="secondary-action compact"
                  disabled={resetting || !selectedCollabToReset}
                  onClick={() => {
                    const c = collaborators.find((x) => x.id === selectedCollabToReset);
                    if (!c) return;
                    setConfirmModal({
                      open: true,
                      title: `¿Restaurar avance de ${c.fullName}?`,
                      description: `Se reiniciará todo el progreso de ${c.fullName} (${c.employeeCode}) a cero para que pueda comenzar desde el primer módulo.`,
                      action: () =>
                        executeReset("collaborator", {
                          collaboratorId: c.id,
                        }),
                    });
                  }}
                >
                  <RotateCcw /> Restaurar Avance de este Alumno
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: GESTIÓN DE COLABORADORES */}
      {activeTab === "colaboradores" && (
        <section className="lms-content-stack">
          <div className="surface admin-table-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">DIRECTORIO DE ALUMNOS Y ROLES</span>
                <h2>Gestión de Colaboradores de Tienda</h2>
                <p>
                  Supervisa el avance de cada asesor y optómetra, administra su estado activo o
                  restablece su progreso individual.
                </p>
              </div>
              <div className="table-actions">
                <input
                  type="text"
                  className="collab-search-input"
                  placeholder="Buscar por nombre, código o tienda..."
                  value={searchCollab}
                  onChange={(e) => setSearchCollab(e.target.value)}
                />
              </div>
            </div>

            {loadingCollabs ? (
              <div className="table-loading">
                <LoaderCircle className="spin" /> Cargando directorio...
              </div>
            ) : filteredCollabs.length === 0 ? (
              <EmptyState icon={Users} text="No se encontraron colaboradores." />
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Colaborador</th>
                      <th>Código</th>
                      <th>Rol</th>
                      <th>Tienda</th>
                      <th>Módulos</th>
                      <th>Puntos</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollabs.map((collab) => (
                      <tr key={collab.id}>
                        <td>
                          <div className="collab-name-cell">
                            <span className="mini-avatar">{initials(collab.fullName)}</span>
                            <div>
                              <strong>{collab.fullName}</strong>
                              <small>{collab.email || "Sin correo"}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code>{collab.employeeCode}</code>
                        </td>
                        <td>
                          <span className={`pilot-cred-badge ${collab.role}`}>{collab.role}</span>
                        </td>
                        <td>{collab.store}</td>
                        <td>
                          <strong>{collab.completedModules}</strong>/24
                        </td>
                        <td>
                          <span>
                            {collab.xp} XP · {collab.coins} 🪙
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${collab.active ? "online" : "warning"}`}>
                            {collab.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="secondary-action compact"
                              onClick={() => toggleCollaboratorActive(collab)}
                              title={collab.active ? "Desactivar acceso" : "Activar acceso"}
                            >
                              {collab.active ? "Desactivar" : "Activar"}
                            </button>
                            <button
                              type="button"
                              className="secondary-action compact danger"
                              onClick={() =>
                                setConfirmModal({
                                  open: true,
                                  title: `¿Restaurar avance de ${collab.fullName}?`,
                                  description: `Se reiniciará el progreso de ${collab.employeeCode} a cero.`,
                                  action: () =>
                                    executeReset("collaborator", { collaboratorId: collab.id }),
                                })
                              }
                              title="Restaurar avance a 0%"
                            >
                              <RotateCcw /> A cero
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: ESTUDIO DE VOZ REAL */}
      {activeTab === "voz" && (
        <section className="lms-content-stack">
          <div className="surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SISTEMA DE AUDIO HUMANO</span>
                <h2>Estudio de Grabaciones y Voz Real de SACI</h2>
                <p>
                  Asigna y prueba archivos de audio reales grabados para que SACI y los clientes del
                  roleplay hablen con voz 100% humana.
                </p>
              </div>
              <div className="catalog-track-tabs">
                <button
                  type="button"
                  className={`catalog-track-tab ${voiceMode === "real" ? "active" : ""}`}
                  onClick={() => toggleVoiceModeSetting("real")}
                >
                  <Volume2 /> Grabaciones Humanas (Recomendado)
                </button>
                <button
                  type="button"
                  className={`catalog-track-tab ${voiceMode === "tts" ? "active" : ""}`}
                  onClick={() => toggleVoiceModeSetting("tts")}
                >
                  <VolumeX /> Síntesis TTS Fallback
                </button>
              </div>
            </div>

            <div className="voice-tip-banner">
              <Sparkles />
              <div>
                <strong>¿Cómo subir y conectar la voz verdadera?</strong>
                <span>
                  {" "}Puedes arrastrar y adjuntar tus archivos de audio (<code>.mp3</code> o <code>.wav</code>) directamente en el chat con el asistente, o usar el botón <strong>&ldquo;Subir Audio&rdquo;</strong> en cada pista de la lista.
                </span>
              </div>
            </div>

            <div className="voice-tracks-grid">
              {REAL_AUDIO_REGISTRY.map((track) => {
                const isCustom = Boolean(customAudios[track.id]);
                const isPlaying = playingAudioId === track.id;

                return (
                  <article key={track.id} className="voice-track-card">
                    <div className="voice-track-top">
                      <div>
                        <span className="voice-character-badge">
                          {track.character}
                        </span>
                        <h4>{track.label}</h4>
                      </div>
                      <span className={`status-pill ${isCustom ? "online" : "neutral"}`}>
                        {isCustom ? "Grabación Propia" : "Audio Estándar"}
                      </span>
                    </div>

                    <p className="voice-track-snippet">&ldquo;{track.textSnippet}&rdquo;</p>

                    <div className="voice-track-foot">
                      <button
                        type="button"
                        className="secondary-action compact"
                        onClick={() => handlePlayAudio(track)}
                      >
                        {isPlaying ? (
                          <>
                            <VolumeX /> Detener
                          </>
                        ) : (
                          <>
                            <Play /> Probar Audio
                          </>
                        )}
                      </button>

                      <label className="secondary-action compact file-upload-label" title="Subir archivo .mp3 o .wav">
                        <Upload /> Subir Audio
                        <input
                          type="file"
                          accept="audio/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadAudioFile(track.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: AUDITORÍA DE RECEPCIONES */}
      {activeTab === "recepciones" && (
        <section className="lms-section">
          <div className="lms-section-header">
            <div>
              <span className="eyebrow">AUDITORÍA OPERATIVA</span>
              <h2>Recepciones de Tienda ({total})</h2>
              <p>Historial trazable con inspección fisonómica, nivel de riesgo y evidencias.</p>
            </div>
            <div className="table-actions">
              <label>
                <span>Riesgo</span>
                <select value={risk} onChange={(event) => setRisk(event.target.value)}>
                  <option value="">Todos</option>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </label>
              <label>
                <span>Estado</span>
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">Todos</option>
                  <option value="completed">Completadas</option>
                  <option value="escalation_pending">Escaladas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </label>
              <button className="icon-button" onClick={loadReceptions} aria-label="Actualizar tabla">
                <RefreshCw />
              </button>
              <a
                className="primary-action compact"
                href={`/api/admin/receptions/export?${exportQuery}`}
              >
                <Download /> Exportar CSV
              </a>
            </div>
          </div>

          <div className="surface admin-table-card">
            {error && (
              <div className="form-alert error" role="alert">
                {error}
              </div>
            )}
            {loading ? (
              <div className="table-loading">
                <LoaderCircle className="spin" /> Cargando datos protegidos…
              </div>
            ) : receptions.length === 0 ? (
              <EmptyState icon={Database} text="No hay recepciones que coincidan con los filtros." />
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Local</th>
                      <th>OT</th>
                      <th>Cliente</th>
                      <th>Riesgo</th>
                      <th>Estado</th>
                      <th>Evidencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receptions.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.receiptNumber}</strong>
                        </td>
                        <td>{row.receivedOn}</td>
                        <td>{row.store}</td>
                        <td>{row.workOrder}</td>
                        <td>
                          <strong>{row.clientName}</strong>
                          <small>{maskDocument(row.clientDocument)}</small>
                        </td>
                        <td>
                          <span className={`risk-tag ${row.risk}`}>{row.risk}</span>
                        </td>
                        <td>
                          {row.status === "escalation_pending"
                            ? "Escalamiento pendiente"
                            : row.status === "completed"
                            ? "Completada"
                            : "Cancelada"}
                        </td>
                        <td>{row.evidenceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 6: MÉTRICAS Y DESCARGAS */}
      {activeTab === "metricas" && (
        <section className="lms-section">
          <div className="lms-section-header">
            <div>
              <span className="eyebrow">RECURSOS Y DOCUMENTACIÓN</span>
              <h2>Archivos y Modelos Descargables</h2>
              <p>Plantillas administrativas y formatos anonimizados para operaciones en óptica.</p>
            </div>
          </div>

          <div className="download-grid">
            <article className="download-card">
              <span className="file-icon excel">
                <FileSpreadsheet />
              </span>
              <div>
                <small>LIBRO ADMINISTRATIVO</small>
                <h2>Registro SAC para Excel</h2>
                <p>
                  Plantilla profesional con resumen, recepciones, formación, colaboradores,
                  escalamientos, recompensas y diccionario.
                </p>
              </div>
              <a
                className="primary-action"
                href="/resources/registro-sac.xlsx"
                download
                onClick={() => notify("Descarga preparada para Excel o Google Sheets.")}
              >
                <Download /> Descargar .xlsx
              </a>
              <span className="compatibility-note">
                Compatible con Excel · Importable en Google Sheets
              </span>
            </article>

            <article className="download-card">
              <span className="file-icon pdf">
                <FileText />
              </span>
              <div>
                <small>FORMATO OPERATIVO</small>
                <h2>Recepción segura SAC</h2>
                <p>
                  Versión imprimible anonimizada, con campos de inspección, evidencia, nivel de
                  riesgo y consentimiento informado.
                </p>
              </div>
              <a
                className="secondary-action"
                href="/resources/formato-recepcion-sac.pdf"
                target="_blank"
                rel="noreferrer"
              >
                <FileText /> Abrir PDF
              </a>
              <span className="compatibility-note">2 páginas · A4 · Sin datos de prueba</span>
            </article>
          </div>
        </section>
      )}

      {/* MODAL: AGREGAR NUEVO CURSO */}
      {addCourseModalOpen && (
        <div
          className="avatar-modal-backdrop"
          onClick={() => setAddCourseModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="add-course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-course-modal-head">
              <div>
                <span className="eyebrow">NUEVO PROGRAMA FORMATIVO</span>
                <h2>Crear Curso o Cápsula</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAddCourseModalOpen(false)}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="add-course-form">
              <label>
                Título del Curso / Cápsula:
                <input
                  type="text"
                  required
                  placeholder="Ej. Manejo de Presbicia y Lunas Progresivas"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                />
              </label>

              <label>
                Subtítulo o Enfoque:
                <input
                  type="text"
                  placeholder="Ej. Protocolos de Refracción, Ajuste y Asesoría Técnica"
                  value={newCourseSubtitle}
                  onChange={(e) => setNewCourseSubtitle(e.target.value)}
                />
              </label>

              <div className="form-row-two">
                <label>
                  Etiqueta / Kicker:
                  <input
                    type="text"
                    value={newCourseKicker}
                    onChange={(e) => setNewCourseKicker(e.target.value)}
                  />
                </label>
                <label>
                  Número de Módulos:
                  <select
                    value={newCourseModules}
                    onChange={(e) => setNewCourseModules(Number(e.target.value))}
                  >
                    <option value={4}>4 Módulos (Cápsula Express)</option>
                    <option value={8}>8 Módulos (Cápsula Completa)</option>
                    <option value={10}>10 Módulos (Programa Extenso)</option>
                  </select>
                </label>
              </div>

              <label>
                Descripción y Objetivo Académico:
                <textarea
                  rows={3}
                  placeholder="Explica a los colaboradores qué aprenderán en este curso..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                />
              </label>

              <div className="add-course-modal-foot">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setAddCourseModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-action">
                  <Plus /> Crear y Publicar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal?.open && (
        <div className="avatar-modal-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon warning">
              <AlertTriangle />
            </div>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.description}</p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => setConfirmModal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="primary-action danger"
                disabled={resetting}
                onClick={confirmModal.action}
              >
                {resetting ? <LoaderCircle className="spin" /> : <RotateCcw />}
                {resetting ? "Restaurando…" : "Sí, Restaurar a Cero"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Database; text: string }) {
  return (
    <div className="empty-state">
      <Icon />
      <p>{text}</p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function maskDocument(value: string) {
  return value.length < 5 ? "••••" : `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

function activityName(id: string) {
  if (id.startsWith("module-")) return `Módulo ${id.replace("module-", "")}`;
  const names: Record<string, string> = {
    "quiz-final": "Evaluación final",
    "risk-lab": "Laboratorio de riesgo",
    "trivia-sprint": "Trivia Sprint",
    "protocol-order": "Ordena el protocolo",
    "visual-findings": "Detective visual",
    "conversation-sim": "Conversaciones difíciles",
    "checklist-timed": "Checklist contrarreloj",
  };
  return names[id] ?? id;
}
