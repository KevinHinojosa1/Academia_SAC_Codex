"use client";

import { Bot, ChevronRight, MessageCircleQuestion, Send, ShieldAlert, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { botKnowledge } from "@/lib/sac-content";

type ChatMessage = { id: string; role: "assistant" | "user"; text: string; related?: string[] };

const suggestions = [
  "¿Cuándo debo escalar un caso?",
  "¿Qué fotos necesito?",
  "¿Cómo explico una fisura?",
  "¿La firma elimina el riesgo?",
];

export default function SacCoach({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: "SAC indica: puedo orientarte sobre inspección, nivel de riesgo, conversación, fotografías, registro, aceptación y escalamiento. Cuéntame qué observas." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  const indexed = useMemo(() => botKnowledge.map((item) => ({ ...item, normalized: normalize(`${item.intent} ${item.keywords.join(" ")}`) })), []);

  if (!open) return null;

  const ask = (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    const normalized = normalize(question);
    const ranked = indexed
      .map((item) => ({ item, score: item.keywords.reduce((sum, keyword) => sum + (normalized.includes(normalize(keyword)) ? 3 : 0), 0) + normalize(item.intent).split(" ").reduce((sum, word) => sum + (word.length > 4 && normalized.includes(word) ? 1 : 0), 0) }))
      .sort((a, b) => b.score - a.score);
    const match = ranked[0];
    let response = match && match.score > 0
      ? match.item.response
      : "SAC indica: no tengo suficiente contexto para darte una orientación segura. Describe el material, la antigüedad, el hallazgo visible y la manipulación solicitada. Si existe duda estructural, pausa la recepción y solicita validación.";
    if (!response.startsWith("SAC indica:")) response = `SAC indica: ${response}`;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: question },
      { id: crypto.randomUUID(), role: "assistant", text: response, related: match?.score ? match.item.relatedModuleIds : undefined },
    ]);
    setInput("");
  };

  return (
    <div className="coach-panel" role="dialog" aria-modal="true" aria-labelledby="coach-title">
      <header><span className="coach-avatar"><Bot /></span><div><span className="eyebrow">ASISTENTE OPERATIVO</span><h2 id="coach-title">SACI</h2><small><i /> Base SAC 2026.1</small></div><button className="icon-button" onClick={onClose} aria-label="Cerrar asistente"><X /></button></header>
      <div className="coach-scope"><ShieldAlert /><span>Orientación operativa. Ante riesgo alto o duda técnica, pausa y escala.</span></div>
      <div className="chat-feed" aria-live="polite">
        {messages.map((message) => <article key={message.id} className={message.role}><span>{message.role === "assistant" ? <Sparkles /> : "Tú"}</span><div><p>{message.text}</p>{message.related && message.related.length > 0 && <small>Módulos relacionados: {message.related.map((id) => id.replace("sac-0", "")).join(", ")}</small>}</div></article>)}
        <div ref={endRef} />
      </div>
      {messages.length === 1 && <div className="chat-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => ask(suggestion)}><MessageCircleQuestion />{suggestion}<ChevronRight /></button>)}</div>}
      <form onSubmit={(event) => { event.preventDefault(); ask(input); }}><label htmlFor="coach-input">Escribe tu consulta</label><div><textarea id="coach-input" value={input} onChange={(event) => setInput(event.target.value.slice(0, 500))} placeholder="Ej.: veo una grieta junto a la bisagra…" rows={2} /><button type="submit" disabled={!input.trim()} aria-label="Enviar consulta"><Send /></button></div><small>{input.length}/500</small></form>
    </div>
  );
}

function normalize(value: string) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ñ ]/g, " ");
}
