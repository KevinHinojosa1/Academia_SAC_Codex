"use client";

import {
  BadgeCheck,
  Check,
  ChevronRight,
  ClipboardPlus,
  Coins,
  Database,
  Eye,
  Gamepad2,
  Glasses,
  GraduationCap,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  Mic,
  Moon,
  Palette,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReceptionWorkflow from "./components/reception-workflow";
import TrainingExperience from "./components/training-experience";
import GameCenter from "./components/game-center";
import DataCenter from "./components/data-center";
import SacCoach from "./components/sac-coach";
import SaciAvatar from "./components/saci-avatar";
import { sacModules } from "@/lib/sac-content";

type AvatarOption = {
  id: string;
  label: string;
  subtitle: string;
  category: "saci" | "especialidad" | "color";
  image?: string;
  icon?: typeof Glasses;
  gradient?: string;
  color?: string;
};

const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "saci-mascot",
    label: "SACI Mascota",
    subtitle: "El Coach de Servicio SAC",
    category: "saci",
    image: "/media/saci-mascota.png",
  },
  {
    id: "asesor-glasses",
    label: "Asesor / Asesora Óptica",
    subtitle: "Atención al cliente y vitrina",
    category: "especialidad",
    icon: Glasses,
    gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)",
    color: "#ffffff",
  },
  {
    id: "optometra-eye",
    label: "Optometría Clínica",
    subtitle: "Gabinete y refracción",
    category: "especialidad",
    icon: Eye,
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    color: "#ffffff",
  },
  {
    id: "taller-wrench",
    label: "Taller & Montaje",
    subtitle: "Biselado, ajustes y laboratorio",
    category: "especialidad",
    icon: Wrench,
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#ffffff",
  },
  {
    id: "initials-mint",
    label: "Menta SAC (Original)",
    subtitle: "Tus iniciales corporativas",
    category: "color",
    gradient: "linear-gradient(135deg, #dded91, #71d8c5)",
    color: "#17434a",
  },
  {
    id: "initials-sapphire",
    label: "Zafiro Profundo",
    subtitle: "Iniciales en azul océano",
    category: "color",
    gradient: "linear-gradient(135deg, #38bdf8, #0369a1)",
    color: "#ffffff",
  },
  {
    id: "initials-gold",
    label: "Oro SAC Premium",
    subtitle: "Iniciales en ámbar dorado",
    category: "color",
    gradient: "linear-gradient(135deg, #fde047, #ca8a04)",
    color: "#422006",
  },
  {
    id: "initials-amethyst",
    label: "Amatista & Púrpura",
    subtitle: "Iniciales en violeta real",
    category: "color",
    gradient: "linear-gradient(135deg, #c084fc, #7e22ce)",
    color: "#ffffff",
  },
  {
    id: "initials-coral",
    label: "Coral Energético",
    subtitle: "Iniciales en rubí y coral",
    category: "color",
    gradient: "linear-gradient(135deg, #fb7185, #e11d48)",
    color: "#ffffff",
  },
];

function renderUserAvatar(avatarId: string, user: SacUser) {
  const opt = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[4];
  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (opt.image) {
    return (
      <span className="sac-avatar sac-avatar-img">
        <Image src={opt.image} alt={user.fullName} width={40} height={40} className="avatar-inner-img" />
      </span>
    );
  }

  if (opt.icon) {
    const IconComp = opt.icon;
    return (
      <span
        className="sac-avatar sac-avatar-icon"
        style={{ background: opt.gradient, color: opt.color }}
      >
        <IconComp aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className="sac-avatar sac-avatar-text"
      style={{ background: opt.gradient, color: opt.color }}
    >
      {initials}
    </span>
  );
}

export type SacUser = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  role: "asesor" | "optometra" | "admin";
  store: string;
};

export type ProgressRow = {
  collaboratorId: string;
  moduleId: string;
  contentVersion: string;
  status: "in_progress" | "completed";
  bestScore: number;
  maxScore: number;
  attemptsCount: number;
  completedAt: number | null;
  updatedAt: number;
};

export type AttemptRow = {
  id: string;
  activityId: string;
  moduleId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  completedAt: number;
};

export type ProgressPayload = {
  user: SacUser;
  balance: { xp: number; coins: number };
  modules: ProgressRow[];
  recentAttempts: AttemptRow[];
};

export type RankingRow = {
  position: number;
  collaboratorId: string;
  employeeCode: string;
  fullName: string;
  role: string;
  store: string;
  xp: number;
  coins: number;
  completedModules: number;
};

