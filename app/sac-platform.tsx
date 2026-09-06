"use client";

import {
  BadgeCheck,
  Bot,
  ChevronRight,
  ClipboardPlus,
  Coins,
  Database,
  Gamepad2,
  GraduationCap,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReceptionWorkflow from "./components/reception-workflow";
import TrainingExperience from "./components/training-experience";
import GameCenter from "./components/game-center";
import DataCenter from "./components/data-center";
import SacCoach from "./components/sac-coach";
import { sacModules } from "@/lib/sac-content";

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
        result.attempt.passed
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
        <div className="sac-logo-mark">SAC</div>
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
          <div className="sac-logo-mark">SAC</div>
          <div><strong>Recepción segura</strong><span>Formar · practicar · registrar</span></div>
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
          <span className="sac-avatar">{user.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <div><strong>{user.fullName}</strong><span>{roleLabel(user.role)} · {user.store}</span></div>
          <button className="icon-button" onClick={logout} aria-label="Cerrar sesión"><LogOut /></button>
        </div>
      </aside>

      {menuOpen && <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />}

      <div className="sac-main-shell">
        <header className="sac-topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Menu /></button>
          <div className="topbar-title"><span>SAC</span><strong>{navItems.find((item) => item.id === view)?.label}</strong></div>
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
        <Bot aria-hidden="true" /><span>Pregúntale a SACI</span>
      </button>
      <SacCoach open={coachOpen} onClose={() => setCoachOpen(false)} />
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

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand"><div className="sac-logo-mark">SAC</div><span>Recepción segura</span></div>
        <div className="login-copy">
          <span className="eyebrow">EXPERIENCIA OPERATIVA · 2026</span>
          <h1>Más claridad en cada recepción. Más confianza en cada decisión.</h1>
          <p>Aprende el protocolo, practica con casos reales y registra cada recepción con evidencia trazable.</p>
          <div className="login-benefits">
            <span><Play />3 microclases con subtítulos</span>
            <span><Gamepad2 />6 simuladores interactivos</span>
            <span><ShieldCheck />Datos y evidencias protegidos</span>
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
          <h1>Una recepción excelente empieza por mirar juntos.</h1>
          <p>Observa, explica y registra. SAC convierte cada paso en confianza verificable.</p>
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
