"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Gamepad2,
  Glasses,
  LockKeyhole,
  LogIn,
  LogOut,
  Medal,
  MessageCircle,
  MoveRight,
  Printer,
  Send,
  ShieldCheck,
  Target,
  Trophy,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Role = "Asesor" | "Optómetra";
type View = "inicio" | "academia" | "retos" | "ranking" | "ficha";
type Session = { name: string; role: Role; store: string; code: string };
type RegisteredUser = Session & { pin: string };

const quickAnswers: Record<string, string> = {
  "El cliente no quiere firmar":
    "SAC indica: no presione al cliente. Explique que la firma registra el estado del armazón y la información entregada. Responda sus preguntas. Si mantiene su negativa, no continúe la recepción y solicite apoyo al responsable del local.",
  "El armazón tiene más de 2 años":
    "SAC indica: realice una revisión especial. Consulte reparaciones, verifique fisuras, bisagras, puente y varillas, tome fotografías y explique que la antigüedad puede reducir la resistencia del material. Si existe deterioro, escale antes de recibir.",
  "El armazón se rompió":
    "SAC indica: mantenga la calma. No culpe al cliente ni asuma responsabilidades. Suspenda el proceso, conserve las evidencias, registre el estado y la secuencia de lo ocurrido, informe al responsable del local y escale el caso al Área de SAC.",
  "El cliente está molesto":
    "SAC indica: escuche sin interrumpir, valide la preocupación y explique el siguiente paso concreto. Puede decir: «Comprendo su preocupación. Voy a revisar lo ocurrido y solicitar apoyo para darle una respuesta correcta». Evite discutir o prometer una solución no autorizada.",
  "Encontré una fisura":
    "SAC indica: muestre la fisura al cliente, fotografíela de cerca y en contexto, registre su ubicación, clasifique el caso como riesgo alto y solicite validación. La firma del cliente no reemplaza el escalamiento.",
  "¿Cuándo debo escalar?":
    "SAC indica: escale cuando existan fisuras, trizaduras, soldaduras, deformación severa, material quebradizo, piezas críticas flojas, dudas sobre la seguridad del proceso o desacuerdo del cliente con la condición registrada.",
};

function coachReply(text: string) {
  const q = text.toLowerCase();
  if (/no.*firm|rechaza.*firma/.test(q))
    return quickAnswers["El cliente no quiere firmar"];
  if (/rompi|quebr|triz.*proceso/.test(q))
    return quickAnswers["El armazón se rompió"];
  if (/molest|enoj|grit|reclamo/.test(q))
    return quickAnswers["El cliente está molesto"];
  if (/fisur|soldadur|grieta/.test(q))
    return quickAnswers["Encontré una fisura"];
  if (/antigu|años|tiempo de uso/.test(q))
    return quickAnswers["El armazón tiene más de 2 años"];
  if (/escal|autoriza|responsable/.test(q))
    return quickAnswers["¿Cuándo debo escalar?"];
  if (/calor|calent/.test(q))
    return "SAC indica: explique que, según el material, diseño y condición, puede ser necesario aplicar calor controlado para ciertos ajustes. No afirme que siempre se aplica ni garantice que el armazón no tendrá una reacción.";
  if (/qué digo|como le digo|explicar/.test(q))
    return "SAC indica: use esta estructura: 1) explique que revisará el estado, 2) muestre las novedades, 3) describa la manipulación posible, 4) informe los riesgos sin alarmar, 5) confirme preguntas y 6) solicite la aceptación.";
  return "SAC necesita tres datos para orientarle: antigüedad aproximada, novedad visible y procedimiento solicitado. Mientras exista una duda técnica o un cliente inconforme, detenga la recepción y solicite validación al responsable del local o al Área de SAC.";
}

