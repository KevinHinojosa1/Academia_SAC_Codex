// Motor de Coaching Interactivo y Simulación de Clientes - SACI
// Metodología CAPA: Conectar, Analizar, Protocolo, Asegurar

export interface RoleplayScenario {
  id: string;
  title: string;
  category: "Garantía de Lunas" | "Protocolo de Recepción" | "Decir NO Asertivo";
  customerName: string;
  customerGender: "male" | "female";
  customerRoleLabel: string;
  customerMood: string;
  customerSpeech: string;
  situationContext: string;
  keyRule: string;
  expectedCapa: {
    c: string;
    a: string;
    p: string;
    a2: string;
  };
  keywords: {
    conectar: string[];
    analizar: string[];
    protocolo: string[];
    asegurar: string[];
  };
  prohibitedPhrases: string[];
}

export interface RoleplayEvaluation {
  score: number; // 0 - 100
  medal: "Oro" | "Plata" | "Bronce";
  levelTitle: string;
  capaBreakdown: {
    conectar: { score: number; max: number; passed: boolean; tip: string };
    analizar: { score: number; max: number; passed: boolean; tip: string };
    protocolo: { score: number; max: number; passed: boolean; tip: string };
    asegurar: { score: number; max: number; passed: boolean; tip: string };
  };
  prohibitedUsed: string[];
  coachComment: string;
  strengths: string[];
  recommendedAdjustment: string;
  idealExample: string;
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "rp-calor-fisura",
    title: "Cliente exige calor en armazón fisurado",
    category: "Protocolo de Recepción",
    customerName: "Ing. Carlos Mendoza",
    customerGender: "male",
    customerRoleLabel: "Señor de 52 años · Ejecutivo apurado",
    customerMood: "Apurado y exigente (¡Tiene una reunión en 45 min!)",
    customerSpeech:
      "¡Señorita, tengo una reunión urgente de directorio en 45 minutos! Caliénteme este armazón de acetato con la pistola y dóblelo ya mismo, ¡no me importa la fisurita que dice que tiene, solo dóblelo!",
    situationContext:
      "El cliente llega apurado con un armazón de acetato de 3 años de uso que tiene una fisura visible en el puente superior. Exige ajuste térmico forzado.",
    keyRule:
      "Prohibido aplicar calor en fisuras o material cristalizado. Pausar, registrar evidencia y ofrecer ajuste en frío o cambio de montura.",
    expectedCapa: {
      c: "Conectar con su prisa sin discutir ni mostrar indiferencia.",
      a: "Explicar el riesgo térmico: el calor romperá la pieza irreversiblemente.",
      p: "Establecer el límite técnico y ofrecer 2 alternativas (ajuste suave en frío o cambio de montura).",
      a2: "Cerrar con acuerdo y acompañamiento prioritario.",
    },
    keywords: {
      conectar: ["entiendo", "comprendo", "prisa", "reunion", "importante", "disculpe", "tiempo"],
      analizar: ["fisura", "calor", "temperatura", "romper", "fractur", "riesgo", "cristaliz", "tension", "acetato", "seguridad"],
      protocolo: ["alternativa", "frio", "suave", "plaqueta", "cambio", "opciones", "cuidar", "evitar", "ofrezco"],
      asegurar: ["acuerdo", "parece", "procedemos", "ayudo", "inmediato", "acompan", "solucion"],
    },
    prohibitedPhrases: [
      "usted lo rompio",
      "no es mi problema",
      "no se puede y punto",
      "es su culpa",
      "no me importa",
    ],
  },
  {
    id: "rp-lunas-rayadas",
    title: "Cliente reclama garantía por lunas rayadas en seco",
    category: "Garantía de Lunas",
    customerName: "Sra. Patricia Valdivia",
    customerGender: "female",
    customerRoleLabel: "Señora de 49 años · Indignada por lunas",
    customerMood: "Indignada y a la defensiva",
    customerSpeech:
      "¡Compré estas lunas con antireflejo hace 3 meses y se ven todas rayadas y borrosas! ¡El vendedor me prometió garantía total de un año, exijo que me las cambien gratis hoy mismo!",
    situationContext:
      "Las lunas presentan micro-rayas lineales y circulares típicas de limpieza con la ropa o papel toalla seco. No hay desprendimiento de película ni craquelado de fábrica.",
    keyRule:
      "La garantía cubre defectos de manufactura (desprendimiento, craquelado), no daño abrasivo por fricción en seco. Usar técnica del sándwich.",
    expectedCapa: {
      c: "Empatizar con su incomodidad visual y validar su interés por la garantía.",
      a: "Diferenciar con tacto defecto de fabricación vs. micro-rayas por fricción mecánica de partículas.",
      p: "Ofrecer revisión bajo luz rasante, limpieza ultrasónica de cortesía y 50% de reposición por garantía.",
      a2: "Enseñar el uso del paño de microfibra húmedo y asegurar su satisfacción.",
    },
    keywords: {
      conectar: ["comprendo", "entiendo", "frustracion", "vision", "molestia", "revisar", "juntos"],
      analizar: ["garantia", "fabricacion", "defecto", "desprendimiento", "friccion", "particula", "limpieza", "seco", "microfibra", "abrasion"],
      protocolo: ["alternativa", "cortesia", "ultrason", "luz rasante", "descuento", "reposicion", "solucion", "ofrezco"],
      asegurar: ["acuerdo", "parece", "cuente con nosotros", "acompan", "solucion", "cuidado"],
    },
    prohibitedPhrases: [
      "usted las rayo",
      "eso no entra en garantia",
      "no leyó su póliza",
      "usted no sabe limpiar",
      "no es culpa nuestra",
    ],
  },
  {
    id: "rp-fotos-recepcion",
    title: "Cliente rechaza toma de fotos obligatorias",
    category: "Protocolo de Recepción",
    customerName: "Sr. Roberto Méndez",
    customerGender: "male",
    customerRoleLabel: "Señor de 61 años · Jubilado impaciente",
    customerMood: "Impaciente y desconfiado",
    customerSpeech:
      "¿Por qué se demora tanto tomándole fotos a mis lentes viejos? ¡Nunca antes en ninguna óptica me habían pedido tantas cosas, solo cámbienle las lunas y no me hagan perder el tiempo!",
    situationContext:
      "El cliente llega para cambio de lunas en su propio armazón usado y se impacienta al ver que el asesor inicia el protocolo de 4 fotos macro.",
    keyRule:
      "Las 4 fotos macro protegen al cliente y al taller registrando el estado exacto de ingreso. Explicar el beneficio para el cliente en menos de 45 segundos.",
    expectedCapa: {
      c: "Agradecer su paciencia y valorar su tiempo.",
      a: "Explicar que las fotos protegen su armazón ante cualquier percance en taller.",
      p: "Aclarar que solo toma 45 segundos y que agiliza el trabajo técnico.",
      a2: "Confirmar su consentimiento e ingresar la orden con seguridad.",
    },
    keywords: {
      conectar: ["entiendo", "tiempo", "valioso", "disculpe", "espera", "comprendo", "prisa"],
      analizar: ["proteger", "seguridad", "armazon", "taller", "registro", "ingreso", "garantizar", "evidencia", "estado"],
      protocolo: ["segundos", "rapido", "45 segundos", "prioridad", "orden", "beneficio", "cuidar"],
      asegurar: ["acuerdo", "parece", "listo", "procedemos", "gracias"],
    },
    prohibitedPhrases: [
      "es la norma y si no quiere no lo atendemos",
      "yo no hago las reglas",
      "es obligatorio y se aguanta",
      "usted desconfia",
    ],
  },
  {
    id: "rp-soldadura-titanio",
    title: "Cliente exige soldar armazón de titanio en mostrador",
    category: "Decir NO Asertivo",
    customerName: "Dr. Jorge Estrada",
    customerGender: "male",
    customerRoleLabel: "Señor de 45 años · Médico cirujano",
    customerMood: "Incrédulo y persistente",
    customerSpeech:
      "Se desoldó la patita de mi armazón de titanio. Ustedes tienen un taller en la parte posterior, ¿por qué no le ponen un punto de soldadura y me lo entregan en 10 minutos?",
    situationContext:
      "Un armazón de titanio de marca premium se fracturó en el flex. El cliente cree que con soldadura común de estaño o soplete se repara al instante.",
    keyRule:
      "El titanio requiere soldadura láser en atmósfera inerte de gas argón para no desintegrar la aleación. En mostrador está terminantemente prohibido.",
    expectedCapa: {
      c: "Conectar con su necesidad de tener sus lentes listos pronto.",
      a: "Explicar la propiedad del titanio: el calor común oxida y destruye el metal.",
      p: "Ofrecer el servicio especializado de soldadura láser en laboratorio central (48h) o reemplazo de brazo/montura.",
      a2: "Ayudarlo a elegir la opción más conveniente para su salud visual.",
    },
    keywords: {
      conectar: ["comprendo", "entiendo", "urgencia", "necesita", "lentes", "con gusto"],
      analizar: ["titanio", "laser", "argon", "temperatura", "propiedad", "quebrar", "calor", "laboratorio", "especializado", "resistencia"],
      protocolo: ["laboratorio central", "48 horas", "garantizada", "reemplazo", "opcion", "alternativa", "brazo", "ofrezco"],
      asegurar: ["acuerdo", "parece", "acompan", "cual prefiere", "coordinamos"],
    },
    prohibitedPhrases: [
      "imposible",
      "eso no se puede hacer aca",
      "compre otro mejor",
      "no insista",
    ],
  },
  {
    id: "rp-receta-vencida",
    title: "Cliente exige progresivos con receta vencida de 4 años",
    category: "Garantía de Lunas",
    customerName: "Dña. Elena Rojas",
    customerGender: "female",
    customerRoleLabel: "Señora de 58 años · Reticente a examen",
    customerMood: "Reticente a pasar por gabinete optométrico",
    customerSpeech:
      "Tengo mi receta de hace 4 años y veo perfecto con ella. No quiero pasar por refracción otra vez ni perder tiempo, hágame mis lunas progresivas con esa misma fórmula.",
    situationContext:
      "Cliente de 56 años solicita lentes progresivos de alta gama pero con una prescripción de hace 4 años sin verificar adición ni curvaturas.",
    keyRule:
      "Fabricar progresivos con fórmula desactualizada genera astenopía, mareos y rechazo de adaptación no cubiertos por garantía. Refracción de control gratuita obligatoria.",
    expectedCapa: {
      c: "Validar que se sienta cómoda con su visión y valorar su tiempo.",
      a: "Explicar que la visión intermedia y la adición cambian gradualmente; una receta desactualizada genera mareos y astenopía en progresivos.",
      p: "Ofrecer una refracción de control de cortesía de solo 10 minutos con el optómetra para asegurar su inversión.",
      a2: "Acompañarla con calidez al gabinete.",
    },
    keywords: {
      conectar: ["entiendo", "comprendo", "comoda", "tiempo", "con gusto", "valoro"],
      analizar: ["receta", "progresivo", "adicion", "cambia", "anos", "mareo", "adaptacion", "astenopia", "enfoque", "seguridad"],
      protocolo: ["refraccion", "control", "cortesia", "10 minutos", "optometra", "verificar", "garantizar", "inversion"],
      asegurar: ["acuerdo", "acompan", "pasemos", "parece", "cuidar"],
    },
    prohibitedPhrases: [
      "no le voy a vender asi",
      "su receta no sirve",
      "si no se mide no le hacemos nada",
      "sera su culpa si ve mal",
    ],
  },
];