export type CompletionResult = {
  idempotent: boolean;
  attempt: AttemptRow & { contentVersion: string };
  balance: { xp: number; coins: number };
};

type View = "inicio" | "formacion" | "simuladores" | "recepcion" | "datos";

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
    headers: init?.body instanceof FormData
      ? init.headers
      : { "content-type": "application/json", ...init?.headers },
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
  } & T;
  if (!response.ok) throw new Error(data.error?.message || "No fue posible completar la operación.");
  return data;
}

const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "formacion", label: "Formación", icon: GraduationCap },
  { id: "simuladores", label: "Simuladores", icon: Gamepad2 },
  { id: "recepcion", label: "Nueva recepción", icon: ClipboardPlus },
  { id: "datos", label: "Datos", icon: Database },
];

export default function SacPlatform() {
  const [user, setUser] = useState<SacUser | null>(null);
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [view, setView] = useState<View>("inicio");
  const [checking, setChecking] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const loadProgress = useCallback(async () => {
    const [progressData, rankingData] = await Promise.all([
      jsonRequest<ProgressPayload>("/api/progress"),
      jsonRequest<{ ranking: RankingRow[] }>("/api/ranking?limit=10"),
    ]);
    setProgress(progressData);
    setRanking(rankingData.ranking);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sac-theme");
    const initialTheme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = initialTheme;
    const themeFrame = window.requestAnimationFrame(() => setTheme(initialTheme));
    jsonRequest<{ authenticated: boolean; user: SacUser | null }>("/api/session")
      .then(async (session) => {
        if (session.authenticated && session.user) {
          setUser(session.user);
          await loadProgress();
        }
      })
      .catch(() => undefined)
      .finally(() => setChecking(false));
    return () => window.cancelAnimationFrame(themeFrame);
  }, [loadProgress]);

  const customAvatar = useMemo(() => {
    if (selectedAvatarId) return selectedAvatarId;
    if (typeof window !== "undefined" && user) {
      const saved = window.localStorage.getItem(`sac-avatar-${user.id}`);
      if (saved) return saved;
    }
    if (user?.role === "optometra") return "optometra-eye";
    if (user?.role === "admin") return "saci-mascot";
    return "initials-mint";
  }, [selectedAvatarId, user]);

  const selectAvatar = (id: string) => {
    setSelectedAvatarId(id);
    if (user && typeof window !== "undefined") {
      window.localStorage.setItem(`sac-avatar-${user.id}`, id);
    }
    setAvatarModalOpen(false);
    notify("Avatar actualizado.");
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("sac-theme", next);
  };

  const login = async (employeeCode: string, pin: string) => {
    const result = await jsonRequest<{ user: SacUser }>("/api/session", {
      method: "POST",
      body: JSON.stringify({ employeeCode, pin }),
    });
    setUser(result.user);
    await loadProgress();
  };

  const logout = async () => {
    await jsonRequest<{ authenticated: false }>("/api/session", { method: "DELETE" });
    setUser(null);
    setProgress(null);
    setRanking([]);
    setView("inicio");
  };

  const submitActivity = useCallback(
    async (activityId: string, answers?: Array<number | string>) => {
      const result = await jsonRequest<CompletionResult>("/api/progress/complete", {
        method: "POST",
        body: JSON.stringify({
          activityId,
          answers,
          idempotencyKey: `${activityId}:${crypto.randomUUID()}`,
        }),
      });
      await loadProgress();
      notify(
        activityId.startsWith("module-") && result.attempt.passed
          ? "Experiencia formativa completada y guardada."
          : result.attempt.passed
          ? `Actividad completada: ${result.attempt.score}/${result.attempt.maxScore}.`
          : `Resultado registrado: ${result.attempt.score}/${result.attempt.maxScore}.`,
      );
      return result;
    },
    [loadProgress, notify],
  );

  const completedModules = useMemo(() => {
    const completed = new Set<string>();
    for (const row of progress?.modules ?? []) {
      if (row.status === "completed") completed.add(row.moduleId);
    }
    return completed;
  }, [progress]);

  const completedCount = sacModules.filter(
    (module) => completedModules.has(module.id) || completedModules.has(String(module.order)),
  ).length;
  const certified = completedModules.has("certificacion");
  const ownRank = ranking.find((row) => row.collaboratorId === user?.id)?.position ?? "—";

  if (checking) {
    return (
      <main className="sac-loading" aria-live="polite">
        <div className="sac-loading-lockup">
          <SaciAvatar className="sac-loading-mascot" priority />
          <strong>SAC</strong>
        </div>
        <LoaderCircle className="spin" aria-hidden="true" />
        <p>Preparando tu experiencia segura…</p>
      </main>
    );
  }

  if (!user) return <LoginScreen onLogin={login} />;

  const changeView = (next: View) => {
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="sac-app">
      <a className="skip-link" href="#contenido-principal">Saltar al contenido</a>
      <aside className={`sac-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Navegación principal">
        <div className="sac-brand">
          <SaciAvatar className="sac-brand-mascot" />
          <div><strong>SAC te dice</strong><span>Escuela de Excelencia Óptica</span></div>
          <button className="icon-button sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X /></button>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                className={view === item.id ? "active" : ""}
                aria-current={view === item.id ? "page" : undefined}
                onClick={() => changeView(item.id)}
              >
                <Icon aria-hidden="true" /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sac-side-note">
          <ShieldCheck aria-hidden="true" />
          <div><strong>Protocolo SAC</strong><span>Versión 2026.1</span></div>
        </div>
        <div className="sac-user-card">
          <button
            type="button"
            className="sac-avatar-trigger"
            onClick={() => setAvatarModalOpen(true)}
            title="Personalizar avatar (clic para cambiar)"
            aria-label="Personalizar avatar"
          >
            {renderUserAvatar(customAvatar, user)}
            <span className="avatar-edit-badge" aria-hidden="true">✎</span>
          </button>
          <div><strong>{user.fullName}</strong><span>{roleLabel(user.role)} · {user.store}</span></div>
          <button className="icon-button" onClick={logout} aria-label="Cerrar sesión"><LogOut /></button>
        </div>
      </aside>

      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />}

      <div className="sac-main-shell">
        <header className="sac-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Menu /></button>
          <div className="topbar-title"><span>SAC te dice</span><strong>{navItems.find((item) => item.id === view)?.label}</strong></div>
          <div className="topbar-actions">
            <div className="status-chip"><Coins aria-hidden="true" /><strong>{progress?.balance.coins ?? 0}</strong><span>monedas</span></div>
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}>
              {theme === "light" ? <Moon /> : <Sun />}
            </button>
          </div>
        </header>

        <main id="contenido-principal" className="sac-content" tabIndex={-1}>
          {view === "inicio" && (
            <HomeView
              user={user}
              progress={progress}
              completedCount={completedCount}
              certified={certified}
              ownRank={ownRank}
              onNavigate={changeView}
            />
          )}
          {view === "formacion" && (
            <TrainingExperience
              completedModules={completedModules}
              certified={certified}
              user={user}
              onComplete={submitActivity}
            />
          )}
          {view === "simuladores" && <GameCenter onComplete={submitActivity} />}
          {view === "recepcion" && (
            <ReceptionWorkflow
              user={user}
              onSaved={() => {
                notify("Recepción y evidencias guardadas correctamente.");
                if (user.role === "admin") changeView("datos");
              }}
            />
          )}
          {view === "datos" && (
            <DataCenter user={user} progress={progress} ranking={ranking} notify={notify} />
          )}
        </main>
      </div>

      <button className="coach-launcher" onClick={() => setCoachOpen(true)} aria-label="Abrir asistente SACI">
        <SaciAvatar className="coach-launcher-avatar" alt="" />
        <span className="coach-launcher-copy"><strong>Pregúntale a SACI</strong><small>Coach de servicio al cliente</small></span>
        <span className="coach-launcher-voice-badge" title="Voz y Roleplay interactivo"><Mic /></span>
      </button>
      <SacCoach
        open={coachOpen}
        onClose={() => setCoachOpen(false)}
        user={user}
        onRewardXp={(xp, reason) => notify(`¡+${xp} XP otorgados por el Coach SACI! ${reason}`)}
      />
      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatarId={customAvatar}
        onSelect={selectAvatar}
        user={user}
      />
      <div className="toast-region" aria-live="polite" aria-atomic="true">{toast && <div className="sac-toast"><BadgeCheck />{toast}</div>}</div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (code: string, pin: string) => Promise<void> }) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onLogin(employeeCode, pin);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible iniciar sesión.");
    } finally {
      setBusy(false);
    }
  };

  const quickFill = (code: string, userPin: string) => {
    setEmployeeCode(code);
    setPin(userPin);
    setError("");
  };

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <SaciAvatar className="login-brand-mascot" priority />
          <span><strong>SAC te dice</strong><small>Escuela de Excelencia Óptica</small></span>
        </div>
        <div className="login-copy">
          <span className="eyebrow">EXPERIENCIA OPERATIVA · 2026</span>
          <h1>Más claridad en cada recepción. Más confianza en cada decisión.</h1>
          <p>Aprende el protocolo, practica con casos reales y registra cada recepción con evidencia trazable.</p>
          <div className="login-benefits">
            <span><Play />3 microclases con subtítulos</span>
            <span><Gamepad2 />6 simuladores interactivos</span>
            <span><ShieldCheck />Datos y evidencias protegidos</span>
          </div>
          <div className="login-mascot-card">
            <SaciAvatar className="login-mascot-portrait" alt="" />
            <div><span>TU COACH DE SERVICIO</span><strong>SACI</strong><p>Te acompaña con respuestas, práctica y criterios del protocolo SAC.</p></div>
          </div>
        </div>
        <p className="login-foot">SAC · Óptica Los Andes</p>
      </section>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <span className="eyebrow">ACCESO AL EQUIPO</span>
          <h2 id="login-title">Bienvenido a SAC</h2>
          <p>Ingresa con tu código de colaborador y PIN de cuatro dígitos.</p>
          <form onSubmit={submit}>
            <label>Código de colaborador<input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())} autoComplete="username" placeholder="SAC-1001" required minLength={4} /></label>
            <label>PIN<input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} autoComplete="current-password" inputMode="numeric" type="password" placeholder="••••" required pattern="[0-9]{4}" /></label>
            {error && <div className="form-alert error" role="alert">{error}</div>}
            <button className="primary-action" type="submit" disabled={busy}>
              {busy ? <LoaderCircle className="spin" /> : <ShieldCheck />}{busy ? "Verificando…" : "Ingresar de forma segura"}
            </button>
          </form>

          <div className="pilot-credentials-card">
            <div className="pilot-cred-header">
              <span className="eyebrow">ACCESOS PILOTO · ROLES OFICIALES</span>
              <h3>Credenciales del Equipo</h3>
            </div>
            <p className="pilot-cred-desc">Haz clic para autocompletar el código y PIN de prueba:</p>
            <div className="pilot-cred-grid">
              <button
                type="button"
                className={`pilot-cred-btn ${employeeCode === "SAC-ADMIN" ? "is-selected" : ""}`}
                onClick={() => quickFill("SAC-ADMIN", "2026")}
              >
                <span className="pilot-cred-badge admin">Administración</span>
                <strong>Camila Ruiz</strong>
                <code>SAC-ADMIN · PIN 2026</code>
                <small>Acceso completo: Centro de datos, descargas Excel y métricas</small>
              </button>

              <button
                type="button"
                className={`pilot-cred-btn ${employeeCode === "SAC-1001" ? "is-selected" : ""}`}
                onClick={() => quickFill("SAC-1001", "2468")}
              >
                <span className="pilot-cred-badge asesor">Asesor</span>
                <strong>Andrea Torres</strong>
                <code>SAC-1001 · PIN 2468</code>
                <small>Quito Norte · Formación 3 cápsulas, simuladores y recepción</small>
              </button>

              <button
                type="button"
                className={`pilot-cred-btn ${employeeCode === "SAC-2001" ? "is-selected" : ""}`}
                onClick={() => quickFill("SAC-2001", "1357")}
              >
                <span className="pilot-cred-badge optometra">Optómetra</span>
                <strong>Mateo Vega</strong>
                <code>SAC-2001 · PIN 1357</code>
                <small>Quito Norte · Dictamen técnico de lunas y validaciones</small>
              </button>
            </div>
          </div>

          <details className="pilot-access">
            <summary>¿Necesitas acceso?</summary>
            <div>
              <p>Solicita a la administración de SAC tu código personal y un PIN único.</p>
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

function AvatarModal({
  open,
  onClose,
  currentAvatarId,
  onSelect,
  user,
}: {
  open: boolean;
  onClose: () => void;
  currentAvatarId: string;
  onSelect: (id: string) => void;
  user: SacUser;
}) {
  if (!open) return null;

  return (
    <div
      className="avatar-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
    >
      <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal-head">
          <div>
            <span className="eyebrow">
              <Palette style={{ width: 12, height: 12, display: "inline-block", marginRight: 4 }} />
              PERSONALIZACIÓN
            </span>
            <h2 id="avatar-modal-title">Elige tu Avatar SAC</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar selección de avatar">
            <X />
          </button>
        </div>
        <p className="avatar-modal-desc">
          Selecciona cómo deseas que aparezca tu perfil en la barra lateral y en tus interacciones de la plataforma:
        </p>
        <div className="avatar-options-grid">
          {AVATAR_OPTIONS.map((opt) => {
            const isSelected = opt.id === currentAvatarId;
            return (
              <button
                type="button"
                key={opt.id}
                className={`avatar-option-card ${isSelected ? "is-selected" : ""}`}
                onClick={() => onSelect(opt.id)}
              >
                <div className="avatar-preview-slot">
                  {renderUserAvatar(opt.id, user)}
                  {isSelected && (
                    <span className="avatar-selected-check" aria-hidden="true">
                      <Check />
                    </span>
                  )}
                </div>
                <div className="avatar-option-info">
                  <strong>{opt.label}</strong>
                  <small>{opt.subtitle}</small>
                </div>
              </button>
            );
          })}
        </div>
        <div className="avatar-modal-foot">
          <button type="button" className="secondary-action" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeView({
  user,
  progress,
  completedCount,
  certified,
  ownRank,
  onNavigate,
}: {
  user: SacUser;
  progress: ProgressPayload | null;
  completedCount: number;
  certified: boolean;
  ownRank: number | string;
  onNavigate: (view: View) => void;
}) {
  const percent = Math.round((completedCount / sacModules.length) * 100);
  const nextModule = sacModules.find((module) => {
    const ids = new Set((progress?.modules ?? []).filter((row) => row.status === "completed").map((row) => row.moduleId));
    return !ids.has(module.id) && !ids.has(String(module.order));
  });
  return (
    <div className="page-stack">
      <section className="hero-card">
        <Image src="/media/sac-hero-recepcion.png" alt="Asesora revisando un armazón con una cliente" fill priority sizes="(max-width: 900px) 100vw, 80vw" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">TU TURNO, {user.fullName.split(" ")[0].toUpperCase()}</span>
          <h1>Excelencia, criterio y confianza en cada atención.</h1>
          <p>Domina el Protocolo de Recepción, la Garantía de Lunas y el Manejo Asertivo de Objeciones con SAC.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => onNavigate(nextModule ? "formacion" : "recepcion")}>
              <Play />{nextModule ? `Continuar: módulo ${nextModule.order}` : "Crear una recepción"}
            </button>
            <button className="secondary-action light" onClick={() => onNavigate("simuladores")}><Gamepad2 />Practicar ahora</button>
          </div>
        </div>
      </section>

      <section className="metric-grid" aria-label="Resumen personal">
        <article className="metric-card"><span className="metric-icon mint"><GraduationCap /></span><div><small>FORMACIÓN</small><strong>{completedCount}/{sacModules.length}</strong><span>módulos completados</span></div></article>
        <article className="metric-card"><span className="metric-icon blue"><Sparkles /></span><div><small>EXPERIENCIA</small><strong>{progress?.balance.xp ?? 0} XP</strong><span>progreso verificado</span></div></article>
        <article className="metric-card"><span className="metric-icon gold"><Trophy /></span><div><small>POSICIÓN</small><strong>#{ownRank}</strong><span>ranking del equipo</span></div></article>
        <article className="metric-card"><span className="metric-icon coral"><BadgeCheck /></span><div><small>ESTADO</small><strong>{certified ? "Certificado" : `${percent}%`}</strong><span>{certified ? "evaluación aprobada" : "ruta completada"}</span></div></article>
      </section>

      <section className="home-grid">
        <article className="surface progress-card">
          <div className="section-heading"><div><span className="eyebrow">RUTA PERSONAL</span><h2>Tu siguiente mejor paso</h2></div><button className="text-action" onClick={() => onNavigate("formacion")}>Ver formación <ChevronRight /></button></div>
          <div className="progress-summary">
            <div className="progress-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}><strong>{percent}%</strong><span>completado</span></div>
            <div><h3>{nextModule ? nextModule.title : "Ruta formativa completada"}</h3><p>{nextModule ? nextModule.summary : "Ya puedes presentar o revisar tu evaluación final."}</p><div className="linear-progress"><span style={{ width: `${percent}%` }} /></div><small>{completedCount} de {sacModules.length} módulos</small></div>
          </div>
        </article>
        <article className="surface protocol-card">
          <span className="eyebrow">MÉTODO SAC</span><h2>Cuatro gestos que cuidan</h2>
          <ol><li><strong>1</strong><span>Revisar</span></li><li><strong>2</strong><span>Informar</span></li><li><strong>3</strong><span>Registrar</span></li><li><strong>4</strong><span>Confirmar</span></li></ol>
          <button className="secondary-action" onClick={() => onNavigate("recepcion")}><ClipboardPlus />Abrir ficha digital</button>
        </article>
      </section>
    </div>
  );
}

function roleLabel(role: SacUser["role"]) {
  if (role === "optometra") return "Optómetra";
  if (role === "admin") return "Administración";
  return "Asesor";
}

export { jsonRequest, roleLabel };
