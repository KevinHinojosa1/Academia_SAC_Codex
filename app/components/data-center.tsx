"use client";

import {
  BadgeCheck,
  CalendarDays,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  Medal,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ProgressPayload, RankingRow, SacUser } from "../sac-platform";
import { jsonRequest } from "../sac-platform";

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

export default function DataCenter({ user, progress, ranking, notify }: { user: SacUser; progress: ProgressPayload | null; ranking: RankingRow[]; notify: (message: string) => void }) {
  const [receptions, setReceptions] = useState<ReceptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(user.role === "admin");
  const [error, setError] = useState("");
  const [risk, setRisk] = useState("");
  const [status, setStatus] = useState("");

  const query = new URLSearchParams();
  if (risk) query.set("risk", risk);
  if (status) query.set("status", status);
  query.set("limit", "100");

  const loadReceptions = useCallback(async () => {
    if (user.role !== "admin") return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (risk) params.set("risk", risk);
      if (status) params.set("status", status);
      params.set("limit", "100");
      const data = await jsonRequest<{ receptions: ReceptionRow[]; total: number }>(`/api/admin/receptions?${params}`);
      setReceptions(data.receptions); setTotal(data.total);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible cargar las recepciones."); }
    finally { setLoading(false); }
  }, [risk, status, user.role]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReceptions(), 0);
    return () => window.clearTimeout(timer);
  }, [loadReceptions]);

  const exportQuery = new URLSearchParams();
  if (risk) exportQuery.set("risk", risk);
  if (status) exportQuery.set("status", status);

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">DATOS Y RECURSOS</span><h1>Información lista para trabajar</h1><p>Tu actividad se guarda en SAC. Los reportes pueden abrirse en Excel o importarse en Google Sheets.</p></div><div className="data-security"><ShieldCheck /><div><strong>Persistencia real</strong><span>D1 + evidencias R2</span></div></div></header>

      <section className="download-grid">
        <article className="download-card"><span className="file-icon excel"><FileSpreadsheet /></span><div><small>LIBRO ADMINISTRATIVO</small><h2>Registro SAC para Excel</h2><p>Plantilla profesional con resumen, recepciones, formación, colaboradores, escalamientos, recompensas y diccionario.</p></div><a className="primary-action" href="/resources/registro-sac.xlsx" download onClick={() => notify("Descarga preparada para Excel o Google Sheets.")}><Download />Descargar .xlsx</a><span className="compatibility-note">Compatible con Excel · Importable en Google Sheets</span></article>
        <article className="download-card"><span className="file-icon pdf"><FileText /></span><div><small>FORMATO OPERATIVO</small><h2>Recepción segura SAC</h2><p>Versión imprimible anonimizada, con campos de inspección, evidencia, nivel de riesgo y consentimiento informado.</p></div><a className="secondary-action" href="/resources/formato-recepcion-sac.pdf" target="_blank" rel="noreferrer"><FileText />Abrir PDF</a><span className="compatibility-note">2 páginas · A4 · Sin datos de prueba</span></article>
      </section>

      <section className="data-grid">
        <article className="surface activity-card"><div className="section-heading"><div><span className="eyebrow">HISTORIAL PERSONAL</span><h2>Últimas actividades</h2></div><span className="balance-pill"><Sparkles />{progress?.balance.xp ?? 0} XP</span></div>{(progress?.recentAttempts.length ?? 0) === 0 ? <EmptyState icon={CalendarDays} text="Completa un módulo o simulador para iniciar tu historial." /> : <div className="activity-list">{progress?.recentAttempts.slice(0, 8).map((attempt) => <div key={attempt.id}><span className={attempt.passed ? "activity-status passed" : "activity-status retry"}>{attempt.passed ? <BadgeCheck /> : <RefreshCw />}</span><div><strong>{activityName(attempt.activityId)}</strong><span>{new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(attempt.completedAt * 1000))}</span></div><b>{attempt.score}/{attempt.maxScore}</b></div>)}</div>}</article>
        <article className="surface ranking-card"><div className="section-heading"><div><span className="eyebrow">EQUIPO SAC</span><h2>Ranking verificado</h2></div><Medal /></div>{ranking.length === 0 ? <EmptyState icon={Medal} text="El ranking aparecerá cuando el equipo gane experiencia." /> : <ol>{ranking.slice(0, 8).map((row) => <li key={row.collaboratorId} className={row.collaboratorId === user.id ? "is-you" : ""}><strong>{row.position}</strong><span className="mini-avatar">{initials(row.fullName)}</span><div><b>{row.fullName}{row.collaboratorId === user.id ? " · Tú" : ""}</b><small>{row.store} · {row.completedModules} actividades</small></div><span>{row.xp} XP</span></li>)}</ol>}</article>
      </section>

      {user.role === "admin" && <section className="surface admin-table-card"><div className="section-heading"><div><span className="eyebrow">CONTROL ADMINISTRATIVO</span><h2>Recepciones guardadas <small>{total}</small></h2></div><div className="table-actions"><label><span>Riesgo</span><select value={risk} onChange={(event) => setRisk(event.target.value)}><option value="">Todos</option><option value="bajo">Bajo</option><option value="medio">Medio</option><option value="alto">Alto</option></select></label><label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos</option><option value="completed">Completadas</option><option value="escalation_pending">Escaladas</option><option value="cancelled">Canceladas</option></select></label><button className="icon-button" onClick={loadReceptions} aria-label="Actualizar tabla"><RefreshCw /></button><a className="primary-action compact" href={`/api/admin/receptions/export?${exportQuery}`}><Download />Exportar CSV</a></div></div>{error && <div className="form-alert error" role="alert">{error}</div>}{loading ? <div className="table-loading"><LoaderCircle className="spin" />Cargando datos protegidos…</div> : receptions.length === 0 ? <EmptyState icon={Database} text="No hay recepciones que coincidan con los filtros." /> : <div className="table-scroll"><table><thead><tr><th>Número</th><th>Fecha</th><th>Local</th><th>OT</th><th>Cliente</th><th>Riesgo</th><th>Estado</th><th>Evidencias</th></tr></thead><tbody>{receptions.map((row) => <tr key={row.id}><td><strong>{row.receiptNumber}</strong></td><td>{row.receivedOn}</td><td>{row.store}</td><td>{row.workOrder}</td><td><strong>{row.clientName}</strong><small>{maskDocument(row.clientDocument)}</small></td><td><span className={`risk-tag ${row.risk}`}>{row.risk}</span></td><td>{row.status === "escalation_pending" ? "Escalamiento pendiente" : row.status === "completed" ? "Completada" : "Cancelada"}</td><td>{row.evidenceCount}</td></tr>)}</tbody></table></div>}</section>}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Database; text: string }) { return <div className="empty-state"><Icon /><p>{text}</p></div>; }
function initials(name: string) { return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join(""); }
function maskDocument(value: string) { return value.length < 5 ? "••••" : `${value.slice(0, 2)}••••${value.slice(-2)}`; }
function activityName(id: string) {
  if (id.startsWith("module-")) return `Módulo ${id.replace("module-", "")}`;
  const names: Record<string, string> = { "quiz-final": "Evaluación final", "risk-lab": "Laboratorio de riesgo", "trivia-sprint": "Trivia Sprint", "protocol-order": "Ordena el protocolo", "visual-findings": "Detective visual", "conversation-sim": "Conversaciones difíciles", "checklist-timed": "Checklist contrarreloj" };
  return names[id] ?? id;
}
