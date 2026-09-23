"use client";

import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageCircle,
  MessageCircleQuestion,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Theater,
  UserCheck,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { parseCapa, querySaciBrain } from "@/lib/sac-content";
import {
  cleanTextForSpeech,
  evaluateStudentResponse,
  findBestSpeechVoice,
  getRealAudioForScenario,
  getRealAudioUrl,
  ROLEPLAY_SCENARIOS,
  type RoleplayEvaluation,
} from "@/lib/sac-coach-engine";
import SaciAvatar from "./saci-avatar";
import type { SacUser } from "../sac-platform";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  related?: string[];
  riskLevel?: "alto" | "medio" | "bajo";
};

type CoachMode = "chat" | "roleplay" | "flash";

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: {
    isFinal: boolean;
    0: SpeechRecognitionResultItem;
  };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

function checkSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as WindowWithSpeech;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

const defaultSuggestions = [
  "¿Cómo actuar ante una fisura en el aro?",
  "¿Cuándo debo escalar a supervisión?",
  "¿Puedo aplicar calor en acetato?",
  "¿Qué fotos obligatorias debo tomar?",
];

function getContextualSuggestions(text: string): string[] {
  const norm = text.toLowerCase();
  if (/fisur|grieta|triz|rotur|quebrad/.test(norm)) {
    return [
      "¿Cómo registrar el código de escalamiento?",
      "¿Qué fotos macro debo tomar de la fisura?",
      "¿Cómo explicárselo al cliente sin alarmar?",
      "¿Puedo aplicar calor si hay una fisura leve?",
    ];
  }
  if (/calor|calient|temperatura|aire|arena/.test(norm)) {
    return [
      "¿Qué materiales no aceptan calor directo?",
      "¿Cómo proteger las lunas al calentar el aro?",
      "¿A qué temperatura amoldar el acetato?",
      "¿Qué hacer si el acetato cambia de color?",
    ];
  }
  if (/luna|garantia|craquel|rayad|antirrefle/.test(norm)) {
    return [
      "¿Cómo diferenciar craquelado de daño térmico?",
      "¿Qué cubre exactamente la garantía de lunas?",
      "¿Por qué no usar paños secos en antireflejo?",
      "¿Cómo explicar el informe de luz rasante?",
    ];
  }
  if (/decir no|negar|rechaz|asertiv|sandwich/.test(norm)) {
    return [
      "¿Cuál es la fórmula del sándwich para decir no?",
      "¿Qué hacer si el cliente exige el libro de reclamaciones?",
      "¿Cómo mantener la calma ante un reclamo acalorado?",
      "¿Qué 2 alternativas ofrecer en rotura de aro?",
    ];
  }
  return defaultSuggestions;
}

function detectRiskLevel(text: string): "alto" | "medio" | "bajo" | undefined {
  if (/riesgo alto|critico|fisur|rotur|quebrad|soldadur/i.test(text)) return "alto";
  if (/riesgo medio|holgura|desgaste/i.test(text)) return "medio";
  if (/riesgo bajo|estable/i.test(text)) return "bajo";
  return undefined;
}

