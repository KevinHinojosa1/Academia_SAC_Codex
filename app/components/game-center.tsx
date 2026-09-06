"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  Gamepad2,
  ListChecks,
  LoaderCircle,
  MessageCircle,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Timer,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  checklistChallenge,
  conversationCases,
  protocolOrder,
  riskCases,
  triviaQuestions,
  visualFindings,
} from "@/lib/sac-content";
import type { CompletionResult } from "../sac-platform";

type Complete = (activityId: string, answers?: Array<number | string>) => Promise<CompletionResult>;
type GameId = "risk" | "trivia" | "protocol" | "visual" | "conversation" | "checklist";

const games: Array<{ id: GameId; title: string; eyebrow: string; description: string; time: string; xp: string; icon: LucideIcon; accent: string }> = [
  { id: "risk", title: "Laboratorio de riesgo", eyebrow: "9 CASOS", description: "Clasifica señales reales como riesgo bajo, medio o alto.", time: "6 min", xp: "+180 XP", icon: AlertTriangle, accent: "coral" },
  { id: "trivia", title: "Trivia Sprint", eyebrow: "10 PREGUNTAS", description: "Responde contra el reloj y demuestra precisión operativa.", time: "90 s", xp: "+160 XP", icon: Timer, accent: "violet" },
  { id: "protocol", title: "Ordena el protocolo", eyebrow: "SECUENCIA", description: "Construye el orden correcto antes de manipular el producto.", time: "3 min", xp: "+100 XP", icon: ListChecks, accent: "mint" },
  { id: "visual", title: "Detective visual", eyebrow: "INSPECCIÓN", description: "Ubica seis hallazgos sobre una imagen de alta resolución.", time: "4 min", xp: "+120 XP", icon: Eye, accent: "blue" },
  { id: "conversation", title: "Conversaciones difíciles", eyebrow: "4 ESCENAS", description: "Elige respuestas claras, empáticas y sin promesas absolutas.", time: "5 min", xp: "+140 XP", icon: MessageCircle, accent: "gold" },
  { id: "checklist", title: "Checklist contrarreloj", eyebrow: "60 SEGUNDOS", description: "Selecciona todos los controles obligatorios sin añadir atajos.", time: "60 s", xp: "+110 XP", icon: Clock3, accent: "teal" },
];

export default function GameCenter({ onComplete }: { onComplete: Complete }) {
  const [active, setActive] = useState<GameId | null>(null);
  const selected = games.find((game) => game.id === active);
  return (
    <div className="page-stack">
      <header className="page-heading game-page-heading">
        <div><span className="eyebrow">SIMULADORES SAC</span><h1>Practica la decisión, no la memoria</h1><p>Cada reto guarda el resultado real en tu historial de progreso.</p></div>
        <div className="streak-card"><Gamepad2 /><div><strong>6</strong><span>retos interactivos</span></div></div>
      </header>
      {!active ? (
        <section className="game-grid" aria-label="Simuladores disponibles">
          {games.map((game) => {
            const Icon = game.icon;
            return <article className="game-card" key={game.id}><span className={`game-art ${game.accent}`}><Icon /></span><div><span className="eyebrow">{game.eyebrow}</span><h2>{game.title}</h2><p>{game.description}</p><div className="game-meta"><span><Clock3 />{game.time}</span><span><Sparkles />{game.xp}</span></div><button className="secondary-action" onClick={() => setActive(game.id)}><Play />Iniciar reto<ChevronRight /></button></div></article>;
          })}
        </section>
      ) : (
        <section className="game-arena">
          <header className="arena-header"><button className="text-action" onClick={() => setActive(null)}><ArrowLeft />Todos los retos</button><div><span className="eyebrow">{selected?.eyebrow}</span><h2>{selected?.title}</h2></div></header>
          {active === "risk" && <RiskGame onComplete={onComplete} />}
          {active === "trivia" && <TriviaGame onComplete={onComplete} />}
          {active === "protocol" && <ProtocolGame onComplete={onComplete} />}
          {active === "visual" && <VisualGame onComplete={onComplete} />}
          {active === "conversation" && <ConversationGame onComplete={onComplete} />}
          {active === "checklist" && <ChecklistGame onComplete={onComplete} />}
        </section>
      )}
    </div>
  );
}