function LoginOverlay({ onLogin }: { onLogin: (session: Session) => void }) {
  const [role, setRole] = useState<Role>("Asesor");
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().split(/\s+/).length < 2)
      return setError("Ingrese nombres y apellidos completos.");
    if (store.trim().length < 3)
      return setError("Seleccione o escriba el local correspondiente.");
    if (!/^[A-Z0-9-]{4,12}$/i.test(code.trim()))
      return setError("El código debe tener entre 4 y 12 caracteres.");
    if (!/^\d{4}$/.test(pin))
      return setError("El PIN debe contener exactamente 4 números.");
    const normalizedCode = code.trim().toUpperCase();
    let registered: RegisteredUser[] = [];
    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("sac-registered-users") ?? "[]",
      );
      if (Array.isArray(savedUsers)) registered = savedUsers;
    } catch {
      localStorage.removeItem("sac-registered-users");
    }
    const existing = registered.find((user) => user.code === normalizedCode);
    if (existing) {
      if (existing.pin !== pin)
        return setError("El PIN no corresponde al código ingresado.");
      if (existing.role !== role)
        return setError(`Este código está registrado como ${existing.role}.`);
      if (existing.name.toLowerCase() !== name.trim().toLowerCase())
        return setError("El código ya pertenece a otro nombre registrado.");
      const { pin: _savedPin, ...restoredSession } = existing;
      localStorage.setItem(
        "sac-validated-session",
        JSON.stringify(restoredSession),
      );
      return onLogin(restoredSession);
    }
    const session: RegisteredUser = {
      name: name.trim(),
      role,
      store: store.trim(),
      code: normalizedCode,
      pin,
    };
    localStorage.setItem(
      "sac-registered-users",
      JSON.stringify([...registered, session]),
    );
    const { pin: _newPin, ...validatedSession } = session;
    localStorage.setItem(
      "sac-validated-session",
      JSON.stringify(validatedSession),
    );
    onLogin(validatedSession);
  };
  return (
    <div className="login-overlay">
      <div className="login-visual">
        <div className="login-brand">
          <div>
            <ShieldCheck />
          </div>
          <span>ACADEMIA SAC</span>
        </div>
        <div className="login-copy">
          <span>ACCESO INTERNO</span>
          <h1>Aprender para recibir con seguridad.</h1>
          <p>Formación, práctica y respaldo para asesores y optómetras.</p>
          <div className="login-points">
            <div>
              <CheckCircle2 />
              <span>Rutas por cargo</span>
            </div>
            <div>
              <Trophy />
              <span>Niveles y reconocimientos</span>
            </div>
            <div>
              <MessageCircle />
              <span>Coach disponible</span>
            </div>
          </div>
        </div>
        <img
          src="/training/ola-coach-mascot.png"
          alt="SACI, mascota del Área de SAC"
        />
      </div>
      <form className="login-card" onSubmit={submit}>
        <div className="login-card-head">
          <div className="login-lock">
            <LockKeyhole />
          </div>
          <div>
            <span>VALIDACIÓN ÁREA DE SAC</span>
            <h2>Ingrese a Academia SAC</h2>
            <p>El código no se duplicará si ya existe un perfil.</p>
          </div>
        </div>
        <div className="role-login">
          <button
            type="button"
            className={role === "Asesor" ? "active" : ""}
            onClick={() => setRole("Asesor")}
          >
            <UserCheck />
            <span>
              <strong>Asesor</strong>Ruta comercial y recepción
            </span>
          </button>
          <button
            type="button"
            className={role === "Optómetra" ? "active" : ""}
            onClick={() => setRole("Optómetra")}
          >
            <Medal />
            <span>
              <strong>Optómetra</strong>Ruta técnica y validación
            </span>
          </button>
        </div>
        <label>
          <span>Nombres y apellidos</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Andrea López"
            autoComplete="name"
          />
        </label>
        <label>
          <span>Local</span>
          <Input
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="Ej. CCI"
          />
        </label>
        <div className="login-fields">
          <label>
            <span>Código de colaborador</span>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SAC-0000"
            />
          </label>
          <label>
            <span>PIN de acceso</span>
            <Input
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              type="password"
              inputMode="numeric"
            />
          </label>
        </div>
        {error && (
          <div className="login-error">
            <AlertTriangle />
            {error}
          </div>
        )}
        <Button type="submit" className="login-button">
          <LogIn />
          Validar e ingresar
          <MoveRight />
        </Button>
        <p className="login-note">
          <ShieldCheck />
          Si el código ya está registrado, se recuperará el mismo usuario al
          validar su PIN. No se crearán perfiles repetidos.
        </p>
      </form>
    </div>
  );
}

