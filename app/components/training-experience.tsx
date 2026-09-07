"use client";

import {
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  GraduationCap,
  Images,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Play,
  Printer,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  finalQuizQuestions,
  MODULE_EXPERIENCE_TOKENS,
  sacModules,
  trainingExamples,
  type SacModule,
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
        <div><span className="eyebrow">RUTA SAC · 8 EXPERIENCIAS</span><h1>Aprende mirando, explorando y practicando</h1><p>Videos, ejemplos visuales y procedimientos guiados. Las preguntas quedan únicamente en Trivias y Evaluación.</p></div>
        <div className="completion-badge"><strong>{percent}%</strong><span>{completedCount} de {sacModules.length}</span></div>
      </header>

      <section className="learning-grid" aria-label="Módulos de formación SAC">
        {sacModules.map((module) => {
          const completed = completedModules.has(module.id) || completedModules.has(String(module.order));
          return (
            <article className={`learning-card ${completed ? "completed" : ""}`} key={module.id}>
              <div className="learning-poster"><Image src={module.poster} alt={`Ejemplo visual de ${module.title.replace("SAC | ", "")}`} fill sizes="(max-width: 620px) 100vw, 190px" /><span>{module.kicker}</span>{completed && <i><Check /></i>}</div>
              <div className="learning-copy">
                <div className="learning-meta"><span>MÓDULO {String(module.order).padStart(2, "0")}</span><span><Clock3 />{module.duration} min</span></div>
                <h2>{module.title.replace("SAC | ", "")}</h2>
                <p>{module.summary}</p>
                <div className="learning-foot"><span className="role-pill">{module.role}</span><span className="visual-pill"><Images />3 ejemplos</span><span className="xp-pill">+{module.xp} XP</span></div>
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

const lessonStages = [
  { label: "Mira", icon: Video },
  { label: "Explora", icon: ScanSearch },
  { label: "Practica", icon: Target },
  { label: "Cierra", icon: ShieldCheck },
] as const;

function ExampleVisual({ example, compact = false }: { example: TrainingExample; compact?: boolean }) {
  return (
    <div
      className={`training-example-visual ${compact ? "compact" : ""} crop-${example.crop ?? "full"}`}
      role="img"
      aria-label={example.imageAlt}
      style={{ backgroundImage: `url(${example.image})` }}
    />
  );
}

function ModuleDialog({ module, alreadyCompleted, onClose, onComplete }: { module: SacModule; alreadyCompleted: boolean; onClose: () => void; onComplete: Props["onComplete"] }) {
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
      await onComplete(`module-${module.order}`, [...MODULE_EXPERIENCE_TOKENS]);
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

  const footerMessage = stage === 0
    ? videoSeen ? "Demostración revisada. Continúa con los ejemplos." : "Reproduce al menos el 82 % de la demostración."
    : stage === 1
      ? examplesReady ? "Ya exploraste los tres ejemplos." : `Explora las imágenes: ${viewedExamples.size}/${examples.length}`
      : stage === 2
        ? practiceReady ? "Ruta práctica completada." : `Aplica el procedimiento paso a paso: ${practiceStep}/${module.checklist.length}`
        : saved ? "La experiencia ya consta como completada." : "Todo listo para guardar tu progreso.";

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="sac-modal lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
        <header className="modal-header"><div><span className="eyebrow">EXPERIENCIA {String(module.order).padStart(2, "0")} · {module.kicker.toUpperCase()}</span><h2 id="lesson-title">{module.title.replace("SAC | ", "")}</h2><p>Demostración, análisis visual y práctica guiada. Aquí no hay preguntas.</p></div><button className="icon-button" onClick={onClose} aria-label="Cerrar módulo"><X /></button></header>

        <nav className="lesson-stage-rail" aria-label="Etapas de la experiencia">
          {lessonStages.map((item, index) => {
            const Icon = item.icon;
            return <button key={item.label} onClick={() => setStage(index)} disabled={!canOpenStage(index)} aria-current={stage === index ? "step" : undefined} className={stageDone[index] ? "done" : ""}><span>{stageDone[index] ? <Check /> : <Icon />}</span><small>0{index + 1}</small><strong>{item.label}</strong></button>;
          })}
        </nav>

        <div className="lesson-body interactive-lesson-body">
          {stage === 0 && (
            <div className="lesson-stage-panel">
              <div className="video-shell">
                <video controls preload="metadata" poster={module.poster} onEnded={() => setVideoSeen(true)} onTimeUpdate={(event) => { if (event.currentTarget.duration && event.currentTarget.currentTime / event.currentTarget.duration > 0.82) setVideoSeen(true); }}>
                  <source src={module.video} type="video/mp4" />
                  <track kind="captions" src={module.captions} srcLang="es" label="Español" default />
                  Tu navegador no puede reproducir este video.
                </video>
                <div className={videoSeen ? "media-status done" : "media-status"}>{videoSeen ? <CheckCircle2 /> : <Video />}<span>{videoSeen ? "Demostración revisada" : "Mira al menos el 82 % para continuar"}</span></div>
              </div>
              <div className="objective-panel"><span className="eyebrow">LO QUE VAS A PRACTICAR</span><ul>{module.objectives.map((objective) => <li key={objective}><Check />{objective}</li>)}</ul></div>
              <section className="saci-learning-note"><Lightbulb /><div><span>SACI TE ACOMPAÑA</span><p>No memorices respuestas. Observa cómo cambia el procedimiento cuando aparece una señal nueva y reproduce después la secuencia en la práctica guiada.</p></div></section>
            </div>
          )}

          {stage === 1 && (
            <div className="lesson-stage-panel">
              <div className="stage-intro"><div><span className="eyebrow">LABORATORIO VISUAL</span><h3>Abre cada imagen y descubre cómo se actúa</h3><p>Selecciona los tres casos. SACI te muestra qué observar, qué hacer y qué evidencia debe quedar.</p></div><span className="stage-counter"><Eye />{viewedExamples.size}/{examples.length} vistos</span></div>
              <div className="training-example-tabs">
                {examples.map((example, index) => (
                  <button key={example.id} onClick={() => openExample(index)} className={`${selectedExample === index ? "active" : ""} ${viewedExamples.has(index) ? "viewed" : ""}`}>
                    <ExampleVisual example={example} compact />
                    <span><small>{example.label}</small><strong>{example.title}</strong></span>
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
                      <div><dt><ScanSearch />Qué observar</dt><dd>{selected.observe}</dd></div>
                      <div><dt><Target />Cómo actuar</dt><dd>{selected.action}</dd></div>
                      <div><dt><FileCheck2 />Qué debe quedar</dt><dd>{selected.evidence}</dd></div>
                    </dl>
                  </div>
                </article>
              ) : (
                <div className="example-empty"><Images /><strong>Elige una imagen para comenzar</strong><span>Los detalles aparecerán aquí, sin calificaciones ni respuestas A, B, C o D.</span></div>
              )}
            </div>
          )}

          {stage === 2 && (
            <div className="lesson-stage-panel">
              <div className="stage-intro"><div><span className="eyebrow">PRÁCTICA GUIADA</span><h3>Ejecuta el procedimiento con SACI</h3><p>Avanza una acción a la vez. Cada paso revela el criterio que debes aplicar en una recepción real.</p></div><span className="stage-counter"><Target />{practiceStep}/{module.checklist.length} aplicados</span></div>
              <div className="guided-practice">
                <div className="guided-practice-visual"><Image src={module.poster} alt={`Ejemplo visual del módulo ${module.order}: ${module.title.replace("SAC | ", "")}`} fill sizes="(max-width: 620px) 100vw, 330px" /><span><Sparkles />SACI · modo práctica</span></div>
                <div className="practice-timeline">
                  {module.checklist.map((item, index) => {
                    const completed = index < practiceStep;
                    const current = index === practiceStep;
                    const guide = module.sections[index % module.sections.length];
                    return <article key={item} className={completed ? "completed" : current ? "current" : "locked"}><span>{completed ? <Check /> : index + 1}</span><div><small>{completed ? "APLICADO" : current ? "PASO ACTUAL" : "SIGUIENTE"}</small><h4>{item}</h4>{current && <p>{guide.body}</p>}{current && guide.tip && <aside><Lightbulb />{guide.tip}</aside>}</div></article>;
                  })}
                  {!practiceReady && <button className="practice-action" onClick={() => setPracticeStep((current) => Math.min(current + 1, module.checklist.length))}><Play />Aplicar este paso y continuar<ChevronRight /></button>}
                  {practiceReady && <div className="practice-complete"><CheckCircle2 /><div><strong>Procedimiento recorrido</strong><span>Ya aplicaste cada acción con su contexto operativo.</span></div></div>}
                </div>
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="lesson-stage-panel">
              <div className="applied-summary-hero"><ShieldCheck /><div><span className="eyebrow">CIERRE APLICADO</span><h3>Ya puedes llevar este criterio a la recepción</h3><p>Revisaste una demostración, analizaste tres casos visuales y ejecutaste el procedimiento completo.</p></div></div>
              <div className="applied-summary-grid">
                <section><span className="summary-icon"><Eye /></span><small>CASOS QUE YA RECONOCES</small>{examples.map((example) => <p key={example.id}><Check />{example.title}</p>)}</section>
                <section><span className="summary-icon"><Target /></span><small>RUTA QUE YA PRACTICASTE</small>{module.checklist.map((item) => <p key={item}><Check />{item}</p>)}</section>
              </div>
              <section className="saci-learning-note success"><CheckCircle2 /><div><span>FORMACIÓN SIN EXAMEN</span><p>Guardar este módulo confirma la experiencia práctica. Las preguntas calificadas permanecen separadas en Trivias y en la Evaluación final.</p></div></section>
              {saved && <div className="result-banner success" role="status"><strong>¡Experiencia completada!</strong><span>Tu avance y recompensa quedaron guardados.</span></div>}
              {error && <div className="form-alert error" role="alert">{error}</div>}
            </div>
          )}
        </div>

        <footer className="modal-footer interactive-lesson-footer">
          <button className="secondary-action" disabled={stage === 0} onClick={() => setStage((current) => Math.max(0, current - 1))}><ChevronLeft />Anterior</button>
          <span>{footerMessage}</span>
          {stage === 0 && <button className="primary-action" disabled={!videoSeen} onClick={() => setStage(1)}>Explorar ejemplos<ChevronRight /></button>}
          {stage === 1 && <button className="primary-action" disabled={!examplesReady} onClick={() => setStage(2)}>Ir a la práctica<ChevronRight /></button>}
          {stage === 2 && <button className="primary-action" disabled={!practiceReady} onClick={() => setStage(3)}>Ver mi cierre<ChevronRight /></button>}
          {stage === 3 && (saved ? <button className="primary-action" onClick={onClose}><CheckCircle2 />Cerrar experiencia</button> : <button className="primary-action" disabled={busy} onClick={completeModule}>{busy ? <LoaderCircle className="spin" /> : <CheckCircle2 />}{busy ? "Guardando…" : "Guardar módulo completado"}</button>)}
        </footer>
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