export default function SacCoach({
  open,
  onClose,
  user,
  onRewardXp,
}: {
  open: boolean;
  onClose: () => void;
  user?: SacUser | null;
  onRewardXp?: (xp: number, reason: string) => void;
}) {
  const [mode, setMode] = useState<CoachMode>("chat");
  const [input, setInput] = useState("");
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(defaultSuggestions);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState<boolean>(checkSpeechRecognitionSupported);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  // Roleplay simulator state
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [roleplayEvaluation, setRoleplayEvaluation] = useState<RoleplayEvaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showIdealExample, setShowIdealExample] = useState(false);

  // Flash cards state
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);

  const userName = user?.fullName || "Colega SAC";
  const firstName = userName.split(" ")[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `SAC te dice:\n• [C] Conectar / Clarificar: ¡Hola ${firstName}! Soy SACI, tu Coach de Servicio al Cliente. Ahora puedes hablar conmigo por micrófono o escribir tus dudas operativas.\n• [A] Analizar el riesgo: Responderé cada consulta aplicando la Estructura CAPA (Conectar, Analizar, Protocolo y Asegurar) para garantizar la máxima seguridad en tienda y taller.\n• [P] Protocolo SAC: Consulta sobre armazones, calor, lunas, garantías o entra al "Simulador de Roleplay" para practicar con clientes reales y medir tu asertividad.\n• [A] Asegurar y Acordar: Si el caso presenta señales críticas o riesgo alto, recuerda siempre la regla de oro: ¡pausa y escala antes de continuar!`,
      riskLevel: "bajo",
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeech = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Text-To-Speech (Voz más humana y diferenciada para SACI y clientes)
  const speakText = useCallback(
    (
      textToSpeak: string,
      options?: { gender?: "male" | "female"; pitch?: number; rate?: number }
    ) => {
      if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      try {
        stopSpeech();
        const cleaned = cleanTextForSpeech(textToSpeak);
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = "es-ES";

        // Cadencia más humana, cálida y deliberada (evita sonido robótico apresurado)
        utterance.rate = options?.rate ?? 0.94;
        utterance.pitch =
          options?.pitch ??
          (options?.gender === "female" ? 1.05 : options?.gender === "male" ? 0.93 : 0.98);

        // Seleccionar la mejor voz humana/neural según género o coach
        const voices = window.speechSynthesis.getVoices();
        const chosenVoice = findBestSpeechVoice(voices, options?.gender);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [voiceEnabled, stopSpeech]
  );

  // Reproducir grabación humana real si está disponible, con fallback automático a síntesis
  const playAudioWithFallback = useCallback(
    (
      audioUrl: string | null,
      fallbackText: string,
      options?: { gender?: "male" | "female"; pitch?: number; rate?: number }
    ) => {
      stopSpeech();
      if (!voiceEnabled || typeof window === "undefined") return;

      const preferReal = window.localStorage.getItem("sac-voice-mode") !== "tts-only";
      if (preferReal && audioUrl) {
        try {
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            audioPlayerRef.current = null;
          };
          audio.onerror = () => {
            audioPlayerRef.current = null;
            speakText(fallbackText, options);
          };
          audio.play().catch(() => {
            speakText(fallbackText, options);
          });
          return;
        } catch {
          speakText(fallbackText, options);
          return;
        }
      }

      speakText(fallbackText, options);
    },
    [voiceEnabled, speakText, stopSpeech]
  );

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      if (prev) stopSpeech();
      return !prev;
    });
  }, [stopSpeech]);

  // Speech-To-Text (Microphone input)
  const startListening = useCallback(
    (targetMode: "chat" | "roleplay") => {
      if (typeof window === "undefined") return;
      const win = window as unknown as WindowWithSpeech;
      const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        setSpeechFeedback("Tu navegador no soporta entrada de voz directa. Puedes escribir normalmente.");
        return;
      }

      try {
        stopSpeech();
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = "es-ES";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechFeedback("🎙️ Escuchando tu voz... Habla claro");
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }
          const text = final || interim;
          if (targetMode === "chat") {
            setInput(text);
          } else {
            setRoleplayInput(text);
          }
        };

        recognition.onerror = (event: { error: string }) => {
          setIsListening(false);
          if (event.error === "not-allowed") {
            setSpeechFeedback("Acceso al micrófono denegado. Habilita permisos en el navegador.");
          } else if (event.error !== "no-speech") {
            setSpeechFeedback(`Aviso de voz: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setSpeechFeedback(null);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("SpeechRecognition start error:", err);
        setIsListening(false);
      }
    },
    [stopSpeech]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setSpeechFeedback(null);
    }
  }, [isListening]);

  useEffect(() => {
    if (open && mode === "chat") {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, mode]);

  if (!open) return null;

  // Ask question in Chat Mode
  const ask = (raw: string) => {
    const question = raw.trim();
    if (!question) return;

    stopListening();

    const result = querySaciBrain(question);
    const risk = detectRiskLevel(result.response);
    const displayResponse = result.response.replace(/^SAC indica:\s*/i, "SAC te dice:\n");

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: question },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: displayResponse,
        related: result.relatedModuleIds,
        riskLevel: risk,
      },
    ]);

    setActiveSuggestions(getContextualSuggestions(question));
    setInput("");

    // Speak SACI's reply with warm coaching voice
    speakText(displayResponse);
  };

  // Evaluate Student in Roleplay Mode
  const handleEvaluateRoleplay = () => {
    const text = roleplayInput.trim();
    if (!text) return;

    setEvaluating(true);
    stopListening();

    const scenario = ROLEPLAY_SCENARIOS[activeScenarioIdx];
    const evaluation = evaluateStudentResponse(text, scenario, userName);

    setTimeout(() => {
      setRoleplayEvaluation(evaluation);
      setEvaluating(false);
      setShowIdealExample(false);

      // Speak feedback
      speakText(evaluation.coachComment);

      // Reward XP if good score
      if (evaluation.score >= 65 && onRewardXp) {
        onRewardXp(30, `¡Roleplay "${scenario.title}" superado con ${evaluation.score}/100!`);
      }
    }, 450);
  };

  const handleResetRoleplay = () => {
    setRoleplayInput("");
    setRoleplayEvaluation(null);
    setShowIdealExample(false);
    stopSpeech();
  };

  const currentScenario = ROLEPLAY_SCENARIOS[activeScenarioIdx];

  // Flash practice cards
  const flashCards = [
    {
      title: "Regla de los 10 segundos en Recepción",
      question: "¿Qué debes hacer en los primeros 10 segundos en que el cliente se acerca al mostrador?",
      answer:
        "Contacto visual inmediato, saludo cálido con sonrisa y recepción del armazón con ambas manos sobre la bandeja acolchada antes de iniciar preguntas.",
      capaPillar: "[C] Conectar",
    },
    {
      title: "Fórmula del Sándwich para Decir NO",
      question: "¿Cómo estructurar una negativa sin que el cliente se sienta rechazado?",
      answer:
        "1. Pan inicial: Validar su molestia ('Entiendo perfectamente'). 2. Contenido del límite: Explicar el riesgo físico sin culpar. 3. Pan de cierre: Ofrecer 2 alternativas viables.",
      capaPillar: "[P] Protocolo",
    },
    {
      title: "Peligro Crítico en Acetato Cristalizado",
      question: "¿Por qué está estrictamente prohibido usar pistola de calor si el acetato está blanco/opaco?",
      answer:
        "Porque la evaporación de plastificantes hace que el calor expanda gases internos y la pieza se fracture al mínimo amoldamiento.",
      capaPillar: "[A] Analizar",
    },
    {
      title: "Garantía de Lunas vs. Micro-rayas",
      question: "¿Qué le dices al paciente si exige garantía gratis por rayas causadas por limpiar con la camisa?",
      answer:
        "Explicar con luz rasante que la garantía cubre desprendimiento de película de fábrica, no abrasión mecánica por polvo seco; ofrecer pulido ultrasónico de cortesía y 50% de reposición.",
      capaPillar: "[A2] Asegurar",
    },
  ];

  const currentFlash = flashCards[flashIdx];

  return (
    <div className="coach-panel" role="dialog" aria-modal="true" aria-labelledby="coach-title">
      {/* Header con vida, animaciones de voz y presencia activa */}
      <header>
        <div className="coach-header-avatar-wrap">
          <SaciAvatar
            className={`coach-header-avatar ${isSpeaking ? "speaking-pulse" : isListening ? "listening-pulse" : ""}`}
            alt="SACI, mascota del Área de SAC"
          />
          {isSpeaking && (
            <div className="coach-equalizer-mini" title="SACI está hablando">
              <span className="eq-bar eq-1" />
              <span className="eq-bar eq-2" />
              <span className="eq-bar eq-3" />
            </div>
          )}
        </div>

        <div>
          <div className="coach-header-meta">
            <div className="coach-live-badge">
              {isListening ? (
                <span className="status-pill listening">
                  <span className="pulse-dot red" /> Escuchándote...
                </span>
              ) : isSpeaking ? (
                <span className="status-pill speaking">
                  <Volume2 /> Hablando con voz
                </span>
              ) : (
                <span className="status-pill online">
                  <span className="pulse-dot green" /> Coach En Vivo
                </span>
              )}
            </div>
          </div>
          <h2 id="coach-title">SACI</h2>
          <strong className="coach-role">Coach de servicio al cliente</strong>
          <small>
            <i>•</i> Acompañamiento y práctica interactiva · {firstName}
          </small>
        </div>

        <div className="coach-header-actions">
          <button
            type="button"
            className={`icon-button ${voiceEnabled ? "voice-active" : "voice-muted"}`}
            onClick={toggleVoice}
            title={voiceEnabled ? "Silenciar voz de SACI" : "Activar voz de SACI"}
            aria-label={voiceEnabled ? "Silenciar voz" : "Activar voz"}
          >
            {voiceEnabled ? <Volume2 /> : <VolumeX />}
          </button>
          {isSpeaking && (
            <button
              type="button"
              className="icon-button stop-btn"
              onClick={stopSpeech}
              title="Detener voz hablada"
              aria-label="Detener voz"
            >
              <Square />
            </button>
          )}
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              stopSpeech();
              stopListening();
              onClose();
            }}
            aria-label="Cerrar asistente SACI"
          >
            <X />
          </button>
        </div>
      </header>

      {/* Selector de Modos de Coaching */}
      <nav className="coach-mode-tabs" aria-label="Modos de coaching">
        <button
          type="button"
          className={`coach-mode-tab ${mode === "chat" ? "active" : ""}`}
          onClick={() => {
            setMode("chat");
            stopSpeech();
          }}
        >
          <MessageCircle />
          <span>Consulta CAPA</span>
        </button>
        <button
          type="button"
          className={`coach-mode-tab ${mode === "roleplay" ? "active" : ""}`}
          onClick={() => {
            setMode("roleplay");
            stopSpeech();
          }}
        >
          <Theater />
          <span>Simulador Roleplay</span>
          <span className="mode-badge-new">En vivo</span>
        </button>
        <button
          type="button"
          className={`coach-mode-tab ${mode === "flash" ? "active" : ""}`}
          onClick={() => {
            setMode("flash");
            stopSpeech();
          }}
        >
          <Zap />
          <span>Retos Flash</span>
        </button>
      </nav>

      {/* AVISO DE VOZ / RECONOCIMIENTO */}
      {speechFeedback && (
        <div className="coach-speech-alert" role="status">
          <span>{speechFeedback}</span>
          <button type="button" onClick={() => setSpeechFeedback(null)}>
            <X />
          </button>
        </div>
      )}

      {/* MODO 1: CHAT Y CONSULTA CAPA */}
      {mode === "chat" && (
        <>
          <div className="coach-scope">
            <ShieldAlert />
            <span><strong>SAC te dice:</strong> Habla con tu micrófono o escribe. Respuestas bajo metodología CAPA con voz humana y personalizada.</span>
          </div>

          <div className="chat-feed" aria-live="polite">
            {messages.map((message) => {
              if (message.role === "user") {
                return (
                  <article key={message.id} className="user">
                    <span>{firstName.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <p>{message.text}</p>
                    </div>
                  </article>
                );
              }

              const parsed = parseCapa(message.text);

              return (
                <article key={message.id} className="assistant">
                  <SaciAvatar className="chat-saci-avatar" alt="SACI, mascota del Área de SAC" />
                  <div>
                    <div className="msg-toolbar">
                      <button
                        type="button"
                        className="msg-speech-play-btn"
                        onClick={() => {
                          const realAudio = message.id === "welcome" ? getRealAudioUrl("saci-welcome") : null;
                          playAudioWithFallback(realAudio, message.text);
                        }}
                        title="Escuchar respuesta con la voz de SACI"
                      >
                        <Play /> Escuchar voz de SACI
                      </button>
                    </div>

                    {parsed.isCapa ? (
                      <div className="capa-container">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="capa-protocol-tag">
                            <Sparkles /> SAC te dice · Protocolo CAPA
                          </span>
                          {message.riskLevel && (
                            <span className={`capa-risk-indicator ${message.riskLevel}`}>
                              {message.riskLevel === "alto" && <AlertTriangle style={{ width: 10 }} />}
                              Riesgo {message.riskLevel}
                            </span>
                          )}
                        </div>
                        {parsed.steps.map((step, idx) => {
                          const stepClass = step.letter.toLowerCase();
                          const StepIcon =
                            step.letter === "C"
                              ? UserCheck
                              : step.letter === "A"
                                ? Search
                                : step.letter === "P"
                                  ? ShieldCheck
                                  : CheckCircle2;
                          return (
                            <div key={idx} className={`capa-card ${stepClass}`}>
                              <div className={`capa-step-head ${stepClass}`}>
                                <span className={`capa-badge-pill ${stepClass}`}>
                                  {step.letter === "A2" ? "A" : step.letter}
                                </span>
                                <StepIcon style={{ width: 11, height: 11 }} />
                                <span>{step.title}</span>
                              </div>
                              <p className="capa-card-body">{step.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>{message.text.replace(/^SAC indica:/, "SAC te dice:")}</p>
                    )}

                    {message.related && message.related.length > 0 && (
                      <small>
                        Módulos SAC relacionados:{" "}
                        {message.related.map((id) => id.replace("sac-0", "Módulo ")).join(", ")}
                      </small>
                    )}
                  </div>
                </article>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="chat-suggestions">
            <span className="chat-suggestions-title">Consultas operativas recomendadas:</span>
            {activeSuggestions.slice(0, 4).map((suggestion) => (
              <button key={suggestion} onClick={() => ask(suggestion)}>
                <MessageCircleQuestion />
                <span>{suggestion}</span>
                <ChevronRight />
              </button>
            ))}
          </div>

          {/* Formulario con micrófono interactivo */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
          >
            <label htmlFor="coach-input">Escribe o habla tu consulta operativa</label>

            {isListening && (
              <div className="mic-live-indicator">
                <span className="mic-pulse-ring" />
                <span className="mic-wave-bar b1" />
                <span className="mic-wave-bar b2" />
                <span className="mic-wave-bar b3" />
                <span className="mic-wave-bar b4" />
                <span className="mic-live-label">SACI te está escuchando... Di tu pregunta</span>
              </div>
            )}

            <div className="coach-input-row">
              <textarea
                id="coach-input"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 500))}
                placeholder={
                  isListening
                    ? "Habla ahora... las palabras se transcribirán aquí..."
                    : "Pregúntale a SACI o pulsa el micrófono para hablarle..."
                }
                rows={2}
              />

              <div className="coach-input-actions">
                <button
                  type="button"
                  className={`coach-mic-btn ${isListening ? "active" : ""}`}
                  onClick={() => {
                    if (isListening) stopListening();
                    else startListening("chat");
                  }}
                  title={isListening ? "Detener grabación de voz" : "Hablar con el micrófono"}
                  aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
                >
                  {isListening ? <MicOff /> : <Mic />}
                </button>

                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Enviar consulta a SACI"
                  className="coach-send-btn"
                >
                  <Send />
                </button>
              </div>
            </div>

            <div className="coach-form-foot">
              <small>{input.length}/500 caracteres · Motor CAPA y Voz SAC</small>
              {speechSupported ? (
                <span className="speech-support-badge">
                  <Mic style={{ width: 10, height: 10 }} /> Voz habilitada
                </span>
              ) : (
                <span className="speech-support-badge muted">Teclado disponible</span>
              )}
            </div>
          </form>
        </>
      )}

      {/* MODO 2: SIMULADOR DE ROLEPLAY INTERACTIVO */}
      {mode === "roleplay" && (
        <div className="roleplay-container">
          <div className="roleplay-scenario-picker">
            <span className="picker-label">Selecciona el caso a simular:</span>
            <div className="picker-scroll">
              {ROLEPLAY_SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`scenario-pill ${i === activeScenarioIdx ? "active" : ""}`}
                  onClick={() => {
                    setActiveScenarioIdx(i);
                    handleResetRoleplay();
                  }}
                >
                  <span>Caso {i + 1}</span>
                  <strong>{sc.title}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="roleplay-active-card">
            <div className="customer-bubble-header">
              <div className="customer-avatar-tag">
                <div className="customer-face-icon">
                  {currentScenario.customerGender === "male" ? "👨‍💼" : "👩‍💼"}
                </div>
                <div>
                  <strong>{currentScenario.customerName}</strong>
                  <span className="customer-role-badge">
                    {currentScenario.customerRoleLabel}
                  </span>
                  <small className="customer-mood-tag">{currentScenario.customerMood}</small>
                </div>
              </div>
              <button
                type="button"
                className={`customer-audio-btn ${currentScenario.customerGender}`}
                onClick={() =>
                  playAudioWithFallback(
                    getRealAudioForScenario(currentScenario.id),
                    currentScenario.customerSpeech,
                    {
                      gender: currentScenario.customerGender,
                      rate: 0.96,
                      pitch: currentScenario.customerGender === "male" ? 0.92 : 1.07,
                    }
                  )
                }
                title={`Escuchar a ${currentScenario.customerName}`}
              >
                <Volume2 />
                <span>
                  {currentScenario.customerGender === "male" ? "Voz Señor" : "Voz Señora"} ({currentScenario.customerName.split(" ")[0]})
                </span>
              </button>
            </div>

            <div className="customer-speech-quote">
              <p>&ldquo;{currentScenario.customerSpeech}&rdquo;</p>
            </div>

            <div className="roleplay-context-box">
              <strong>Contexto técnico:</strong>
              <p>{currentScenario.situationContext}</p>
              <small className="key-rule-badge">
                <ShieldCheck /> {currentScenario.keyRule}
              </small>
            </div>
          </div>

          {/* EVALUACIÓN O RESPUESTA DEL ALUMNO */}
          {!roleplayEvaluation ? (
            <div className="roleplay-action-area">
              <div className="roleplay-prompt-header">
                <strong>Tu turno de responder como Asesor SAC:</strong>
                <span className="coach-tip-hint">Aplica los 4 pasos CAPA y la técnica del sándwich</span>
              </div>

              {isListening && (
                <div className="mic-live-indicator">
                  <span className="mic-pulse-ring" />
                  <span className="mic-wave-bar b1" />
                  <span className="mic-wave-bar b2" />
                  <span className="mic-wave-bar b3" />
                  <span className="mic-wave-bar b4" />
                  <span className="mic-live-label">Habla como si tuvieras al cliente al frente...</span>
                </div>
              )}

              <textarea
                value={roleplayInput}
                onChange={(e) => setRoleplayInput(e.target.value)}
                placeholder="Ej.: 'Comprendo su prisa, Ing. Mendoza. Al haber una fisura, el calor partiría el armazón de inmediato. Le ofrezco dos alternativas seguras...'"
                rows={4}
                className="roleplay-textarea"
              />

              <div className="roleplay-buttons-row">
                <button
                  type="button"
                  className={`roleplay-mic-large ${isListening ? "active" : ""}`}
                  onClick={() => {
                    if (isListening) stopListening();
                    else startListening("roleplay");
                  }}
                >
                  {isListening ? <MicOff /> : <Mic />}
                  <span>{isListening ? "Detener voz" : "Responder por Micrófono"}</span>
                </button>

                <button
                  type="button"
                  className="roleplay-submit-btn"
                  disabled={!roleplayInput.trim() || evaluating}
                  onClick={handleEvaluateRoleplay}
                >
                  <Sparkles />
                  <span>{evaluating ? "Evaluando con CAPA..." : "Evaluar mi respuesta"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="roleplay-result-card" aria-live="polite">
              <div className="result-hero">
                <div className={`score-badge ${roleplayEvaluation.medal.toLowerCase()}`}>
                  <Award />
                  <div>
                    <span className="score-num">{roleplayEvaluation.score}</span>
                    <span className="score-max">/ 100</span>
                  </div>
                </div>
                <div>
                  <span className="medal-tag">Medalla de {roleplayEvaluation.medal}</span>
                  <h3>{roleplayEvaluation.levelTitle}</h3>
                  <p className="coach-eval-text">{roleplayEvaluation.coachComment}</p>
                </div>
              </div>

              <div className="result-pillars-grid">
                <div className={`pillar-pill ${roleplayEvaluation.capaBreakdown.conectar.passed ? "pass" : "fail"}`}>
                  <div className="pillar-head">
                    <UserCheck /> <strong>[C] Conectar</strong>
                    <span>{roleplayEvaluation.capaBreakdown.conectar.score}/25</span>
                  </div>
                  <small>{roleplayEvaluation.capaBreakdown.conectar.tip}</small>
                </div>

                <div className={`pillar-pill ${roleplayEvaluation.capaBreakdown.analizar.passed ? "pass" : "fail"}`}>
                  <div className="pillar-head">
                    <Search /> <strong>[A] Analizar</strong>
                    <span>{roleplayEvaluation.capaBreakdown.analizar.score}/25</span>
                  </div>
                  <small>{roleplayEvaluation.capaBreakdown.analizar.tip}</small>
                </div>

                <div className={`pillar-pill ${roleplayEvaluation.capaBreakdown.protocolo.passed ? "pass" : "fail"}`}>
                  <div className="pillar-head">
                    <ShieldCheck /> <strong>[P] Protocolo</strong>
                    <span>{roleplayEvaluation.capaBreakdown.protocolo.score}/25</span>
                  </div>
                  <small>{roleplayEvaluation.capaBreakdown.protocolo.tip}</small>
                </div>

                <div className={`pillar-pill ${roleplayEvaluation.capaBreakdown.asegurar.passed ? "pass" : "fail"}`}>
                  <div className="pillar-head">
                    <CheckCircle2 /> <strong>[A] Asegurar</strong>
                    <span>{roleplayEvaluation.capaBreakdown.asegurar.score}/25</span>
                  </div>
                  <small>{roleplayEvaluation.capaBreakdown.asegurar.tip}</small>
                </div>
              </div>

              {roleplayEvaluation.strengths.length > 0 && (
                <div className="result-strengths-box">
                  <strong>Puntos fuertes detectados:</strong>
                  <ul>
                    {roleplayEvaluation.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="result-tip-box">
                <Flame />
                <div>
                  <strong>Consejo clave del Coach SACI:</strong>
                  <p>{roleplayEvaluation.recommendedAdjustment}</p>
                </div>
              </div>

              {showIdealExample ? (
                <div className="ideal-example-box">
                  <strong>Respuesta recomendada paso a paso:</strong>
                  <pre>{roleplayEvaluation.idealExample}</pre>
                </div>
              ) : (
                <button
                  type="button"
                  className="show-ideal-btn"
                  onClick={() => setShowIdealExample(true)}
                >
                  <Sparkles /> Ver respuesta modelo ideal de SACI
                </button>
              )}

              <div className="roleplay-next-actions">
                <button type="button" className="btn-secondary" onClick={handleResetRoleplay}>
                  <RotateCcw /> Reintentar este caso
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const nextIdx = (activeScenarioIdx + 1) % ROLEPLAY_SCENARIOS.length;
                    setActiveScenarioIdx(nextIdx);
                    handleResetRoleplay();
                  }}
                >
                  <span>Siguiente caso de cliente</span>
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO 3: RETOS FLASH DE ENTRENAMIENTO */}
      {mode === "flash" && (
        <div className="flash-container">
          <div className="flash-header">
            <span className="eyebrow">ENTRENAMIENTO RELÁMPAGO · AGILIDAD DE MOSTRADOR</span>
            <h3>Reto {flashIdx + 1} de {flashCards.length}: {currentFlash.title}</h3>
            <span className="capa-pillar-badge">{currentFlash.capaPillar}</span>
          </div>

          <div className="flash-card-body">
            <div className="flash-question-box">
              <MessageCircleQuestion />
              <p>{currentFlash.question}</p>
            </div>

            {flashRevealed ? (
              <div className="flash-answer-revealed">
                <div className="revealed-header">
                  <Sparkles /> <strong>Respuesta Asertiva del Coach SACI:</strong>
                </div>
                <p>{currentFlash.answer}</p>
                <button
                  type="button"
                  className="flash-voice-listen"
                  onClick={() => speakText(currentFlash.answer)}
                >
                  <Volume2 /> Escuchar con la voz de SACI
                </button>
              </div>
            ) : (
              <div className="flash-prompt-action">
                <p className="flash-think-prompt">
                  Piensa cómo lo dirías verbalmente al cliente antes de voltear la tarjeta.
                </p>
                <button
                  type="button"
                  className="flash-reveal-btn"
                  onClick={() => {
                    setFlashRevealed(true);
                    speakText(currentFlash.answer);
                  }}
                >
                  <span>Revelar técnica y escuchar a SACI</span>
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>

          <div className="flash-nav-row">
            <button
              type="button"
              className="flash-nav-btn"
              disabled={flashIdx === 0}
              onClick={() => {
                setFlashIdx((p) => p - 1);
                setFlashRevealed(false);
                stopSpeech();
              }}
            >
              Anterior
            </button>
            <span className="flash-counter">{flashIdx + 1} / {flashCards.length}</span>
            <button
              type="button"
              className="flash-nav-btn primary"
              onClick={() => {
                setFlashIdx((p) => (p + 1) % flashCards.length);
                setFlashRevealed(false);
                stopSpeech();
              }}
            >
              {flashIdx + 1 === flashCards.length ? "Volver al inicio" : "Siguiente reto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