function RiskGame({ onComplete }: { onComplete: Complete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = riskCases[index];
  const choose = (value: string) => { if (!choice) setChoice(value); };
  const next = async () => {
    if (!choice) return;
    const nextAnswers = [...answers, choice];
    if (index < riskCases.length - 1) { setAnswers(nextAnswers); setIndex(index + 1); setChoice(null); return; }
    setBusy(true); setError("");
    try { setResult(await onComplete("risk-lab", nextAnswers)); } catch (reason) { setError(message(reason)); } finally { setBusy(false); }
  };
  if (result) return <ResultCard result={result} onReset={() => { setIndex(0); setAnswers([]); setChoice(null); setResult(null); }} />;
  return <div className="challenge-layout"><article className="challenge-main"><ProgressHeader current={index + 1} total={riskCases.length} label="casos" /><div className="case-panel"><span>CASO {String(index + 1).padStart(2, "0")}</span><h3>{current.title}</h3><p>{current.context}</p><ul>{current.signals.map((signal) => <li key={signal}><Target />{signal}</li>)}</ul></div><div className="risk-choice-grid">{(["Bajo", "Medio", "Alto"] as const).map((level) => <button key={level} className={`${level.toLowerCase()} ${choice === level ? "selected" : ""}`} onClick={() => choose(level)} disabled={Boolean(choice)}><i />Riesgo {level.toLowerCase()}</button>)}</div>{choice && <div className={`answer-feedback ${choice === current.answer ? "correct" : "incorrect"}`} role="status"><strong>{choice === current.answer ? "Buena lectura del caso" : `Este caso corresponde a riesgo ${current.answer.toLowerCase()}`}</strong><p>{current.explanation}</p></div>}{error && <div className="form-alert error">{error}</div>}<div className="challenge-actions"><span>{answers.length + (choice ? 1 : 0)} de {riskCases.length} clasificados</span><button className="primary-action" onClick={next} disabled={!choice || busy}>{busy ? <LoaderCircle className="spin" /> : <ChevronRight />}{index === riskCases.length - 1 ? "Guardar resultado" : "Siguiente caso"}</button></div></article><aside className="challenge-aside"><AlertTriangle /><h3>Decide con evidencias</h3><p>La firma del cliente nunca reduce el riesgo técnico. Si hay duda estructural, la acción correcta es pausar y escalar.</p></aside></div>;
}

function TriviaGame({ onComplete }: { onComplete: Complete }) {
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(90);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const timedOut = started && time === 0;
  useEffect(() => {
    if (!started || time <= 0 || answers.length >= triviaQuestions.length || result) return;
    const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, time, answers.length, result]);
  const select = (answer: number) => { if (!timedOut) { setAnswers((items) => [...items, answer]); setIndex((value) => Math.min(value + 1, triviaQuestions.length - 1)); } };
  const finish = async () => {
    setBusy(true);
    const padded = [...answers, ...Array(Math.max(0, triviaQuestions.length - answers.length)).fill(9)];
    try { setResult(await onComplete("trivia-sprint", padded)); } finally { setBusy(false); }
  };
  if (!started) return <IntroCard icon={Timer} title="90 segundos. Diez decisiones." text="El cronómetro comienza al pulsar iniciar. No se muestran respuestas hasta registrar el resultado." action="Iniciar Trivia Sprint" onStart={() => setStarted(true)} />;
  if (result) return <ResultCard result={result} onReset={() => { setStarted(false); setTime(90); setIndex(0); setAnswers([]); setResult(null); }} />;
  const done = answers.length === triviaQuestions.length || timedOut;
  const question = triviaQuestions[index];
  return <article className="challenge-main solo"><div className="timer-line"><strong className={time <= 20 ? "urgent" : ""}><Timer />{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</strong><span>{answers.length}/{triviaQuestions.length}</span></div><div className="linear-progress"><span style={{ width: `${(answers.length / triviaQuestions.length) * 100}%` }} /></div>{!done ? <fieldset className="sprint-question"><legend><small>{question.difficulty}</small>{question.prompt}</legend><div className="option-grid">{question.options.map((option, optionIndex) => <button key={option} onClick={() => select(optionIndex)}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div></fieldset> : <div className="finish-state"><Trophy /><h3>{timedOut ? "Tiempo cumplido" : "Sprint completado"}</h3><p>Registra tus respuestas para conocer la puntuación verificada.</p><button className="primary-action" onClick={finish} disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <BadgeCheck />}Calcular resultado</button></div>}</article>;
}

function ProtocolGame({ onComplete }: { onComplete: Complete }) {
  const options = useMemo(() => [...protocolOrder].reverse(), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const add = (id: string) => { if (!selected.includes(id)) setSelected((items) => [...items, id]); };
  const finish = async () => { setBusy(true); try { setResult(await onComplete("protocol-order", selected)); } finally { setBusy(false); } };
  if (result) return <ResultCard result={result} onReset={() => { setSelected([]); setResult(null); }} />;
  return <div className="challenge-layout"><article className="challenge-main"><p className="instruction">Pulsa las acciones en el orden en que deben ocurrir. Puedes deshacer el último paso.</p><div className="protocol-builder"><ol>{selected.map((id, index) => { const step = protocolOrder.find((item) => item.id === id)!; return <li key={id}><strong>{index + 1}</strong><div><span>{step.label}</span><small>{step.explanation}</small></div></li>; })}{selected.length === 0 && <li className="empty-slot">Tu secuencia aparecerá aquí</li>}</ol><div className="protocol-options">{options.map((step) => <button key={step.id} disabled={selected.includes(step.id)} onClick={() => add(step.id)}><span>{step.label}</span><ChevronRight /></button>)}</div></div><div className="challenge-actions"><button className="text-action" disabled={!selected.length} onClick={() => setSelected((items) => items.slice(0, -1))}><RotateCcw />Deshacer</button><button className="primary-action" disabled={selected.length !== protocolOrder.length || busy} onClick={finish}>{busy ? <LoaderCircle className="spin" /> : <Check />}Validar secuencia</button></div></article><aside className="challenge-aside"><ListChecks /><h3>La aceptación va al final</h3><p>El cliente confirma después de revisar, recibir información, resolver dudas y contar con evidencia.</p></aside></div>;
}

function VisualGame({ onComplete }: { onComplete: Complete }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const finish = async () => { setBusy(true); try { setResult(await onComplete("visual-findings", visualFindings.filter((item) => selected.has(item.id)).map((item) => item.id))); } finally { setBusy(false); } };
  if (result) return <ResultCard result={result} onReset={() => { setSelected(new Set()); setResult(null); }} />;
  return <div className="challenge-layout visual-layout"><article className="challenge-main"><ProgressHeader current={selected.size} total={visualFindings.length} label="hallazgos" /><p className="instruction">Explora la imagen y pulsa los marcadores para identificar cada señal.</p><div className="inspection-image"><Image src="/media/sac-inspeccion-fisura.png" alt="Primer plano de un armazón de acetato bajo inspección" fill sizes="(max-width: 900px) 100vw, 70vw" />{visualFindings.map((finding, index) => <button key={finding.id} style={{ left: `${finding.x}%`, top: `${finding.y}%` }} className={selected.has(finding.id) ? "found" : ""} onClick={() => toggle(finding.id)} aria-label={`${selected.has(finding.id) ? "Quitar" : "Marcar"} ${finding.label}`}><span>{selected.has(finding.id) ? <Check /> : index + 1}</span><b>{selected.has(finding.id) ? finding.label : "Inspeccionar"}</b></button>)}</div><div className="challenge-actions"><span>{selected.size} de {visualFindings.length} señales marcadas</span><button className="primary-action" disabled={selected.size !== visualFindings.length || busy} onClick={finish}>{busy ? <LoaderCircle className="spin" /> : <Camera />}Guardar inspección</button></div></article><aside className="challenge-aside"><Eye /><h3>Mira con método</h3><ul>{visualFindings.filter((item) => selected.has(item.id)).map((item) => <li key={item.id}><strong>{item.label}</strong><span>{item.explanation}</span></li>)}</ul></aside></div>;
}

function ConversationGame({ onComplete }: { onComplete: Complete }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const current = conversationCases[index];
  const next = async () => {
    if (choice === null) return;
    const nextAnswers = [...answers, choice];
    if (index < conversationCases.length - 1) { setAnswers(nextAnswers); setIndex(index + 1); setChoice(null); return; }
    setBusy(true); try { setResult(await onComplete("conversation-sim", nextAnswers)); } finally { setBusy(false); }
  };
  if (result) return <ResultCard result={result} onReset={() => { setIndex(0); setChoice(null); setAnswers([]); setResult(null); }} />;
  return <div className="challenge-layout"><article className="challenge-main"><ProgressHeader current={index + 1} total={conversationCases.length} label="escenas" /><div className="conversation-scene"><Image src="/media/sac-conversacion-cliente.png" alt="Asesora conversando con un cliente" width={900} height={700} sizes="(max-width: 620px) 100vw, 230px" /><div><span>CLIENTE</span><h3>{current.customer}</h3><p>{current.context}</p></div></div><fieldset className="conversation-options"><legend>¿Qué responderías?</legend>{current.options.map((option, optionIndex) => <label key={option} className={choice === optionIndex ? "selected" : ""}><input type="radio" name={`conversation-${current.id}`} checked={choice === optionIndex} onChange={() => setChoice(optionIndex)} disabled={choice !== null} /><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</label>)}</fieldset>{choice !== null && <div className={`answer-feedback ${choice === current.answer ? "correct" : "incorrect"}`}><strong>{choice === current.answer ? "Respuesta profesional" : "Hay una opción más segura"}</strong><p>{current.explanation}</p></div>}<div className="challenge-actions"><span>Escena {index + 1} de {conversationCases.length}</span><button className="primary-action" disabled={choice === null || busy} onClick={next}><ChevronRight />{index === conversationCases.length - 1 ? "Guardar resultado" : "Siguiente escena"}</button></div></article><aside className="challenge-aside"><MessageCircle /><h3>Claro, sereno y honesto</h3><p>Describe lo observable, explica el siguiente paso y valida comprensión. Evita culpar, minimizar o prometer resultados.</p></aside></div>;
}

function ChecklistGame({ onComplete }: { onComplete: Complete }) {
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(60);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!started || time <= 0 || result) return; const timer = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [started, time, result]);
  if (!started) return <IntroCard icon={Clock3} title="Selecciona solo los controles correctos" text="Hay acciones obligatorias y distractores. Elige con criterio antes de que termine el minuto." action="Iniciar checklist" onStart={() => setStarted(true)} />;
  if (result) return <ResultCard result={result} onReset={() => { setStarted(false); setTime(60); setSelected(new Set()); setResult(null); }} />;
  const finish = async () => { setBusy(true); try { setResult(await onComplete("checklist-timed", checklistChallenge.filter((item) => selected.has(item.id)).map((item) => item.id))); } finally { setBusy(false); } };
  return <article className="challenge-main solo"><div className="timer-line"><strong className={time <= 15 ? "urgent" : ""}><Timer />0:{String(time).padStart(2, "0")}</strong><span>{selected.size} seleccionados</span></div><div className="checklist-game-grid">{checklistChallenge.map((item) => <button key={item.id} className={selected.has(item.id) ? "selected" : ""} disabled={time === 0} onClick={() => setSelected((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })}><span>{selected.has(item.id) ? <Check /> : <CircleHelp />}</span>{item.label}</button>)}</div><div className="challenge-actions"><span>{time === 0 ? "Tiempo cumplido: registra lo seleccionado." : "Puedes enviar antes de terminar el tiempo."}</span><button className="primary-action" disabled={busy} onClick={finish}>{busy ? <LoaderCircle className="spin" /> : <BadgeCheck />}Validar checklist</button></div></article>;
}

function IntroCard({ icon: Icon, title, text, action, onStart }: { icon: LucideIcon; title: string; text: string; action: string; onStart: () => void }) { return <article className="game-intro"><span><Icon /></span><h3>{title}</h3><p>{text}</p><button className="primary-action" onClick={onStart}><Play />{action}</button></article>; }
function ProgressHeader({ current, total, label }: { current: number; total: number; label: string }) { return <div className="challenge-progress"><span>{current} de {total} {label}</span><div className="linear-progress"><span style={{ width: `${(current / total) * 100}%` }} /></div></div>; }
function ResultCard({ result, onReset }: { result: CompletionResult; onReset: () => void }) { return <article className={`game-result ${result.attempt.passed ? "passed" : "failed"}`}><span>{result.attempt.passed ? <Trophy /> : <RotateCcw />}</span><small>RESULTADO VERIFICADO</small><h3>{result.attempt.passed ? "Reto completado" : "Vuelve a intentarlo"}</h3><strong>{result.attempt.score}/{result.attempt.maxScore}</strong><p>{result.attempt.passed ? `Sumaste experiencia. Tu nuevo balance es ${result.balance.xp} XP.` : "Revisa las decisiones y realiza un nuevo intento para sumar experiencia."}</p><button className="secondary-action" onClick={onReset}><RotateCcw />Practicar otra vez</button></article>; }
function message(reason: unknown) { return reason instanceof Error ? reason.message : "No fue posible registrar el resultado."; }