export function evaluateStudentResponse(
  userText: string,
  scenario: RoleplayScenario,
  userName = "Colega"
): RoleplayEvaluation {
  const norm = userText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 1. Check prohibited phrases
  const prohibitedUsed: string[] = [];
  for (const phrase of scenario.prohibitedPhrases) {
    const normPhrase = phrase
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (norm.includes(normPhrase)) {
      prohibitedUsed.push(phrase);
    }
  }

  // 2. Score CAPA pillars (25 points each)
  const calcPillar = (keywords: string[], weight = 25) => {
    let hits = 0;
    for (const kw of keywords) {
      const normKw = kw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (norm.includes(normKw)) hits++;
    }
    const score = Math.min(weight, Math.round((hits / Math.min(keywords.length, 3)) * weight));
    return { score, passed: score >= 15 };
  };

  const cResult = calcPillar(scenario.keywords.conectar);
  const aResult = calcPillar(scenario.keywords.analizar);
  const pResult = calcPillar(scenario.keywords.protocolo);
  const a2Result = calcPillar(scenario.keywords.asegurar);

  let rawScore = cResult.score + aResult.score + pResult.score + a2Result.score;

  // Length penalty if too short to be a real answer
  if (userText.trim().split(/\s+/).length < 6) {
    rawScore = Math.min(rawScore, 40);
  }

  // Penalty for prohibited phrases (-20 per forbidden phrase)
  if (prohibitedUsed.length > 0) {
    rawScore = Math.max(0, rawScore - prohibitedUsed.length * 25);
  }

  const finalScore = Math.min(100, Math.max(10, rawScore));

  const medal: "Oro" | "Plata" | "Bronce" =
    finalScore >= 85 ? "Oro" : finalScore >= 65 ? "Plata" : "Bronce";

  const levelTitle =
    finalScore >= 85
      ? "Nivel Experto en Asertividad SAC"
      : finalScore >= 65
      ? "Nivel Competente · Práctica Aprobada"
      : "En Desarrollo · Requiere Ajuste Pedagógico";

  // Strengths
  const strengths: string[] = [];
  if (cResult.passed) strengths.push("Excelente empatía y validación emocional del cliente.");
  if (aResult.passed) strengths.push("Claridad técnica al explicar la causa o riesgo sin culpabilizar.");
  if (pResult.passed) strengths.push("Propuesta de alternativas concretas y protocolo de seguridad.");
  if (a2Result.passed) strengths.push("Cierre con búsqueda activa de acuerdo y acompañamiento.");
  if (prohibitedUsed.length === 0) strengths.push("Lenguaje 100% libre de frases conflictivas.");

  // Recommended adjustment
  let recommendedAdjustment = "";
  if (!cResult.passed) {
    recommendedAdjustment =
      "Inicia siempre validando su emoción con frases como 'Comprendo su prisa...' o 'Entiendo su molestia...' antes de dar cualquier explicación técnica.";
  } else if (!aResult.passed) {
    recommendedAdjustment =
      "Explica la razón física o técnica (temperatura, fricción mecánica, tensión) de forma objetiva, evitando términos tajantes.";
  } else if (!pResult.passed) {
    recommendedAdjustment =
      "Aplica la regla de oro: nunca digas 'NO' sin dar al menos 2 alternativas viables de solución inmediata.";
  } else if (!a2Result.passed) {
    recommendedAdjustment =
      "Cierra tu respuesta con una pregunta de acuerdo: '¿Le parece si procedemos así?' o '¿Cuál de estas opciones le favorece más?'.";
  } else {
    recommendedAdjustment =
      "¡Excelente dominio! Mantén este mismo tono cálido, seguro y profesional en el mostrador real.";
  }

  // Generate Coach Comment
  const shortName = userName.split(" ")[0];
  let coachComment = "";
  if (finalScore >= 85) {
    coachComment = `¡Brillante respuesta, ${shortName}! Has aplicado la estructura CAPA con maestría: conectaste con el estado del cliente, mantuviste el límite de seguridad y le diste opciones viables. ¡Así se defiende el prestigio del Área de SAC!`;
  } else if (finalScore >= 65) {
    coachComment = `¡Muy buen trabajo, ${shortName}! Tu respuesta es asertiva y segura. Para alcanzar la excelencia total en mostrador, te recomiendo reforzar: ${recommendedAdjustment}`;
  } else {
    coachComment = `Buen intento, ${shortName}. En situaciones de alta tensión con clientes, el secreto está en no confrontar. Practiquemos de nuevo aplicando los 4 pasos CAPA para lograr un cierre impecable.`;
  }

  const idealExample = `SAC sugiere esta respuesta modelo:\n• [C] "Comprendo perfectamente su urgencia, ${scenario.customerName.split(" ")[0]}."\n• [A] "${scenario.expectedCapa.a}"\n• [P] "${scenario.expectedCapa.p}"\n• [A] "${scenario.expectedCapa.a2}"`;

  return {
    score: finalScore,
    medal,
    levelTitle,
    capaBreakdown: {
      conectar: {
        score: cResult.score,
        max: 25,
        passed: cResult.passed,
        tip: scenario.expectedCapa.c,
      },
      analizar: {
        score: aResult.score,
        max: 25,
        passed: aResult.passed,
        tip: scenario.expectedCapa.a,
      },
      protocolo: {
        score: pResult.score,
        max: 25,
        passed: pResult.passed,
        tip: scenario.expectedCapa.p,
      },
      asegurar: {
        score: a2Result.score,
        max: 25,
        passed: a2Result.passed,
        tip: scenario.expectedCapa.a2,
      },
    },
    prohibitedUsed,
    coachComment,
    strengths,
    recommendedAdjustment,
    idealExample,
  };
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/SAC indica:\s*/i, "SAC indica: ")
    .replace(/•\s*\[C\]\s*Conectar\s*\/\s*Clarificar:\s*/gi, "Paso 1, Conectar: ")
    .replace(/•\s*\[A\]\s*Analizar\s*el\s*riesgo:\s*/gi, "Paso 2, Analizar el riesgo: ")
    .replace(/•\s*\[P\]\s*Protocolo\s*SAC:\s*/gi, "Paso 3, Protocolo SAC: ")
    .replace(/•\s*\[A\]\s*Asegurar\s*y\s*Acordar:\s*/gi, "Paso 4, Asegurar y Acordar: ")
    .replace(/•\s*\[([A-Z0-9]+)\]\s*/gi, "Paso $1: ")
    .replace(/[*_#`]/g, "")
    .replace(/¡/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBestSpeechVoice(
  voices: SpeechSynthesisVoice[],
  preferredGender?: "male" | "female"
): SpeechSynthesisVoice | null {
  const spanish = voices.filter((v) => v.lang.startsWith("es"));
  if (spanish.length === 0) {
    return voices[0] || null;
  }

  const malePatterns = /jorge|diego|juan|carlos|alvaro|pablo|miguel|manuel|pedro|gonzalo|enrique|male/i;
  const femalePatterns = /sabina|monica|paulina|dalia|elena|sofia|laura|luciana|soledad|francisca|paloma|female/i;

  let pool = spanish;
  if (preferredGender === "male") {
    const males = spanish.filter((v) => malePatterns.test(v.name));
    if (males.length > 0) pool = males;
  } else if (preferredGender === "female") {
    const females = spanish.filter((v) => femalePatterns.test(v.name));
    if (females.length > 0) pool = females;
  }

  // Priority to premium, natural, neural, google, online, siri
  const naturalVoices = pool.filter((v) =>
    /natural|neural|online|google|siri|premium|enhanced/i.test(v.name)
  );
  if (naturalVoices.length > 0) {
    return naturalVoices[0];
  }

  return pool[0] || null;
}

export type RealAudioTrack = {
  id: string;
  label: string;
  character: string;
  gender: "male" | "female" | "coach";
  scenarioId?: string;
  defaultAudioUrl: string;
  textSnippet: string;
};

export const REAL_AUDIO_REGISTRY: RealAudioTrack[] = [
  {
    id: "saci-welcome",
    label: "SACI Bienvenida y Presentación",
    character: "SACI Mascota (Coach)",
    gender: "coach",
    defaultAudioUrl: "/audio/saci-welcome.mp3",
    textSnippet: "¡Hola! Soy SACI, tu Coach de Servicio al Cliente. Estoy aquí para acompañarte...",
  },
  {
    id: "saci-regla-oro",
    label: "SACI Regla de Oro: Pausa y Escala",
    character: "SACI Mascota (Coach)",
    gender: "coach",
    defaultAudioUrl: "/audio/saci-regla-oro.mp3",
    textSnippet: "Recuerda la regla de oro del Protocolo SAC: ante señales de riesgo crítico, ¡pausa y escala!",
  },
  {
    id: "carlos-mendoza",
    label: "Ing. Carlos Mendoza (Caso 1 · Armazón con fisura)",
    character: "Ing. Carlos Mendoza",
    gender: "male",
    scenarioId: "rp-calor-fisura",
    defaultAudioUrl: "/audio/carlos-mendoza.mp3",
    textSnippet: "Mire, tengo un almuerzo de directorio en 45 minutos. Caliénteme la patita...",
  },
  {
    id: "patricia-valdivia",
    label: "Sra. Patricia Valdivia (Caso 2 · Garantía lunas)",
    character: "Sra. Patricia Valdivia",
    gender: "female",
    scenarioId: "rp-lunas-garantia",
    defaultAudioUrl: "/audio/patricia-valdivia.mp3",
    textSnippet: "Compré estos lentes hace solo tres semanas y las lunas ya están llenas de rayas...",
  },
  {
    id: "roberto-mendez",
    label: "Sr. Roberto Méndez (Caso 3 · Rechazo de fotos)",
    character: "Sr. Roberto Méndez",
    gender: "male",
    scenarioId: "rp-evidencia-fotos",
    defaultAudioUrl: "/audio/roberto-mendez.mp3",
    textSnippet: "¿Para qué tantas fotos? Solo vengo por un cambio de lunas sencillo...",
  },
  {
    id: "jorge-estrada",
    label: "Dr. Jorge Estrada (Caso 4 · Titanio en taller)",
    character: "Dr. Jorge Estrada",
    gender: "male",
    scenarioId: "rp-taller-soldadura",
    defaultAudioUrl: "/audio/jorge-estrada.mp3",
    textSnippet: "Sé perfectamente que se puede soldar en 5 minutos en el taller de atrás...",
  },
  {
    id: "elena-rojas",
    label: "Dña. Elena Rojas (Caso 5 · Progresivos receta vieja)",
    character: "Dña. Elena Rojas",
    gender: "female",
    scenarioId: "rp-receta-vencida",
    defaultAudioUrl: "/audio/elena-rojas.mp3",
    textSnippet: "Tengo mi receta de hace 4 años y veo perfecto con ella...",
  },
];

export function getRealAudioUrl(trackId: string): string {
  if (typeof window !== "undefined") {
    const custom = window.localStorage.getItem(`sac-custom-audio-${trackId}`);
    if (custom) return custom;
  }
  const found = REAL_AUDIO_REGISTRY.find((t) => t.id === trackId);
  return found?.defaultAudioUrl || `/audio/${trackId}.mp3`;
}

export function getRealAudioForScenario(scenarioId: string): string | null {
  const found = REAL_AUDIO_REGISTRY.find((t) => t.scenarioId === scenarioId);
  if (!found) return null;
  return getRealAudioUrl(found.id);
}