function CoachBot({
  role,
  session,
  onCertificate,
  onLogout,
}: {
  role: Role;
  session: Session | null;
  onCertificate: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { who: "bot" | "user"; text: string }[]
  >([
    {
      who: "bot",
      text: "Hola, soy SACI, su asistente de Servicio, Acompañamiento y Coaching Inteligente. SAC puede ayudarle a explicar el proceso, manejar una conversación difícil o decidir cuándo escalar.",
    },
  ]);
  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [
      ...m,
      { who: "user", text: clean },
      { who: "bot", text: coachReply(clean) },
    ]);
    setInput("");
  };
  return (
    <>
      <button
        className={`mascot-launcher ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir coach de recepción"
      >
        <span className="mascot-status" />
        <img src="/training/ola-coach-mascot.png" alt="" />
        <b>{open ? <X /> : <MessageCircle />}</b>
        <em>¿Necesita ayuda?</em>
      </button>
      {open && (
        <aside className="coach-panel glass-card">
          <header>
            <img src="/training/ola-coach-mascot.png" alt="SACI" />
            <div>
              <span>ASISTENTE DEL ÁREA DE SAC</span>
              <h3>SACI · Coach de Servicio al Cliente</h3>
              <p>
                <i />
                Disponible para {role.toLowerCase()}s
              </p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </header>
          <div className="coach-context">
            <ShieldCheck />
            <span>
              <strong>{session?.name ?? "Colaborador SAC"}</strong>
              {session?.store ?? "Sesión validada"}
            </span>
            <button onClick={onCertificate}>
              <Printer />
              Certificado
            </button>
            <button onClick={onLogout} className="coach-logout">
              <LogOut />
              Salir
            </button>
          </div>
          <div className="coach-messages">
            {messages.map((m, i) => (
              <div className={`coach-message ${m.who}`} key={i}>
                {m.who === "bot" && <Bot />}
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <div className="quick-help">
            <span>PREGUNTAS RÁPIDAS</span>
            <div>
              {Object.keys(quickAnswers).map((q) => (
                <button key={q} onClick={() => send(q)}>
                  {q}
                  <ChevronRight />
                </button>
              ))}
            </div>
          </div>
          <form
            className="coach-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escriba lo que está ocurriendo…"
            />
            <button type="submit" aria-label="Enviar pregunta">
              <Send />
            </button>
          </form>
          <footer>
            <AlertTriangle />
            SAC indica: ante un riesgo o reclamo, detenga el proceso y escale.
          </footer>
        </aside>
      )}
    </>
  );
}

function ExtraChallenges({
  visible,
  onAward,
}: {
  visible: boolean;
  onAward: (message: string, xp: number, coins: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState<"menu" | "orden" | "mensaje" | "checklist">(
    "menu",
  );
  const [order, setOrder] = useState<string[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [ticks, setTicks] = useState<number[]>([]);
  const [won, setWon] = useState<string[]>([]);
  const steps = [
    "Revisar",
    "Mostrar novedades",
    "Explicar el proceso",
    "Registrar evidencia",
    "Confirmar comprensión",
    "Firmar",
  ];
  const scrambled = [
    "Firmar",
    "Registrar evidencia",
    "Revisar",
    "Confirmar comprensión",
    "Mostrar novedades",
    "Explicar el proceso",
  ];
  const finish = (id: string, xp: number) => {
    if (!won.includes(id)) {
      setWon((v) => [...v, id]);
      onAward("Reto superado", xp, Math.round(xp / 3));
    }
  };
  const addStep = (s: string) => {
    const next = [...order, s];
    setOrder(next);
    if (s !== steps[order.length]) {
      setTimeout(() => setOrder([]), 650);
    } else if (next.length === steps.length) finish("orden", 120);
  };
  if (!visible) return null;
  return (
    <>
      <button className="extra-challenge-dock" onClick={() => setOpen(true)}>
        <span>
          <Gamepad2 />
        </span>
        <div>
          <strong>3 retos nuevos</strong>
          <small>Hasta 310 XP disponibles</small>
        </div>
        <ChevronRight />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="challenge-dialog glass-modal">
          <DialogHeader>
            <DialogTitle>Centro de desafíos</DialogTitle>
            <DialogDescription>
              Practique conversaciones y decisiones que ocurren durante la
              recepción.
            </DialogDescription>
          </DialogHeader>
          {game === "menu" && (
            <div className="challenge-menu">
              {[
                {
                  id: "orden",
                  icon: ClipboardCheck,
                  title: "Ordene el protocolo",
                  text: "Construya la secuencia correcta de atención.",
                  xp: 120,
                },
                {
                  id: "mensaje",
                  icon: MessageCircle,
                  title: "Elija qué decir",
                  text: "Responda profesionalmente a un cliente inconforme.",
                  xp: 100,
                },
                {
                  id: "checklist",
                  icon: Target,
                  title: "Checklist contrarreloj",
                  text: "Identifique los controles indispensables.",
                  xp: 90,
                },
              ].map((c) => (
                <button key={c.id} onClick={() => setGame(c.id as typeof game)}>
                  <span>
                    <c.icon />
                  </span>
                  <div>
                    <small>+{c.xp} XP</small>
                    <strong>{c.title}</strong>
                    <p>{c.text}</p>
                  </div>
                  {won.includes(c.id) ? (
                    <CheckCircle2 className="won" />
                  ) : (
                    <ChevronRight />
                  )}
                </button>
              ))}
            </div>
          )}
          {game === "orden" && (
            <div className="challenge-play">
              <div className="play-head">
                <button
                  onClick={() => {
                    setGame("menu");
                    setOrder([]);
                  }}
                >
                  ← Retos
                </button>
                <span>{order.length}/6 pasos</span>
              </div>
              <h3>Seleccione los pasos en el orden correcto</h3>
              <div className="selected-order">
                {steps.map((_, i) => (
                  <span className={order[i] ? "filled" : ""} key={i}>
                    {order[i] ?? i + 1}
                  </span>
                ))}
              </div>
              <div className="step-options">
                {scrambled
                  .filter((s) => !order.includes(s))
                  .map((s) => (
                    <button key={s} onClick={() => addStep(s)}>
                      {s}
                    </button>
                  ))}
              </div>
              {order.length === steps.length && (
                <div className="challenge-win">
                  <Trophy />
                  <strong>¡Secuencia perfecta!</strong>
                  <span>+120 XP</span>
                </div>
              )}
            </div>
          )}
          {game === "mensaje" && (
            <div className="challenge-play">
              <div className="play-head">
                <button
                  onClick={() => {
                    setGame("menu");
                    setChoice(null);
                  }}
                >
                  ← Retos
                </button>
                <span>Conversación 1/1</span>
              </div>
              <div className="client-quote">
                “No voy a firmar porque ustedes quieren evitar su
                responsabilidad.”
              </div>
              <h3>¿Qué respuesta utilizaría?</h3>
              <div className="message-options">
                {[
                  "Si no firma no podemos ayudarle.",
                  "Comprendo su inquietud. La firma registra el estado y lo que le hemos explicado; permítame aclarar cada punto antes de que decida.",
                  "Es solo un requisito, firme aquí.",
                ].map((x, i) => (
                  <button
                    className={
                      choice !== null
                        ? i === 1
                          ? "correct"
                          : i === choice
                            ? "wrong"
                            : ""
                        : ""
                    }
                    key={x}
                    onClick={() => {
                      setChoice(i);
                      if (i === 1) finish("mensaje", 100);
                    }}
                  >
                    {x}
                  </button>
                ))}
              </div>
              {choice !== null && (
                <div
                  className={`challenge-feedback ${choice === 1 ? "ok" : "bad"}`}
                >
                  {choice === 1 ? <CheckCircle2 /> : <AlertTriangle />}
                  <span>
                    {choice === 1
                      ? "Correcto: explica el propósito sin presionar."
                      : "Evite condicionar, minimizar o presionar al cliente."}
                  </span>
                </div>
              )}
            </div>
          )}
          {game === "checklist" && (
            <div className="challenge-play">
              <div className="play-head">
                <button
                  onClick={() => {
                    setGame("menu");
                    setTicks([]);
                  }}
                >
                  ← Retos
                </button>
                <span>{ticks.length}/6 controles</span>
              </div>
              <h3>Marque los controles obligatorios</h3>
              <div className="tick-grid">
                {[
                  "Antigüedad",
                  "Reparaciones",
                  "Fisuras",
                  "Fotografías",
                  "Explicación",
                  "Firma",
                  "Color de la funda",
                  "Marca de ropa",
                ].map((x, i) => (
                  <button
                    className={ticks.includes(i) ? "active" : ""}
                    onClick={() => {
                      const required = i < 6;
                      const next = ticks.includes(i)
                        ? ticks.filter((v) => v !== i)
                        : [...ticks, i];
                      setTicks(next);
                      if (
                        required &&
                        next.filter((v) => v < 6).length === 6 &&
                        !next.some((v) => v >= 6)
                      )
                        finish("checklist", 90);
                    }}
                    key={x}
                  >
                    <span>{ticks.includes(i) && <Check />}</span>
                    {x}
                  </button>
                ))}
              </div>
              {ticks.filter((v) => v < 6).length === 6 &&
                !ticks.some((v) => v >= 6) && (
                  <div className="challenge-win">
                    <Trophy />
                    <strong>Checklist completo</strong>
                    <span>+90 XP</span>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function printCertificate() {
  document.body.dataset.print = "certificate";
  window.print();
  setTimeout(() => delete document.body.dataset.print, 500);
}

function PrintableCertificate({ session }: { session: Session | null }) {
  const date = new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return (
    <section className="print-certificate">
      <div className="certificate-border">
        <div className="certificate-corner c1" />
        <div className="certificate-corner c2" />
        <div className="certificate-mark">
          <Glasses />
        </div>
        <span className="certificate-kicker">
          ÓPTICA LOS ANDES · ACADEMIA SAC
        </span>
        <h1>CERTIFICADO</h1>
        <h2>DE CAPACITACIÓN</h2>
        <p>Se otorga el presente certificado a</p>
        <strong className="certificate-name">
          {session?.name ?? "Colaborador SAC"}
        </strong>
        <p>por su participación en la ruta formativa</p>
        <h3>“Recepción Segura de Armazones”</h3>
        <div className="certificate-data">
          <span>
            <b>CARGO</b>
            {session?.role ?? "Asesor / Optómetra"}
          </span>
          <span>
            <b>LOCAL</b>
            {session?.store ?? "Óptica Los Andes"}
          </span>
          <span>
            <b>FECHA</b>
            {date}
          </span>
        </div>
        <div className="certificate-sign">
          <div>
            <strong>Área de SAC</strong>
            <span>Servicio al Cliente · Posventa y Fidelización</span>
            <small>ÓPTICA LOS ANDES</small>
          </div>
          <div className="certificate-seal">
            <ShieldCheck />
            <span>
              FORMACIÓN
              <br />
              INTERNA
            </span>
          </div>
        </div>
        <footer>
          Área de SAC · Revisar · Informar · Registrar · Confirmar
        </footer>
      </div>
    </section>
  );
}

export function AcademyEnhancements({
  view,
  role,
  setRole,
  onAward,
}: {
  view: View;
  role: Role;
  setRole: (role: Role) => void;
  onAward: (message: string, xp: number, coins: number) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("sac-validated-session");
    if (saved)
      try {
        const s = JSON.parse(saved) as Session;
        setSession(s);
        setRole(s.role);
      } catch {}
    setReady(true);
  }, [setRole]);
  useEffect(() => {
    if (!session) return;
    const profile = document.querySelector(".side-profile strong");
    if (profile) profile.textContent = session.name;
    const store = document.querySelector(".side-profile span");
    if (store) store.textContent = `${session.role} · ${session.store}`;
    if (view === "inicio") {
      const greeting = document.querySelector(".welcome-row h1");
      if (greeting)
        greeting.textContent = `Buenos días, ${session.name.split(" ")[0]} 👋`;
    }
  }, [session, view]);
  const login = (s: Session) => {
    setSession(s);
    setRole(s.role);
  };
  const logout = () => {
    localStorage.removeItem("sac-validated-session");
    setSession(null);
  };
  return (
    <>
      {ready && !session && <LoginOverlay onLogin={login} />}
      {session && (
        <CoachBot
          role={role}
          session={session}
          onCertificate={printCertificate}
          onLogout={logout}
        />
      )}
      {session && (
        <button className="session-logout" onClick={logout}>
          <LogOut />
          <span>Cerrar sesión</span>
        </button>
      )}
      {session && (view === "academia" || view === "ranking") && (
        <button className="certificate-shortcut" onClick={printCertificate}>
          <Award />
          <span>
            <strong>Imprimir certificado</strong>
            <small>Con firma institucional del Área de SAC</small>
          </span>
          <Printer />
        </button>
      )}
      <ExtraChallenges
        visible={!!session && view === "retos"}
        onAward={onAward}
      />
      <PrintableCertificate session={session} />
    </>
  );
}
