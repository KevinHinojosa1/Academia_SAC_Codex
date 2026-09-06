"use client";

import {
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Play,
  Printer,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  finalQuizQuestions,
  questionBank,
  sacModules,
  type SacModule,
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

export default function TrainingExperience({ completedModules, certified, user, onComplete }: Props) {
  const [activeModule, setActiveModule] = useState<SacModule | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const completedCount = sacModules.filter(
    (module) => completedModules.has(module.id) || completedModules.has(String(module.order)),
  ).length;
  const percent = Math.round((completedCount / sacModules.length) * 100);

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div><span className="eyebrow">RUTA SAC · 8 MÓDULOS</span><h1>Formación que se convierte en criterio</h1><p>Microclases breves, decisiones aplicadas y retroalimentación para cada rol.</p></div>
        <div className="completion-badge"><strong>{percent}%</strong><span>{completedCount} de {sacModules.length}</span></div>
      </header>

      <section className="learning-grid" aria-label="Módulos de formación SAC">
        {sacModules.map((module) => {
          const completed = completedModules.has(module.id) || completedModules.has(String(module.order));
          return (
            <article className={`learning-card ${completed ? "completed" : ""}`} key={module.id}>
              <div className="learning-poster"><Image src={module.poster} alt="" fill sizes="(max-width: 620px) 100vw, 190px" /><span>{module.kicker}</span>{completed && <i><Check /></i>}</div>
              <div className="learning-copy">
                <div className="learning-meta"><span>MÓDULO {String(module.order).padStart(2, "0")}</span><span><Clock3 />{module.duration} min</span></div>
                <h2>{module.title.replace("SAC | ", "")}</h2>
                <p>{module.summary}</p>
                <div className="learning-foot"><span className="role-pill">{module.role}</span><span className="xp-pill">+{module.xp} XP</span></div>
                <button className={completed ? "secondary-action" : "primary-action"} onClick={() => setActiveModule(module)}>
                  {completed ? <BookOpenCheck /> : <Play />}{completed ? "Repasar módulo" : "Comenzar módulo"}<ChevronRight />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className={`certification-banner ${completedCount === sacModules.length ? "ready" : ""}`}>
        <span className="certification-seal"><GraduationCap /></span>
        <div><span className="eyebrow">CERTIFICACIÓN SAC</span><h2>{certified ? "Tu certificación está lista" : "Evaluación final de recepción segura"}</h2><p>{certified ? "Aprobaste la evaluación. Puedes imprimir tu constancia cuando la necesites." : completedCount === sacModules.length ? "Responde 8 casos integradores. Se aprueba con 7 respuestas correctas." : `Completa ${sacModules.length - completedCount} módulo${sacModules.length - completedCount === 1 ? "" : "s"} para habilitar la evaluación.`}</p></div>
        {certified ? (
          <button className="primary-action" onClick={() => setCertificateOpen(true)}><BadgeCheck />Ver certificado</button>
        ) : (
          <button className="primary-action" disabled={completedCount !== sacModules.length} onClick={() => setQuizOpen(true)}>{completedCount === sacModules.length ? <FileCheck2 /> : <LockKeyhole />}{completedCount === sacModules.length ? "Presentar evaluación" : "Aún bloqueada"}</button>
        )}
      </section>

      {activeModule && (
        <ModuleDialog
          module={activeModule}
          alreadyCompleted={completedModules.has(activeModule.id) || completedModules.has(String(activeModule.order))}
          onClose={() => setActiveModule(null)}
          onComplete={onComplete}
        />
      )}
      {quizOpen && <FinalQuizDialog onClose={() => setQuizOpen(false)} onComplete={onComplete} onCertificate={() => { setQuizOpen(false); setCertificateOpen(true); }} />}
      {certificateOpen && <CertificateDialog user={user} onClose={() => setCertificateOpen(false)} />}
    </div>
  );
}

function ModuleDialog({ module, alreadyCompleted, onClose, onComplete }: { module: SacModule; alreadyCompleted: boolean; onClose: () => void; onComplete: Props["onComplete"] }) {
  const questions = useMemo(() => questionBank.filter((item) => item.moduleId === module.id).slice(0, 6), [module.id]);
  const [videoSeen, setVideoSeen] = useState(alreadyCompleted);
  const [checked, setChecked] = useState<Set<number>>(new Set(alreadyCompleted ? module.checklist.map((_, index) => index) : []));
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checklistReady = checked.size === module.checklist.length;
  const quizReady = questions.length === 6 && questions.every((_, index) => answers[index] !== undefined);

  const toggleCheck = (index: number) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const evaluate = async () => {
    setError("");
    const nextScore = questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);
    setScore(nextScore);
    if (nextScore < 5) return;
    setBusy(true);
    try {
      await onComplete(
        `module-${module.order}`,
        questions.map((_, index) => answers[index]),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No fue posible guardar el módulo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sac-modal lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
        <header className="modal-header"><div><span className="eyebrow">MÓDULO {String(module.order).padStart(2, "0")} · {module.kicker.toUpperCase()}</span><h2 id="lesson-title">{module.title.replace("SAC | ", "")}</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar módulo"><X /></button></header>
        <div className="lesson-body">
          <div className="video-shell">
            <video controls preload="metadata" poster={module.poster} onEnded={() => setVideoSeen(true)} onTimeUpdate={(event) => { if (event.currentTarget.duration && event.currentTarget.currentTime / event.currentTarget.duration > 0.82) setVideoSeen(true); }}>
              <source src={module.video} type="video/mp4" />
              <track kind="captions" src={module.captions} srcLang="es" label="Español" default />
              Tu navegador no puede reproducir este video.
            </video>
            <div className={videoSeen ? "media-status done" : "media-status"}>{videoSeen ? <CheckCircle2 /> : <Video />}<span>{videoSeen ? "Microclase revisada" : "Mira al menos el 82 % para continuar"}</span></div>
          </div>
          <div className="objective-panel"><span className="eyebrow">AL TERMINAR PODRÁS</span><ul>{module.objectives.map((objective) => <li key={objective}><Check />{objective}</li>)}</ul></div>
          <div className="lesson-sections">{module.sections.map((section) => <article key={section.title}><h3>{section.title}</h3><p>{section.body}</p>{section.tip && <aside><Sparkles />{section.tip}</aside>}</article>)}</div>
          <section className="lesson-checklist"><div className="section-heading"><div><span className="eyebrow">COMPROBACIÓN PRÁCTICA</span><h3>Marca cada conducta que ya puedes aplicar</h3></div><span>{checked.size}/{module.checklist.length}</span></div><div className="check-grid">{module.checklist.map((item, index) => <label key={item} className={checked.has(index) ? "selected" : ""}><input type="checkbox" checked={checked.has(index)} onChange={() => toggleCheck(index)} /><span><Check /></span>{item}</label>)}</div></section>
          <section className="module-quiz"><span className="eyebrow">MINIEVALUACIÓN · 5/6 PARA APROBAR</span><div className="question-stack">{questions.map((question, questionIndex) => <fieldset key={question.id}><legend><small>{question.difficulty}</small>{questionIndex + 1}. {question.prompt}</legend><div className="option-grid">{question.options.map((option, optionIndex) => <label key={option} className={answers[questionIndex] === optionIndex ? "selected" : ""}><input type="radio" name={`${module.id}-${question.id}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} /><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</label>)}</div>{score !== null && <p className={answers[questionIndex] === question.answer ? "answer-note correct" : "answer-note incorrect"}>{answers[questionIndex] === question.answer ? "Correcto. " : `Respuesta correcta: ${String.fromCharCode(65 + question.answer)}. `}{question.explanation}</p>}</fieldset>)}</div></section>
          {score !== null && <div className={`result-banner ${score >= 5 ? "success" : "warning"}`} role="status"><strong>{score >= 5 ? "¡Criterio demostrado!" : "Repasa y vuelve a intentarlo"}</strong><span>Obtuviste {score} de 6 respuestas correctas.</span></div>}
          {error && <div className="form-alert error" role="alert">{error}</div>}
        </div>
        <footer className="modal-footer"><span>{alreadyCompleted ? "Este módulo ya consta como completado." : !videoSeen ? "Primero revisa la microclase." : !checklistReady ? "Completa la comprobación práctica." : !quizReady ? "Responde las seis preguntas." : "Todo listo para evaluar."}</span><button className="primary-action" disabled={alreadyCompleted || busy || !videoSeen || !checklistReady || !quizReady} onClick={evaluate}>{busy ? <LoaderCircle className="spin" /> : <CheckCircle2 />}{alreadyCompleted ? "Módulo completado" : busy ? "Guardando…" : score !== null && score < 5 ? "Volver a evaluar" : "Evaluar y completar"}</button></footer>
      </section>
    </div>
  );
}

function FinalQuizDialog({ onClose, onComplete, onCertificate }: { onClose: () => void; onComplete: Props["onComplete"]; onCertificate: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = finalQuizQuestions.every((_, index) => answers[index] !== undefined);
  const submit = async () => {
    setBusy(true); setError("");
    try { setResult(await onComplete("quiz-final", finalQuizQuestions.map((_, index) => answers[index]))); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No fue posible registrar la evaluación."); }
    finally { setBusy(false); }
  };
  return (
    <div className="modal-backdrop">
      <section className="sac-modal quiz-modal" role="dialog" aria-modal="true" aria-labelledby="final-title">
        <header className="modal-header"><div><span className="eyebrow">CERTIFICACIÓN SAC</span><h2 id="final-title">Evaluación integradora</h2><p>8 situaciones · Aprobación: 7/8</p></div><button className="icon-button" onClick={onClose} aria-label="Cerrar evaluación"><X /></button></header>
        <div className="lesson-body"><div className="question-stack">{finalQuizQuestions.map((question, index) => <fieldset key={question.id} disabled={Boolean(result)}><legend><small>MÓDULO {question.moduleId.replace("sac-0", "")}</small>{index + 1}. {question.prompt}</legend><div className="option-grid">{question.options.map((option, optionIndex) => <label key={option} className={answers[index] === optionIndex ? "selected" : ""}><input type="radio" name={`final-${question.id}`} checked={answers[index] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))} /><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</label>)}</div>{result && <p className={answers[index] === question.answer ? "answer-note correct" : "answer-note incorrect"}>{answers[index] === question.answer ? "Correcto. " : `Respuesta correcta: ${String.fromCharCode(65 + question.answer)}. `}{question.explanation}</p>}</fieldset>)}</div>{result && <div className={`result-banner ${result.attempt.passed ? "success" : "warning"}`}><strong>{result.attempt.passed ? "Evaluación aprobada" : "Necesitas un nuevo intento"}</strong><span>{result.attempt.score} de {result.attempt.maxScore} respuestas correctas.</span></div>}{error && <div className="form-alert error" role="alert">{error}</div>}</div>
        <footer className="modal-footer"><span>{result ? (result.attempt.passed ? "Tu logro quedó guardado." : "Revisa la retroalimentación antes de reintentar.") : `${Object.keys(answers).length}/8 respuestas`}</span>{result?.attempt.passed ? <button className="primary-action" onClick={onCertificate}><BadgeCheck />Abrir certificado</button> : result ? <button className="secondary-action" onClick={() => { setAnswers({}); setResult(null); }}><Sparkles />Nuevo intento</button> : <button className="primary-action" disabled={!ready || busy} onClick={submit}>{busy ? <LoaderCircle className="spin" /> : <FileCheck2 />}{busy ? "Evaluando…" : "Enviar evaluación"}</button>}</footer>
      </section>
    </div>
  );
}

function CertificateDialog({ user, onClose }: { user: SacUser; onClose: () => void }) {
  const date = new Intl.DateTimeFormat("es-EC", { dateStyle: "long" }).format(new Date());
  const code = `SAC-${user.employeeCode.replace(/[^A-Z0-9]/gi, "")}-${new Date().getFullYear()}`;
  return (
    <div className="modal-backdrop certificate-backdrop">
      <section className="certificate-modal" role="dialog" aria-modal="true" aria-labelledby="certificate-title">
        <button className="icon-button certificate-close" onClick={onClose} aria-label="Cerrar certificado"><X /></button>
        <div className="certificate-sheet">
          <div className="certificate-brand"><span>SAC</span><small>RECEPCIÓN SEGURA</small></div>
          <BadgeCheck className="certificate-emblem" />
          <span className="eyebrow">CONSTANCIA DE APROBACIÓN</span>
          <h2 id="certificate-title">Certificación SAC</h2>
          <p>Se deja constancia de que</p><h3>{user.fullName}</h3>
          <p>aprobó la ruta de formación y la evaluación integradora del protocolo de recepción segura de armazones.</p>
          <div className="certificate-data"><span><strong>Rol</strong>{user.role === "optometra" ? "Optómetra" : user.role === "admin" ? "Administración" : "Asesor"}</span><span><strong>Local</strong>{user.store}</span><span><strong>Fecha</strong>{date}</span></div>
          <small className="certificate-code">Código verificable: {code}</small>
        </div>
        <div className="certificate-actions"><a className="secondary-action" href="/resources/formato-recepcion-sac.pdf" download><Download />Formato SAC</a><button className="primary-action" onClick={() => window.print()}><Printer />Imprimir o guardar PDF</button></div>
      </section>
    </div>
  );
}
