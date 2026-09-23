export type SacRole = "Todos" | "Asesor" | "Optómetra";

export type QuizDifficulty = "Básica" | "Intermedia" | "Avanzada";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type SacModuleSection = {
  title: string;
  body: string;
  tip?: string;
};

export type SacModule = {
  id: string;
  capsuleId?: "capsule-recepcion" | "capsule-lunas" | "capsule-decir-no";
  order: number;
  title: string;
  kicker: string;
  role: SacRole;
  duration: number;
  xp: number;
  summary: string;
  objectives: string[];
  sections: SacModuleSection[];
  checklist: string[];
  video: string;
  captions: string;
  poster: string;
};

export type TrainingExample = {
  id: string;
  title: string;
  label: string;
  tone: "seguro" | "atencion" | "pausa";
  context: string;
  observe: string;
  action: string;
  evidence: string;
  image: string;
  imageAlt: string;
  crop?: "full" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export type QuizQuestion = {
  id: string;
  moduleId: string;
  role: SacRole;
  difficulty: QuizDifficulty;
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type RiskCase = {
  id: string;
  title: string;
  context: string;
  signals: string[];
  answer: RiskLevel;
  explanation: string;
};

export type ConversationCase = {
  id: string;
  customer: string;
  context: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
};

export type ProtocolStep = {
  id: string;
  label: string;
  explanation: string;
};

export type ChecklistChallengeItem = {
  id: string;
  label: string;
  required: boolean;
  feedback: string;
};

export type VisualFinding = {
  id: string;
  label: string;
  x: number;
  y: number;
  explanation: string;
};

export type BotKnowledgeItem = {
  id: string;
  intent: string;
  keywords: string[];
  response: string;
  relatedModuleIds: string[];
  escalation: boolean;
};

export type TrainingCapsule = {
  id: "capsule-recepcion" | "capsule-lunas" | "capsule-decir-no" | (string & {});
  order: number;
  title: string;
  subtitle: string;
  kicker: string;
  description: string;
  moduleIds: string[];
};

export const trainingCapsules: TrainingCapsule[] = [
  {
    id: "capsule-recepcion",
    order: 1,
    title: "Protocolo de Recepción Segura",
    subtitle: "Armazones, Monturas e Inspección Fisonómica",
    kicker: "CÁPSULA 01",
    description: "Metodología obligatoria de primer contacto, inspección anatómica, matriz de riesgo operativo y taller técnico.",
    moduleIds: ["sac-01", "sac-02", "sac-03", "sac-04", "sac-05", "sac-06", "sac-07", "sac-08"],
  },
  {
    id: "capsule-lunas",
    order: 2,
    title: "Garantía y Gestión Técnica de Lunas",
    subtitle: "Criterios Ópticos, Tratamientos, Adaptación y Dictamen",
    kicker: "CÁPSULA 02",
    description: "Evaluación de defectos de fabricación vs desgaste, craquelado de antirreflejo, multifocales, 4 fotos y lensometría.",
    moduleIds: [
      "sac-luna-01",
      "sac-luna-02",
      "sac-luna-03",
      "sac-luna-04",
      "sac-luna-05",
      "sac-luna-06",
      "sac-luna-07",
      "sac-luna-08",
    ],
  },
  {
    id: "capsule-decir-no",
    order: 3,
    title: "Cómo Decir NO al Cliente con Asertividad",
    subtitle: "Límites Técnicos, Técnica Sandwich, Desescalamiento y Alternativas",
    kicker: "CÁPSULA 03",
    description: "Comunicación asertiva de límites de garantía y taller, desescalamiento emocional, técnica sandwich y presentación de alternativas viables.",
    moduleIds: [
      "sac-no-01",
      "sac-no-02",
      "sac-no-03",
      "sac-no-04",
      "sac-no-05",
      "sac-no-06",
      "sac-no-07",
      "sac-no-08",
    ],
  },
];

function capsuleMedia(prefix: string, order: number) {
  const stem = `/media/${prefix}-${String(order).padStart(2, "0")}`;
  return { video: `${stem}.mp4`, captions: `${stem}.vtt`, poster: `${stem}.png` };
}

function lunasMedia(order: number) {
  return capsuleMedia("sac-luna", order);
}

function decirNoMedia(order: number) {
  return capsuleMedia("sac-no", order);
}

export const CONTENT_VERSION = "SAC-2026.09.06-v2" as const;
export const MODULE_EXPERIENCE_TOKENS = [
  "demo:seen",
  "examples:explored",
  "practice:completed",
] as const;

function moduleMedia(order: number) {
  const stem = `/media/sac-modulo-${String(order).padStart(2, "0")}`;
  return { video: `${stem}.mp4`, captions: `${stem}.vtt`, poster: `${stem}.png` };
}

export const sacModules: SacModule[] = [
  {
    id: "sac-01",
    capsuleId: "capsule-recepcion",
    order: 1,
    title: "SAC | Recepción segura desde el primer contacto",
    kicker: "Fundamentos",
    role: "Todos",
    duration: 10,
    xp: 100,
    summary:
      "Una recepción segura comienza antes de intervenir el producto: se identifica la solicitud, se revisa el estado junto con el cliente, se informa con claridad y se deja un registro verificable.",
    objectives: [
      "Aplicar la secuencia revisar, informar, registrar y confirmar.",
      "Distinguir una inspección responsable de una promesa sobre el resultado.",
      "Reconocer cuándo corresponde pausar la recepción y solicitar apoyo.",
    ],
    sections: [
      {
        title: "El propósito de la recepción",
        body: "La revisión inicial protege al cliente, al equipo y la trazabilidad del servicio. Su objetivo es establecer una línea base compartida sobre el estado del armazón y de las lunas antes de cualquier manipulación.",
        tip: "Realice la inspección con el producto a la vista del cliente siempre que sea posible.",
      },
      {
        title: "La secuencia SAC",
        body: "Primero confirme el trabajo solicitado. Luego inspeccione, muestre cada novedad, explique la manipulación prevista, registre la evidencia y compruebe que el cliente entendió antes de solicitar su aceptación.",
      },
      {
        title: "Informar sin prometer",
        body: "Describa condiciones observables y posibles riesgos con lenguaje sereno. Evite asegurar que el producto no sufrirá cambios y no presente la firma como sustituto del cuidado técnico.",
        tip: "Use expresiones como «puede requerir», «se observa» y «vamos a validar».",
      },
      {
        title: "Cuándo detenerse",
        body: "Pause el proceso cuando encuentre una fisura, una reparación no declarada, material quebradizo, una pieza crítica inestable, una diferencia con el cliente o cualquier duda sobre la seguridad del trabajo.",
      },
    ],
    checklist: [
      "Confirmé el servicio solicitado.",
      "Revisé armazón y lunas junto con el cliente.",
      "Mostré y expliqué las novedades visibles.",
      "Describí la manipulación prevista sin ofrecer garantías absolutas.",
      "Registré la información antes de solicitar la aceptación.",
      "Detuve el proceso si apareció una condición que requería validación.",
    ],
    ...moduleMedia(1),
  },
  {
    id: "sac-02",
    capsuleId: "capsule-recepcion",
    order: 2,
    title: "SAC | Inspección sistemática del armazón",
    kicker: "Inspección",
    role: "Todos",
    duration: 12,
    xp: 120,
    summary:
      "Una inspección consistente recorre el armazón siempre en el mismo orden para detectar fisuras, holguras, deformaciones, desgaste y reparaciones previas sin forzar sus componentes.",
    objectives: [
      "Identificar los componentes críticos de un armazón.",
      "Aplicar una revisión visual y funcional sin provocar tensión innecesaria.",
      "Describir hallazgos con ubicación, magnitud y evidencia.",
    ],
    sections: [
      {
        title: "Recorrido de inspección",
        body: "Revise aro, puente, bisagras, tornillos, varillas, terminales, plaquetas, ranuras, puntos de anclaje y accesorios. Observe también el asentamiento y la condición superficial de las lunas.",
      },
      {
        title: "Señales que merecen atención",
        body: "Busque líneas de fisura, blanqueamiento del material, corrosión, adhesivos, soldaduras, piezas desalineadas, tornillos incompletos, holguras y zonas con desgaste irregular.",
        tip: "Una reparación anterior puede modificar la resistencia aunque el armazón parezca estable.",
      },
      {
        title: "Comprobación funcional prudente",
        body: "Compruebe el movimiento de las bisagras y la simetría con gestos suaves. Si percibe resistencia, ruido, juego excesivo o material frágil, no continúe probando: registre y valide.",
      },
      {
        title: "Describir para que otro pueda verificar",
        body: "Un registro útil indica qué se encontró, dónde está, cómo se observa y qué evidencia lo respalda. Evite palabras generales como «mal» o «normal» sin detalle.",
      },
    ],
    checklist: [
      "Inspeccioné aro y puente.",
      "Revisé bisagras, tornillos y varillas sin forzarlos.",
      "Comprobé terminales, plaquetas y accesorios.",
      "Observé las superficies y los bordes de las lunas.",
      "Pregunté por reparaciones anteriores.",
      "Registré la ubicación exacta de cada novedad.",
    ],
    ...moduleMedia(2),
  },
  {
    id: "sac-03",
    capsuleId: "capsule-recepcion",
    order: 3,
    title: "SAC | Manipulación, ajuste y calor controlado",
    kicker: "Técnica",
    role: "Optómetra",
    duration: 14,
    xp: 140,
    summary:
      "La técnica se adapta al material, al diseño, al estado y al trabajo solicitado. El calor y la fuerza nunca se aplican por rutina ni sustituyen una evaluación previa.",
    objectives: [
      "Relacionar material, diseño y condición con la técnica de manipulación.",
      "Explicar de forma comprensible por qué un procedimiento puede implicar riesgo.",
      "Identificar señales que obligan a detener el ajuste.",
    ],
    sections: [
      {
        title: "Evaluar antes de intervenir",
        body: "Confirme el material, el tipo de montaje, la antigüedad aproximada, las reparaciones previas y el punto exacto que requiere ajuste. Una misma maniobra puede tener efectos distintos en dos armazones similares.",
      },
      {
        title: "Uso prudente del calor",
        body: "Aplique calor solo cuando la técnica aprobada para ese material lo requiera, de manera gradual y localizada. Proteja lunas, recubrimientos, adhesivos y accesorios sensibles.",
        tip: "Si el material cambia de color, emite olor, se vuelve irregular o ofrece una resistencia inesperada, detenga el procedimiento.",
      },
      {
        title: "Control de fuerza y apoyo",
        body: "Sujete cerca del punto de trabajo, distribuya la carga y evite usar una bisagra, una soldadura o una fisura como punto de palanca. Trabaje en incrementos pequeños y reevalúe entre cada ajuste.",
      },
      {
        title: "Explicación previa",
        body: "Informe qué componente se manipulará, por qué puede necesitar ajuste o calor y qué condición preexistente aumenta el riesgo. Confirme dudas antes de continuar.",
      },
    ],
    checklist: [
      "Identifiqué el material y el tipo de montaje.",
      "Revisé fisuras, reparaciones y accesorios sensibles.",
      "Definí el punto de apoyo antes de aplicar fuerza.",
      "Usé calor solo si la técnica aprobada lo requería.",
      "Protegí las lunas y los recubrimientos.",
      "Detuve el trabajo ante una reacción inesperada.",
    ],
    ...moduleMedia(3),
  },
  {
    id: "sac-04",
    capsuleId: "capsule-recepcion",
    order: 4,
    title: "SAC | Clasificación y decisión por nivel de riesgo",
    kicker: "Criterio",
    role: "Todos",
    duration: 12,
    xp: 140,
    summary:
      "El nivel de riesgo se determina combinando condición, antigüedad, reparaciones, material y complejidad del trabajo; nunca por una palabra aislada ni por intuición.",
    objectives: [
      "Diferenciar los niveles Bajo, Medio y Alto mediante criterios observables.",
      "Elegir la acción correspondiente a cada nivel.",
      "Reclasificar el caso cuando aparezca información nueva.",
    ],
    sections: [
      {
        title: "Evaluación de varias dimensiones",
        body: "Considere el estado estructural, la estabilidad de piezas críticas, la historia de reparaciones, la edad aproximada, el material y la exigencia del procedimiento. Ningún dato debe leerse fuera de contexto.",
      },
      {
        title: "Riesgo bajo",
        body: "Corresponde a un producto estable, sin señales estructurales relevantes y con una intervención de baja complejidad. Aun así, requiere revisión, explicación y registro.",
      },
      {
        title: "Riesgo medio",
        body: "Incluye desgaste, holguras, deformación moderada, antecedentes incompletos o una manipulación que exige precaución adicional. Documente con detalle y siga la validación definida por SAC.",
      },
      {
        title: "Riesgo alto",
        body: "Incluye fisuras, material quebradizo, reparaciones estructurales, piezas críticas inestables o una combinación que compromete la seguridad del proceso. Pause y obtenga una validación autorizada antes de continuar.",
        tip: "La aceptación del cliente no reemplaza la decisión técnica ni la validación interna.",
      },
      {
        title: "Reclasificación",
        body: "El nivel puede cambiar si aparece una fisura bajo mejor iluminación, se confirma una soldadura o la pieza reacciona de forma inesperada. Actualice el registro y vuelva a explicar la situación.",
      },
    ],
    checklist: [
      "Evalué condición, antigüedad, reparaciones, material y procedimiento.",
      "Sustenté el nivel con señales observables.",
      "Apliqué la acción correspondiente al nivel.",
      "Registré quién validó el caso cuando fue necesario.",
      "Reclasifiqué el riesgo si apareció información nueva.",
    ],
    ...moduleMedia(4),
  },
  {
    id: "sac-05",
    capsuleId: "capsule-recepcion",
    order: 5,
    title: "SAC | Conversaciones claras con el cliente",
    kicker: "Servicio",
    role: "Asesor",
    duration: 12,
    xp: 120,
    summary:
      "Una conversación profesional combina escucha, hechos observables, explicación del siguiente paso y verificación de comprensión, sin presionar ni prometer resultados.",
    objectives: [
      "Explicar hallazgos y procedimientos con lenguaje claro y respetuoso.",
      "Responder a dudas o inconformidad sin discutir ni minimizar.",
      "Confirmar que el cliente comprendió antes de solicitar su decisión.",
    ],
    sections: [
      {
        title: "Abrir la conversación",
        body: "Explique que revisarán juntos el producto antes de recibirlo. Pida permiso para mostrar las novedades y mantenga el armazón visible durante la explicación.",
      },
      {
        title: "Describir hechos, no conclusiones",
        body: "Indique la ubicación y apariencia de cada hallazgo. En lugar de afirmar que una pieza «se va a romper», explique que su condición requiere precaución o validación adicional.",
        tip: "Una frase útil es: «Quiero mostrarle esta zona para que tengamos el mismo registro antes de continuar».",
      },
      {
        title: "Manejar una inquietud",
        body: "Escuche sin interrumpir, reconozca la preocupación, aclare el propósito del registro y ofrezca el siguiente paso autorizado. Si no existe acuerdo, pause la recepción y solicite apoyo.",
      },
      {
        title: "Comprobar comprensión",
        body: "Invite al cliente a formular preguntas y pídale confirmar con sus palabras qué procedimiento se realizará. La firma se solicita después de esta verificación, nunca como un trámite apresurado.",
      },
    ],
    checklist: [
      "Expliqué el propósito de la revisión.",
      "Mostré hechos observables sin dramatizar.",
      "Escuché la inquietud completa antes de responder.",
      "Evité promesas, culpas y expresiones defensivas.",
      "Expliqué el siguiente paso autorizado.",
      "Confirmé la comprensión antes de solicitar la aceptación.",
    ],
    ...moduleMedia(5),
  },
  {
    id: "sac-06",
    capsuleId: "capsule-recepcion",
    order: 6,
    title: "SAC | Evidencia fotográfica útil y trazable",
    kicker: "Evidencia",
    role: "Todos",
    duration: 10,
    xp: 110,
    summary:
      "La evidencia fotográfica debe permitir reconocer el producto, ubicar cada novedad y comparar su estado sin depender de la memoria de quien realizó la recepción.",
    objectives: [
      "Capturar vistas generales y detalles con encuadre e iluminación consistentes.",
      "Relacionar cada fotografía con un hallazgo escrito.",
      "Proteger la privacidad y la integridad de los archivos.",
    ],
    sections: [
      {
        title: "Serie mínima de vistas",
        body: "Capture una vista frontal, una lateral derecha, una lateral izquierda y un acercamiento por cada novedad. El producto debe ocupar la mayor parte del encuadre y conservar una orientación reconocible.",
      },
      {
        title: "Calidad de la imagen",
        body: "Use fondo limpio, luz uniforme y enfoque nítido. Evite reflejos que oculten las lunas, zoom digital excesivo, objetos personales y elementos del local que no aporten evidencia.",
        tip: "Incluya primero una vista de contexto y luego un detalle; un acercamiento aislado puede ser difícil de ubicar.",
      },
      {
        title: "Relación entre imagen y registro",
        body: "Identifique la vista, el lado y el componente. Vincule la fotografía con una descripción concreta, por ejemplo: «fisura fina en la unión superior de la bisagra derecha».",
      },
      {
        title: "Privacidad y trazabilidad",
        body: "Registre solo el producto y la información necesaria para el servicio. Guarde los archivos en el sistema autorizado, asociados al identificador de la recepción y sin reutilizarlos fuera de su finalidad.",
      },
    ],
    checklist: [
      "Tomé las vistas frontal, lateral derecha y lateral izquierda.",
      "Añadí un detalle de cada novedad relevante.",
      "Verifiqué enfoque, iluminación y ausencia de reflejos obstructivos.",
      "Usé un fondo limpio y excluí datos ajenos al servicio.",
      "Relacioné cada imagen con una descripción y una recepción.",
      "Confirmé que los archivos quedaron guardados en el sistema autorizado.",
    ],
    ...moduleMedia(6),
  },
  {
    id: "sac-07",
    capsuleId: "capsule-recepcion",
    order: 7,
    title: "SAC | Ficha, comprensión y aceptación",
    kicker: "Registro",
    role: "Asesor",
    duration: 14,
    xp: 150,
    summary:
      "La ficha integra datos, hallazgos, evidencia, nivel de riesgo y explicación. La aceptación solo es válida como registro del proceso cuando la información es completa y comprensible.",
    objectives: [
      "Completar los campos obligatorios con información verificable.",
      "Mantener coherencia entre ficha, fotografías y explicación.",
      "Corregir cambios de forma trazable antes o después de la aceptación.",
    ],
    sections: [
      {
        title: "Datos completos y neutrales",
        body: "Registre la identificación de la recepción, responsables, servicio solicitado, características del producto y hallazgos. No deje valores predeterminados sin comprobarlos.",
      },
      {
        title: "Coherencia del expediente",
        body: "La descripción, el nivel de riesgo y las fotografías deben referirse al mismo producto y momento. Si una imagen muestra una novedad no escrita, complete el registro antes de continuar.",
      },
      {
        title: "Explicación antes de aceptar",
        body: "Presente al cliente el mismo contenido que quedará registrado. Responda preguntas y confirme su comprensión. La aceptación no elimina controles, no reemplaza la validación técnica y no autoriza omitir cuidados.",
        tip: "Nunca cambie el texto aceptado por una versión distinta al imprimir o guardar.",
      },
      {
        title: "Correcciones y cambios",
        body: "Si detecta un error antes de cerrar, corríjalo y vuelva a mostrarlo. Si el expediente ya fue cerrado, conserve el original y agregue una enmienda con motivo, fecha y responsable; no sobrescriba el historial.",
      },
    ],
    checklist: [
      "Comprobé los datos obligatorios y el identificador de la recepción.",
      "Confirmé que no quedaron selecciones predeterminadas sin validar.",
      "Relacioné cada hallazgo con su evidencia.",
      "Mostré al cliente el texto exacto que quedará guardado.",
      "Registré la validación requerida para un riesgo alto.",
      "Solicité la aceptación después de resolver las preguntas.",
      "Conservé la trazabilidad de cualquier corrección.",
    ],
    ...moduleMedia(7),
  },
  {
    id: "sac-08",
    capsuleId: "capsule-recepcion",
    order: 8,
    title: "SAC | Casos críticos, pausa y escalamiento",
    kicker: "Decisión",
    role: "Todos",
    duration: 16,
    xp: 180,
    summary:
      "Un caso crítico exige detener la operación, proteger el producto, conservar la evidencia y entregar información suficiente a la persona autorizada para decidir el siguiente paso.",
    objectives: [
      "Reconocer indicadores de un caso crítico antes y durante el procedimiento.",
      "Aplicar una pausa segura sin alterar la evidencia.",
      "Escalar con un resumen completo, objetivo y verificable.",
    ],
    sections: [
      {
        title: "Indicadores críticos",
        body: "Fisuras, soldaduras estructurales, adhesivos en puntos de carga, material quebradizo, piezas críticas sueltas, rotura durante el proceso o desacuerdo sobre el estado requieren una pausa inmediata.",
      },
      {
        title: "Pausa segura",
        body: "Deje de manipular, coloque el producto en una superficie protegida, conserve piezas sueltas, evite limpiar o modificar la zona y documente el estado desde varias vistas.",
        tip: "No intente corregir apresuradamente un cambio antes de registrar lo ocurrido.",
      },
      {
        title: "Escalamiento completo",
        body: "Informe identificador del caso, servicio solicitado, estado inicial, secuencia de acciones, cambio observado, evidencia disponible y situación del cliente. Registre quién recibe y quién autoriza el siguiente paso.",
      },
      {
        title: "Comunicación durante la espera",
        body: "Explique que el proceso está en pausa para realizar una revisión responsable. Indique cuál será el siguiente contacto y evite anticipar una conclusión que aún no ha sido validada.",
      },
    ],
    checklist: [
      "Detuve la manipulación al identificar la señal crítica.",
      "Protegí el producto y conservé todas las piezas.",
      "Registré el estado y la secuencia sin alterar la evidencia.",
      "Informé al cliente que el caso estaba en revisión.",
      "Envié al responsable un resumen completo con evidencias.",
      "Registré la decisión y la persona que la autorizó.",
    ],
    ...moduleMedia(8),
  },
  {
    id: "sac-luna-01",
    capsuleId: "capsule-lunas",
    order: 1,
    title: "SAC | Tipos de lunas, materiales y tratamientos ópticos",
    kicker: "Materiales Ópticos",
    role: "Todos",
    duration: 14,
    xp: 140,
    summary:
      "Conocer las propiedades de cada material (CR-39, Policarbonato, Trivex, Alto Índice) y sus recubrimientos (antirreflejo, blue block, fotocromático) permite anticipar su resistencia mecánica, espesor y cuidados técnicos.",
    objectives: [
      "Identificar los índices de refracción y coeficientes Abbe de los polímeros ópticos más comunes.",
      "Distinguir la respuesta mecánica y térmica de cada material ante el biselado y montura.",
      "Explicar las características y cuidados de los tratamientos antirreflejo y filtros de luz azul.",
    ],
    sections: [
      {
        title: "Materiales orgánicos y resistencia al impacto",
        body: "CR-39 (índice 1.50, alta calidad óptica, menor resistencia al impacto); Policarbonato (1.59, máxima resistencia, ideal para niños y ranurados); Trivex (1.53, ligereza, alta resistencia química y óptica superior).",
        tip: "En monturas al aire o ranuradas, evite CR-39 por riesgo de desportillado en los taladros.",
      },
      {
        title: "Lentes de Alto Índice (1.67 y 1.74)",
        body: "Polímeros más densos que reducen notablemente el espesor en bordes para miopías altas o en centro para hipermetropías. Requieren tratamiento antirreflejo multicapa para evitar reflejos residuales acusados.",
        tip: "El material de alto índice disipa menos la luz si se combina con un buen tratamiento hidrofóbico.",
      },
      {
        title: "Capas de tratamiento antirreflejo",
        body: "Pila de óxidos metálicos depositados al vacío que eliminan reflejos parásitos. Incluye laca endurecedora (hard coat), capa antirreflejo multicapa, y capa hidrofóbica/oleofóbica final para facilitar la limpieza.",
      },
      {
        title: "Filtros Blue Block y fotocromáticos",
        body: "Monómeros que bloquean radiación ultravioleta y luz azul nociva (400-455 nm), y moléculas fotocromáticas que reaccionan a los rayos UV oscureciéndose al aire libre y aclarando en interiores.",
        tip: "El tinte residual amarillento o verdoso es característico de los filtros blue block en masa.",
      },
    ],
    checklist: [
      "Identifiqué el material de la luna según el índice y diseño solicitado.",
      "Comprobé la compatibilidad del material con el tipo de montura (ranurada, al aire o completa).",
      "Verifiqué la presencia y color residual del tratamiento antirreflejo bajo luz fluorescente.",
      "Expliqué al paciente los cuidados específicos del polímero y sus capas protectoras.",
      "Registré las especificaciones de la luna en la orden de trabajo SAC.",
      "Verifiqué la ausencia de aberraciones cromáticas evidentes en el borde.",
    ],
    ...lunasMedia(1),
  },
  {
    id: "sac-luna-02",
    capsuleId: "capsule-lunas",
    order: 2,
    title: "SAC | Defectos de fabricación vs mal uso o desgaste mecánico",
    kicker: "Diagnóstico Diferencial",
    role: "Todos",
    duration: 15,
    xp: 150,
    summary:
      "Diferenciar con precisión técnica entre una burbuja o delaminación interna atribuible a planta y un rayón superficial, despostillado por impacto o agresión abrasiva del usuario.",
    objectives: [
      "Diferenciar inclusiones o tensiones internas de fabricación de rayas y microimpactos por uso.",
      "Reconocer patrones de abrasión por limpieza en seco o con prendas abrasivas.",
      "Establecer los criterios técnicos objetivos para determinar si una luna califica para garantía.",
    ],
    sections: [
      {
        title: "Defectos intrínsecos de fabricación",
        body: "Inclusiones gaseosas (microburbujas), polímeros no polimerizados homogéneamente, fallas en la laca base (crazing preexistente) o potencia incorrecta de origen. Son atribuibles al laboratorio óptico y cubiertos al 100% por garantía.",
        tip: "Una burbuja interna se distingue porque no altera la superficie palpable de la luna ni se siente al tacto.",
      },
      {
        title: "Desgaste abrasivo y rayas mecánicas",
        body: "Marcas lineales superficiales generadas por fricción contra objetos duros, limpieza con ropa o toallas de papel, o contacto con arena. Son causa de desgaste por uso y quedan excluidas de garantía de fabricación.",
        tip: "La presencia de múltiples microrrayas circulares en el centro de la luna indica frotamiento en seco por el usuario.",
      },
      {
        title: "Fisuras y desportillados en bordes",
        body: "Mellas o fracturas localizadas en el perímetro biselado o perforaciones de lentes al aire, típicamente producidas por caídas o exceso de torque al apretar tornillos de fijación.",
      },
      {
        title: "Criterios de exclusión de garantía",
        body: "Daños por caídas, quemaduras químicas (acetona, alcohol concentrado), deformación térmica por dejar los lentes en el vehículo bajo el sol o manipulación por talleres ajenos a SAC.",
        tip: "Documentar el patrón exacto en la ficha protege tanto al cliente como al estándar técnico de la empresa.",
      },
    ],
    checklist: [
      "Inspeccioné la superficie con lupa y luz tangencial para verificar la profundidad de las marcas.",
      "Comprobé si el daño se ubica en la masa del polímero o sobre la superficie externa.",
      "Evalué si existe evidencia de impacto mecánico o desportillado en los bordes.",
      "Consulté al cliente sobre el método habitual de limpieza y condiciones de uso.",
      "Clasifiqué objetivamente el hallazgo entre defecto de planta o desgaste mecánico.",
      "Registré la conclusión preliminar en el sistema con sustento fotográfico.",
    ],
    ...lunasMedia(2),
  },
  {
    id: "sac-luna-03",
    capsuleId: "capsule-lunas",
    order: 3,
    title: "SAC | Fallas en tratamiento antirreflejo y craquelado térmico",
    kicker: "Tratamientos y Craquelado",
    role: "Todos",
    duration: 16,
    xp: 160,
    summary:
      "El craquelado (crazing) por choque térmico muestra un patrón en telaraña fino, mientras que el desprendimiento por falta de adherencia en fábrica presenta escamas. Aprende a identificarlos y documentarlos.",
    objectives: [
      "Analizar el craquelado por calor excesivo (vapor, sauna, tableros de auto) vs desprendimiento por fallo de vacío.",
      "Utilizar luz rasante y fondo oscuro para evidenciar el estado de la capa antirreflejo.",
      "Orientar al paciente sobre las condiciones térmicas que anulan la garantía del recubrimiento.",
    ],
    sections: [
      {
        title: "Craquelado por estrés térmico (crazing)",
        body: "La diferencia en el coeficiente de dilatación térmica entre el polímero base y los óxidos minerales del antirreflejo provoca una red diminuta de fracturas entrecruzadas tipo craquelé cuando se somete a fuentes de calor (hornos, secadores de pelo, tableros de auto).",
        tip: "Bajo luz normal parece una mancha opaca; al mirarlo con luz lateral sobre fondo negro se observa la telaraña intacta.",
      },
      {
        title: "Delaminación y falta de adherencia",
        body: "Falla durante el proceso de deposición al vacío o curado de la laca intermedia. El tratamiento se desprende en láminas o escamas desde los bordes sin haber sido expuesto a calor. Este caso sí corresponde a garantía de laboratorio.",
      },
      {
        title: "Inspección con luz rasante y fondo negro",
        body: "El protocolo SAC requiere inclinar la luna 45 grados bajo luz LED blanca rasante y colocar una superficie mate oscura debajo. Esta técnica expone de inmediato cualquier degradación del recubrimiento.",
      },
      {
        title: "Condiciones ambientales de exclusión",
        body: "Uso de vapores calientes, saunas, cocinas industriales o solventes domésticos desintegran la capa hidrofóbica. Explicar este fenómeno con empatía previene reclamos recurrentes.",
        tip: "Muestre la infografía de craquelado térmico al cliente para fundamentar la explicación con evidencia visual.",
      },
    ],
    checklist: [
      "Realicé la prueba de luz rasante a 45 grados sobre paño oscuro de microfibra.",
      "Identifiqué si la falla presenta red reticular uniforme (estrés térmico) o desprendimiento en láminas.",
      "Comprobé la adherencia en los bordes perimetrales del bisel.",
      "Pregunté al paciente por exposición a calor intenso, secadores o permanencia en vehículos cerrados.",
      "Tomé fotografía macro enfocando el reflejo de la luz rasante en la zona afectada.",
      "Determiné procedencia técnica de la garantía según los criterios de laboratorio.",
    ],
    ...lunasMedia(3),
  },
  {
    id: "sac-luna-04",
    capsuleId: "capsule-lunas",
    order: 4,
    title: "SAC | Problemas de adaptación en multifocales y progresivos",
    kicker: "Multifocales y Adaptación",
    role: "Optómetra",
    duration: 18,
    xp: 180,
    summary:
      "Las garantías de no adaptación en progresivos requieren revisar altura pupilar, distancia nasopupilar (DNP), ángulo pantoscópico, distancia de vértice y pasillo de progresión antes de tramitar reposición.",
    objectives: [
      "Verificar las alturas pupilares y centrado de cruces con el armazón calzado en el rostro del paciente.",
      "Evaluar el ángulo pantoscópico (8-12°) y curvatura panorámica de la montura.",
      "Protocolizar el plazo de prueba de adaptación (15 a 30 días) y los pasos de ajuste anatómico previo.",
    ],
    sections: [
      {
        title: "Periodo de adaptación y sintomatología común",
        body: "Mareo al caminar, distorsión periférica tipo efecto acuario o necesidad de levantar/bajar la barbilla para enfocar. Antes de calificar no-adaptación, debe verificarse si el usuario cumplió el periodo mínimo de 15 días continuos de uso.",
        tip: "Nunca desestime la queja del paciente; valide su incomodidad y proceda de inmediato al examen técnico del centrado.",
      },
      {
        title: "Verificación de alturas pupilares y DNP",
        body: "Con el armazón puesto en posición natural, marque con plumón no permanente el centro pupilar de cada ojo. Compare contra la altura grabada en el pedido. Una discrepancia de más de 1 mm vertical u horizontal genera aberraciones severas.",
      },
      {
        title: "Ángulo pantoscópico y distancia al vértice",
        body: "El armazón debe tener una inclinación hacia los pómulos de entre 8 y 12 grados y una distancia al vértice de 12 mm. Si la montura está muy recta o alejada de los ojos, los campos de visión intermedia y cercana se estrechan drásticamente.",
        tip: "A menudo un ajuste anatómico de plaquetas y terminales resuelve el problema de visión sin requerir cambio de lunas.",
      },
      {
        title: "Marcas láser grabadas y pasillo de progresión",
        body: "Todo progresivo digital posee micrograbados láser que indican la cruz de ajuste, el diseño y la adición real. Reconstruir estas marcas con plantilla permite auditar si el montaje en taller fue exacto.",
      },
    ],
    checklist: [
      "Coloqué el armazón en el rostro del paciente y verifiqué su postura natural de mirada al frente.",
      "Comprobé la coincidencia exacta de la pupila con la cruz de ajuste del multifocal.",
      "Medí el ángulo pantoscópico y la distancia de vértice con regla milimetrada.",
      "Reconstruí con plumón borrable las marcas láser grabadas para verificar la adición.",
      "Realicé el ajuste anatómico preliminar de varillas y plaquetas para optimizar el campo visual.",
      "Derivé a refracción de control o tramité la orden de garantía de adaptación según el protocolo.",
    ],
    ...lunasMedia(4),
  },
  {
    id: "sac-luna-05",
    capsuleId: "capsule-lunas",
    order: 5,
    title: "SAC | Protocolo de recepción, lensometría y verificación en tienda",
    kicker: "Lensometría y Recepción",
    role: "Asesor",
    duration: 16,
    xp: 160,
    summary:
      "Paso a paso para medir la graduación exacta recibida en lensómetro digital, verificar eje astigmático, adición y prismas no deseados, contrastando contra la orden original de trabajo.",
    objectives: [
      "Marcar centros ópticos y ejes en lensómetro para cotejo exacto con la receta prescrita.",
      "Detectar errores de montaje, rotación de eje o potencia invertida entre ojo derecho e izquierdo.",
      "Completar la ficha técnica de recepción de lunas con los parámetros verificados.",
    ],
    sections: [
      {
        title: "Pasos técnicos en lensómetro digital",
        body: "Encender y calibrar a cero el lensómetro. Apoyar la montura nivelada sobre la platina. Localizar el centro óptico donde la mira se intersecta a cero prismas y accionar el marcador de tres puntos.",
        tip: "Asegure que la montura descanse firmemente en la platina para no inducir falsas lecturas cilíndricas.",
      },
      {
        title: "Verificación de eje astigmático y prismas",
        body: "Comprobar que el eje cilíndrico esté dentro de la tolerancia normativa internacional ANSI Z80.1 (+/- 2 grados en cilindros altos, +/- 3 en cilindros medios). Cualquier prisma no prescrito mayor a 0.50 delta debe reportarse.",
      },
      {
        title: "Cotejo contra la receta médica original",
        body: "Comparar las lecturas obtenidas de esfera, cilindro, eje y adición contra la prescripción ingresada al sistema. Verificar que no se hayan transpuesto los valores entre ojo derecho (OD) y ojo izquierdo (OI).",
      },
      {
        title: "Llenado de la ficha técnica de recepción",
        body: "Registrar los valores medidos en la boleta técnica SAC, firmar con matrícula del asesor y adjuntar comprobante impreso del lensómetro digital.",
        tip: "El ticket físico o digital del lensómetro es una prueba inmutable en auditorías de calidad.",
      },
    ],
    checklist: [
      "Calibré el lensómetro a cero antes de iniciar la medición del caso.",
      "Apoyé ambas varillas sobre la platina para mantener la horizontalidad óptica.",
      "Marqué con los tres pines del lensómetro el centro óptico y eje de cada luna.",
      "Cotejé potencia esférica, cilíndrica y eje contra la receta original del cliente.",
      "Verifiqué que no existan errores de transposición entre ojo derecho e izquierdo.",
      "Adjunté el comprobante impreso del lensómetro a la ficha de ingreso SAC.",
    ],
    ...lunasMedia(5),
  },
  {
    id: "sac-luna-06",
    capsuleId: "capsule-lunas",
    order: 6,
    title: "SAC | Registro fotográfico y trazabilidad de la garantía (4 fotos)",
    kicker: "Evidencia Fotográfica",
    role: "Todos",
    duration: 15,
    xp: 150,
    summary:
      "Toda luna ingresada a reclamo debe contar con 4 fotografías estandarizadas: toma general frontal, macro con luz rasante del defecto, verificación lensométrica/marcas láser y estado de la montura.",
    objectives: [
      "Ejecutar la técnica de iluminación rasante para destacar microfisuras y craquelado en cámara.",
      "Enfocar marcas láser grabadas de multifocales para certificar adición y diseño.",
      "Cargar la evidencia en el sistema de tickets SAC con nomenclatura unificada.",
    ],
    sections: [
      {
        title: "Foto 1: Vista general frontal del armazón y lunas",
        body: "Toma panorámica frontal sobre fondo neutro (blanco o gris) que muestre el conjunto completo, la alineación general y el estado estético visible de los aros y las lunas.",
        tip: "Evite sombras directas usando iluminación difusa cenital.",
      },
      {
        title: "Foto 2: Macro con luz rasante del defecto",
        body: "Fotografía de aproximación enfocada en la luna afectada, con un haz de luz lateral a 30-45 grados. Debe evidenciar con claridad si se trata de rayas mecánicas, craquelado o delaminación.",
      },
      {
        title: "Foto 3: Pantalla del lensómetro y marcas láser",
        body: "Captura de la pantalla digital del lensómetro con la potencia leída en la luna, o foto macro de las marcas láser grabadas bajo contraste para certificar diseño y adición.",
        tip: "Use un fondo oscuro y aumente el contraste de la cámara para que las marcas láser sean legibles.",
      },
      {
        title: "Foto 4: Estado de montura y taladros/ranuras",
        body: "Registro del estado del bisel, canal de ranurado de nylon o tornillos de taladro en lentes al aire, confirmando si la montura sufrió deformaciones o tensión excesiva.",
      },
    ],
    checklist: [
      "Capturé la foto 1 general frontal con iluminación nítida y simétrica.",
      "Tomé la foto 2 macro con luz rasante evidenciando la textura del defecto.",
      "Fotografié la lectura del lensómetro digital y/o marcas láser del multifocal.",
      "Registré la foto 4 del bisel, taladros y estado mecánico de la montura.",
      "Verifiqué que ninguna fotografía presente reflejos excesivos o desenfoque.",
      "Subí las 4 evidencias al ticket SAC identificadas con el código de orden.",
    ],
    ...lunasMedia(6),
  },
  {
    id: "sac-luna-07",
    capsuleId: "capsule-lunas",
    order: 7,
    title: "SAC | Comunicación asertiva y contención de reclamos por lunas",
    kicker: "Atención al Paciente",
    role: "Asesor",
    duration: 15,
    xp: 150,
    summary:
      "Manejo empático de la frustración del paciente ante una visión incómoda o luna dañada. Aplicar escucha activa, validación emocional sin prometer resultados antes del dictamen técnico del laboratorio.",
    objectives: [
      "Aplicar frases de desescalamiento ante clientes molestos por fallas de visión.",
      "Explicar con claridad los tiempos de evaluación técnica (24 a 48 horas hábiles) sin generar falsas expectativas.",
      "Emitir el ticket de garantía y comprobante de custodia de armazón y lunas.",
    ],
    sections: [
      {
        title: "Escucha activa y validación de la molestia visual",
        body: "Cuando un paciente no ve bien o siente que sus lunas se dañaron, experimenta frustración e inseguridad. Frases como 'Comprendo perfectamente su incomodidad, vamos a revisar minuciosamente sus lunas con el equipo técnico' desarman la hostilidad.",
        tip: "Nunca use frases como 'eso es normal' o 'usted las limpió mal'; centre la atención en el análisis objetivo.",
      },
      {
        title: "Explicación del proceso técnico de auditoría",
        body: "Detallar paso a paso que la luna será inspeccionada en tienda y remitida al laboratorio de control de calidad bajo un protocolo estandarizado para emitir un dictamen técnico imparcial.",
      },
      {
        title: "Tiempos de respuesta (24 a 48 h) sin falsas promesas",
        body: "Fijar plazos realistas y trazables. Indicar que el dictamen toma de 24 a 48 horas laborables. Jamás asegurar al cliente que 'se las van a cambiar gratis' antes de que el laboratorio valide el caso.",
        tip: "Prometer desenlaces sin autorización debilita la confianza institucional si el dictamen concluye mal uso.",
      },
      {
        title: "Entrega de comprobante de custodia y ticket SAC",
        body: "Todo producto que queda en revisión debe respaldarse con un documento formal de custodia que describa el estado en que se recibe, las 4 fotos adjuntas y los datos de contacto del paciente.",
      },
    ],
    checklist: [
      "Escuché activamente el relato del cliente sin interrumpir ni poner en duda su testimonio.",
      "Utilicé un tono empático, pausado y profesional de desescalamiento.",
      "Expliqué el flujo técnico de auditoría de 24 a 48 horas laborables.",
      "Evité comprometer resoluciones gratuitas o inmediatas antes del informe de laboratorio.",
      "Emití el comprobante formal de recepción y custodia con código de ticket.",
      "Entregué copia firmada al paciente y registré teléfonos y canales de seguimiento.",
    ],
    ...lunasMedia(7),
  },
  {
    id: "sac-luna-08",
    capsuleId: "capsule-lunas",
    order: 8,
    title: "SAC | Dictamen técnico de laboratorio y alternativas de resolución",
    kicker: "Dictamen y Cierre",
    role: "Todos",
    duration: 17,
    xp: 170,
    summary:
      "Flujo de resolución una vez emitido el informe del laboratorio: reposición prioritaria sin costo en caso procedente, o propuesta de fidelización con descuento en casos no atribuibles a garantía de fábrica.",
    objectives: [
      "Interpretar el dictamen emitido por el laboratorio de control de calidad.",
      "Gestionar la orden de reposición prioritaria por garantía procedente.",
      "Comunicar resoluciones no procedentes con sustento técnico y presentar alternativas comerciales amigables.",
    ],
    sections: [
      {
        title: "Interpretación del informe técnico del laboratorio",
        body: "El dictamen de laboratorio clasifica el caso en: Procedente por garantía (defecto de masa, craquelado de fábrica, delaminación o error de bisel) o No procedente (daño térmico externo, agresión química, abrasión mecánica o impacto).",
        tip: "Revise las conclusiones microscópicas del informe antes de citar al cliente para tener fundamentos sólidos.",
      },
      {
        title: "Gestión de reposición prioritaria por garantía aprobada",
        body: "Si es procedente, se genera de inmediato una orden de reposición prioritaria sin costo para el cliente. El taller debe verificar la nueva luna en lensómetro antes del montaje final para asegurar entrega perfecta.",
      },
      {
        title: "Propuesta comercial por daño no cubierto (fidelización)",
        body: "Si el dictamen es no procedente, el asesor muestra al cliente el informe fotográfico con las evidencias microscópicas y ofrece el plan de reposición con descuento de cortesía comercial SAC (30% a 50%).",
        tip: "Acompañar la negativa con una solución económica accesible transforma un reclamo en fidelización del cliente.",
      },
      {
        title: "Cierre de ticket y trazabilidad en métricas SAC",
        body: "Registrar la conformidad final del usuario, anexar el acta de entrega y documentar los motivos en el sistema para retroalimentar los indicadores de calidad y proveedores.",
      },
    ],
    checklist: [
      "Revisé el dictamen oficial del laboratorio y comprendí los fundamentos del dictamen.",
      "Si fue procedente, activé la orden de reposición prioritaria sin costo en el sistema.",
      "Si no fue procedente, preparé la explicación visual con el informe técnico y fotos macro.",
      "Presenté la alternativa de reposición con descuento comercial de fidelización.",
      "Verifiqué la conformidad del cliente y registré la entrega de la solución final.",
      "Cerré el ticket de garantía SAC completando los tiempos de atención y encuesta de satisfacción.",
    ],
    ...lunasMedia(8),
  },
  {
    id: "sac-no-01",
    capsuleId: "capsule-decir-no",
    order: 1,
    title: "SAC | Fundamentos del «NO» asertivo en atención óptica",
    kicker: "Límites y Asertividad",
    role: "Todos",
    duration: 15,
    xp: 150,
    summary:
      "Aprender a establecer límites técnicos y normativos claros sin confrontar al cliente, comprendiendo que un NO a tiempo previene reclamos graves y pérdidas operativas.",
    objectives: [
      "Comprender la importancia ética y operativa de comunicar límites.",
      "Diferenciar entre agresividad, sumisión complaciente y asertividad profesional.",
      "Eliminar el temor a la negativa mediante argumentos técnicos objetivos.",
    ],
    sections: [
      {
        title: "El costo oculto de un 'SÍ' complaciente",
        body: "Aceptar pedidos inviables (manipular monturas quebradizas, vender graduaciones dudosas o aceptar garantías vencidas) traslada la culpa y el costo financiero a la óptica.",
        tip: "La complacencia no es buen servicio; proteger al cliente y a la empresa es la verdadera excelencia.",
      },
      {
        title: "Asertividad frente a pasividad y agresividad",
        body: "La asertividad comunica hechos técnicos objetivos con empatía y firmeza, sin culpar al cliente ni mostrar inseguridad.",
      },
      {
        title: "El marco de seguridad operativa SAC",
        body: "Respaldarse en las políticas de seguridad de la óptica proporciona un marco institucional sólido que el cliente comprende y respeta.",
        tip: "Nunca digas 'es política de la empresa y ya'; di 'nuestro protocolo de seguridad protege la salud de sus ojos'.",
      },
      {
        title: "Calibración del tono y lenguaje corporal",
        body: "Mantener contacto visual sereno, postura abierta y tono de voz pausado neutraliza la tensión inicial antes de expresar un límite.",
      },
    ],
    checklist: [
      "Escuché completamente la solicitud del cliente antes de emitir cualquier respuesta.",
      "Identifiqué con claridad el límite técnico o normativo aplicable.",
      "Mantuve una postura corporal abierta y un tono de voz sereno.",
      "Fundamenté la negativa en la seguridad del paciente y del producto.",
      "Evité justificaciones defensivas o traspasar culpas a otros compañeros.",
    ],
    ...decirNoMedia(1),
  },
  {
    id: "sac-no-02",
    capsuleId: "capsule-decir-no",
    order: 2,
    title: "SAC | La técnica sandwich (Empatía - Límite - Alternativa)",
    kicker: "Técnica Sandwich",
    role: "Todos",
    duration: 16,
    xp: 160,
    summary:
      "Estructura comunicativa infalible en 3 capas: validar la necesidad del cliente (pan), comunicar el límite con claridad técnica (relleno) y abrir caminos de solución viables (pan).",
    objectives: [
      "Dominar las tres fases de la técnica sandwich en mostrador.",
      "Formular frases empáticas de apertura sin comprometer la decisión técnica.",
      "Conectar el límite directamente con una alternativa de solución constructiva.",
    ],
    sections: [
      {
        title: "Capa 1: Apertura empática y validación",
        body: "Reconocer el deseo o urgencia del cliente: 'Comprendo perfectamente su necesidad de tener sus lentes listos para su viaje de mañana...'",
        tip: "Validar la emoción no significa aceptar la solicitud imprudente.",
      },
      {
        title: "Capa 2: El límite técnico preciso y sin rodeos",
        body: "Explicar el motivo objetivo: '...sin embargo, este material requiere 24 horas de estabilización para no fracturarse en el biselado...'",
      },
      {
        title: "Capa 3: La alternativa viable inmediata",
        body: "Ofrecer soluciones concretas: '...lo que sí podemos hacer es proveerle un armazón temporal de cortesía mientras completamos el proceso seguro.'",
        tip: "La alternativa debe ser realista, accesible y con fecha de entrega clara.",
      },
      {
        title: "Práctica de roleplay y errores comunes",
        body: "Evitar el 'pero' cancelatorio; utilizar conectores asertivos como 'y por esa razón', 'para garantizar su seguridad óptima'.",
      },
    ],
    checklist: [
      "Inicié con una frase empática de reconocimiento genuino.",
      "Comuniqué el límite técnico sin titubeos ni ambigüedades.",
      "Evité la palabra 'pero' tras la frase empática.",
      "Presenté de inmediato una propuesta alternativa viable.",
      "Verifiqué la recepción y entendimiento por parte del usuario.",
    ],
    ...decirNoMedia(2),
  },
  {
    id: "sac-no-03",
    capsuleId: "capsule-decir-no",
    order: 3,
    title: "SAC | Cómo decir NO a solicitudes de alto riesgo en taller",
    kicker: "Límites Técnicos",
    role: "Todos",
    duration: 17,
    xp: 170,
    summary:
      "Protocolo para rechazar manipulaciones peligrosas (monturas resecas, soldaduras improvisadas o calor excesivo) cuidando la integridad del armazón del cliente.",
    objectives: [
      "Detectar componentes con riesgo de colapso antes de ingresar a taller.",
      "Explicar con evidencia visual macro por qué no es seguro manipular.",
      "Presentar opciones de reposición de piezas o cambio de montura.",
    ],
    sections: [
      {
        title: "Identificación de riesgos técnicos no negociables",
        body: "Acetatos cristalizados con más de 3 años, tornillos soldados con pegamento casero o aros con microfisuras activas no deben someterse a prensado ni calor.",
        tip: "Si ingresa al taller sin deslinde, la rotura se asume como culpa de la óptica.",
      },
      {
        title: "Evidencia visual compartida con el cliente",
        body: "Mostrar la fisura bajo la lupa o cámara macro al cliente: 'Mire esta microgrieta; si aplicamos calor aquí, la pieza se partirá al instante'.",
      },
      {
        title: "El deslinde técnico de no intervención",
        body: "Explicar con profesionalismo: 'Por respeto a su montura, nuestro protocolo prohíbe manipularla porque el daño sería irreversible'.",
      },
      {
        title: "Alternativas: reemplazo de frente, varilla o montura",
        body: "Ofrecer el trasvase de lunas a una montura compatible o descuento especial de renovación segura.",
      },
    ],
    checklist: [
      "Inspeccioné minuciosamente la montura bajo lupa frente al cliente.",
      "Señalé la microfisura o deterioro estructural en la bandeja de inspección.",
      "Expliqué el riesgo inminente de rotura mecánica o térmica.",
      "Comuniqué la negativa técnica respaldada en la protección del bien.",
      "Ofrecí alternativas de trasvase o montura de reemplazo.",
    ],
    ...decirNoMedia(3),
  },
  {
    id: "sac-no-04",
    capsuleId: "capsule-decir-no",
    order: 4,
    title: "SAC | Rechazo de recetas vencidas o graduaciones dudosas",
    kicker: "Criterio Clínico",
    role: "Optómetra",
    duration: 16,
    xp: 160,
    summary:
      "Cómo rehusar respetuosamente la elaboración de lunas con prescripciones caducadas (>1 año) o discordantes, priorizando la salud visual y la validez médico-legal.",
    objectives: [
      "Explicar la vigencia científica y legal de la prescripción óptica.",
      "Manejar la resistencia del paciente que insiste en usar su receta antigua.",
      "Canalizar al paciente hacia un examen optométrico actualizado inmediato.",
    ],
    sections: [
      {
        title: "La vigencia clínica de la receta optométrica",
        body: "La refracción ocular cambia por edad, acomodación o factores sistémicos. Una receta mayor a 1 año no garantiza agudeza visual ni confort.",
        tip: "La ley y el código de ética médica exigen prescripción vigente para dispensar dispositivos médicos correctivos.",
      },
      {
        title: "Cómo comunicar el límite clínico con empatía",
        body: "'Queremos que vea con total nitidez y sin fatiga. Elaborar lunas con esta graduación antigua podría causarle cefaleas y no resolver su visión'.",
      },
      {
        title: "Manejo de objeciones de costo y tiempo",
        body: "Cuando el cliente dice 'pero yo veo igual, hágalas así bajo mi responsabilidad', responder que el estándar clínico no permite fabricar bajo duda.",
      },
      {
        title: "El puente de solución: evaluación optométrica prioritaria",
        body: "Ofrecer la refracción en gabinete en el momento o agendar turno preferente para confirmar o actualizar la fórmula.",
      },
    ],
    checklist: [
      "Revisé la fecha de emisión y firma de la receta óptica.",
      "Identifiqué si la vigencia supera los 12 meses reglamentarios.",
      "Expliqué los riesgos fisiológicos de usar graduación no actualizada.",
      "Me negué asertivamente a fabricar sin prescripción válida.",
      "Ofrecí la evaluación optométrica de control en gabinete.",
    ],
    ...decirNoMedia(4),
  },
  {
    id: "sac-no-05",
    capsuleId: "capsule-decir-no",
    order: 5,
    title: "SAC | Manejo de reclamos de garantía improcedentes",
    kicker: "Garantías Fuera de Norma",
    role: "Todos",
    duration: 18,
    xp: 180,
    summary:
      "Directrices para denegar garantías por mal uso evidente (rayaduras mecánicas, solventes, aplastamiento o calor) manteniendo la empatía y la fidelidad del cliente.",
    objectives: [
      "Diferenciar daño de uso externo frente a falla de fabricación.",
      "Presentar el dictamen del laboratorio con cortesía y solvencia técnica.",
      "Ofrecer planes de reposición con descuento comercial de fidelización.",
    ],
    sections: [
      {
        title: "La frontera entre garantía y desgaste por uso",
        body: "La garantía cubre desprendimientos de capa o burbujas de masa; no cubre rayas por limpieza con ropa, contacto con alcohol o caídas.",
        tip: "Nunca uses tono acusatorio como 'usted la rayó'; usa lenguaje técnico 'la superficie muestra fricción mecánica por partículas externas'.",
      },
      {
        title: "Presentación del informe técnico y fotografía macro",
        body: "Apoyar la explicación con las fotos de la inspección o el informe de laboratorio; la imagen objetiva desactiva la subjetividad.",
      },
      {
        title: "El protocolo de comunicación de improcedencia",
        body: "'El laboratorio concluyó que el tratamiento se encuentra intacto y las marcas corresponden a contacto mecánico externo, por lo que la garantía de fábrica no aplica'.",
      },
      {
        title: "La propuesta comercial de rescate",
        body: "Transformar el momento difícil en lealtad: ofrecer el plan renueva SAC con descuento preferencial en su nuevo par.",
      },
    ],
    checklist: [
      "Cotejé las evidencias microscópicas con los criterios de garantía.",
      "Comuniqué la improcedencia sin adjetivos personales ni culpabilización.",
      "Mostré el informe técnico del laboratorio de manera transparente.",
      "Presenté la alternativa de reposición con descuento de fidelización.",
      "Registré la resolución y entrega de la constancia en el sistema.",
    ],
    ...decirNoMedia(5),
  },
  {
    id: "sac-no-06",
    capsuleId: "capsule-decir-no",
    order: 6,
    title: "SAC | Desescalamiento verbal frente a clientes frustrados u hostiles",
    kicker: "Desescalamiento Emocional",
    role: "Todos",
    duration: 18,
    xp: 180,
    summary:
      "Técnicas avanzadas de regulación emocional, lenguaje no verbal, escucha activa y contención para desactivar la hostilidad ante una negativa necesaria.",
    objectives: [
      "Aplicar la técnica de curva de hostilidad y tiempos de desahogo.",
      "Modular tono, volumen y ritmo de voz para inducir calma.",
      "Manejar clientes que exigen hablar con la gerencia o amenazan con reclamos.",
    ],
    sections: [
      {
        title: "La curva de hostilidad y el poder del silencio receptivo",
        body: "Un cliente enfadado necesita 90 segundos para desfogar la emoción primaria. Interrumpir reinicia el ciclo de furia; escuchar en silencio asintiendo induce la bajada emocional.",
        tip: "No digas 'cálmese' (aumenta el enojo); di 'estoy aquí para escucharle y encontrar una solución juntos'.",
      },
      {
        title: "Alineación postural y modulación tonal (Reflejo inverso)",
        body: "Frente a gritos o volumen alto, responde con volumen ligeramente más bajo, ritmo pausado y respiración controlada.",
      },
      {
        title: "Traslado a un entorno de privacidad",
        body: "Si la situación es en mostrador abierto, invitar amablemente a una mesa de atención o sala de asesoría para resguardar la tranquilidad general.",
      },
      {
        title: "Canalización formal de quejas sin perder la calma",
        body: "Ofrecer el libro de reclamaciones y el escalamiento al supervisor como un derecho respetado, sin miedo ni arrogancia.",
      },
    ],
    checklist: [
      "Permití que el cliente se exprese sin interrupciones durante su desahogo.",
      "Modulé mi voz a un ritmo más pausado y volumen controlado.",
      "Evité palabras detonantes como 'cálmese' o 'está equivocado'.",
      "Invité al cliente a un espacio de atención más privado y cómodo.",
      "Facilité los canales de atención y supervisión si fue requerido.",
    ],
    ...decirNoMedia(6),
  },
  {
    id: "sac-no-07",
    capsuleId: "capsule-decir-no",
    order: 7,
    title: "SAC | La regla de oro: Nunca un NO sin dos alternativas viables",
    kicker: "Alternativas Viables",
    role: "Todos",
    duration: 15,
    xp: 150,
    summary:
      "Estrategia de resolución orientada a resultados: acompañar cada negativa con al menos 2 opciones de solución viables para que el cliente elija el camino a seguir.",
    objectives: [
      "Estructurar un menú de opciones ante solicitudes inviables.",
      "Fomentar la sensación de control y autonomía en la decisión del cliente.",
      "Cerrar la atención en términos constructivos y de mutua satisfacción.",
    ],
    sections: [
      {
        title: "El principio del poder de elección",
        body: "Un NO rotundo crea sensación de callejón sin salida y frustración. Presentar dos opciones devuelve al cliente el control sobre su situación.",
        tip: "Siempre prepara la opción A (inmediata/práctica) y la opción B (óptima/definitiva).",
      },
      {
        title: "Diseño de las dos alternativas viables",
        body: "Opción 1: Reparación conservadora con deslinde de riesgo; Opción 2: Plan renueva montura con traspaso de lunas sin costo de montaje.",
      },
      {
        title: "Presentación en bandeja de opciones",
        body: "'Aunque no podemos soldar esta pieza de titanio en tienda, podemos: 1) enviarla a soldadura láser externa (4 días), o 2) aplicar el plan renueva con 40% de descuento en una montura nueva hoy'.",
      },
      {
        title: "Acompañamiento en la decisión final",
        body: "Guiar al cliente según su presupuesto y urgencia, respetando siempre su preferencia final.",
      },
    ],
    checklist: [
      "Diseñé mentalmente dos alternativas viables antes de dar la negativa.",
      "Presenté ambas opciones con claridad de costos y tiempos.",
      "Permití que el cliente evaluara y decidiera libremente.",
      "Asesoré con transparencia sobre pros y contras de cada opción.",
      "Confirmé el acuerdo y procedí con la opción elegida.",
    ],
    ...decirNoMedia(7),
  },
  {
    id: "sac-no-08",
    capsuleId: "capsule-decir-no",
    order: 8,
    title: "SAC | Documentación formal, deslinde de responsabilidad y cierre",
    kicker: "Deslinde y Cierre SAC",
    role: "Todos",
    duration: 17,
    xp: 170,
    summary:
      "Protocolo final de registro digital: emisión del acta de atención o deslinde, firma informada del cliente, archivo fotográfico y cierre de ticket en plataforma SAC.",
    objectives: [
      "Redactar actas de deslinde y notificación sin tecnicismos confusos.",
      "Obtener la firma de conformidad informada del usuario.",
      "Garantizar la trazabilidad y resguardo documental ante eventuales reclamos.",
    ],
    sections: [
      {
        title: "El valor legal y operativo de la constancia escrita",
        body: "Las palabras se olvidan; un documento firmado donde se explican los hallazgos y la decisión técnica protege a ambas partes.",
        tip: "El acta debe describir el estado original, la recomendación técnica y la opción elegida por el cliente.",
      },
      {
        title: "Cómo presentar el deslinde sin alarmar",
        body: "'Para su tranquilidad y respaldo mutuo, formalizamos en esta ficha los detalles conversados y las opciones acordadas'.",
      },
      {
        title: "Registro fotográfico adjunto al ticket",
        body: "Subir a la plataforma SAC las fotos tomadas en el módulo de recepción vinculadas al código único de atención.",
      },
      {
        title: "Cierre positivo y seguimiento post-servicio",
        body: "Agradecer la comprensión del cliente y coordinar la entrega o seguimiento técnico según los tiempos comprometidos.",
      },
    ],
    checklist: [
      "Redacté la constancia de atención o deslinde con datos precisos.",
      "Adjunté las fotografías de respaldo al ticket digital SAC.",
      "Leí o expliqué los puntos principales al cliente antes de firmar.",
      "Obtuve la firma manuscrita o digital de conformidad informada.",
      "Entregué copia física o digital al cliente y cerré el ticket.",
    ],
    ...decirNoMedia(8),
  },
];

export const trainingExamples: Record<string, TrainingExample[]> = {
  "sac-01": [
    {
      id: "recepcion-compartida",
      title: "La revisión ocurre junto al cliente",
      label: "Ejemplo correcto",
      tone: "seguro",
      context: "Andrea recibe un armazón para ajuste y lo mantiene visible mientras confirma el servicio solicitado.",
      observe: "Antes de manipular, compara alineación, bisagras, puente, varillas y superficie de las lunas.",
      action: "Muestra lo observado, explica qué se hará y confirma que ambas personas comparten la misma línea base.",
      evidence: "Registro inicial con servicio, estado observable y responsable de la recepción.",
      image: "/media/sac-hero-recepcion.png",
      imageAlt: "Asesora inspeccionando un armazón junto a la cliente",
    },
    {
      id: "hallazgo-lateral",
      title: "La luz revela una condición nueva",
      label: "Pausa necesaria",
      tone: "pausa",
      context: "Al girar el armazón bajo luz lateral aparece una línea fina junto al puente que no era visible al inicio.",
      observe: "La línea cruza el material y puede corresponder a una microfisura; no debe probarse con fuerza.",
      action: "Detén la recepción, muestra la zona, conserva el producto y solicita validación técnica.",
      evidence: "Vista general más acercamiento nítido de la línea y nota de escalamiento.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Acercamiento de una microfisura junto al puente del armazón",
      crop: "bottom-right",
    },
    {
      id: "explicacion-previa",
      title: "Primero se explica; después se acepta",
      label: "Ejemplo de servicio",
      tone: "atencion",
      context: "El cliente pregunta si el ajuste garantiza que el armazón no cambiará durante el procedimiento.",
      observe: "La inquietud requiere una respuesta clara, no una promesa absoluta ni una firma apresurada.",
      action: "Describe la condición observada, la manipulación prevista y el siguiente paso; luego verifica comprensión.",
      evidence: "Aceptación vinculada al mismo texto que fue explicado y mostrado.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Asesor explicando al cliente el estado de un armazón",
    },
  ],
  "sac-02": [
    {
      id: "armazon-estable",
      title: "Referencia de un armazón estable",
      label: "Punto de comparación",
      tone: "seguro",
      context: "El frente conserva simetría, las varillas apoyan de forma pareja y no hay separaciones visibles.",
      observe: "Aro, puente, bisagras, tornillos, varillas y plaquetas mantienen continuidad y alineación.",
      action: "Completa igualmente el recorrido sistemático y registra la condición estable.",
      evidence: "Vista frontal centrada que permite verificar simetría y estado general.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Armazón óptico intacto, simétrico y alineado",
      crop: "top-left",
    },
    {
      id: "bisagra-floja",
      title: "Bisagra abierta y varilla desalineada",
      label: "Requiere atención",
      tone: "atencion",
      context: "La varilla derecha presenta juego y se separa del frente más de lo esperado.",
      observe: "El tornillo no asienta por completo y existe una abertura visible en la unión.",
      action: "Evita forzar el movimiento, registra lado y componente, y valida antes de ajustar.",
      evidence: "Detalle de la bisagra derecha y nota sobre el juego observado.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Bisagra de armazón con tornillo flojo y varilla separada",
      crop: "top-right",
    },
    {
      id: "plaqueta-desgastada",
      title: "Plaqueta deformada y soporte irregular",
      label: "Desgaste visible",
      tone: "atencion",
      context: "Una plaqueta está opaca, deformada y apoyada en un ángulo distinto a la otra.",
      observe: "El desgaste altera el apoyo y puede ocultar tensión o una pieza debilitada.",
      action: "Describe qué lado está afectado y comprueba el soporte con movimientos mínimos.",
      evidence: "Acercamiento de ambas plaquetas para comparar forma, superficie y orientación.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Plaquetas nasales desgastadas y desalineadas",
      crop: "bottom-left",
    },
  ],
  "sac-03": [
    {
      id: "apoyo-controlado",
      title: "Apoyo cerca del punto de trabajo",
      label: "Técnica segura",
      tone: "seguro",
      context: "El armazón está estable y el ajuste se realizará en una zona sin fisuras ni reparaciones.",
      observe: "La fuerza puede distribuirse sin usar bisagras, soldaduras o zonas debilitadas como palanca.",
      action: "Sujeta cerca del punto de ajuste, trabaja en incrementos pequeños y reevalúa entre movimientos.",
      evidence: "Registro del material, punto intervenido y condición antes y después.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Armazón estable usado como referencia para una manipulación controlada",
      crop: "top-left",
    },
    {
      id: "calor-no-rutinario",
      title: "El calor nunca se aplica por rutina",
      label: "Precaución técnica",
      tone: "atencion",
      context: "Un armazón de material incierto tiene una reparación previa cerca de la zona solicitada.",
      observe: "El material y la reparación pueden responder de forma distinta al calor o a la presión.",
      action: "Identifica material y antecedentes; si no existe certeza técnica, pausa y valida la maniobra.",
      evidence: "Detalle de la reparación y constancia de la validación recibida.",
      image: "/media/sac-inspeccion-fisura.png",
      imageAlt: "Detalle de una fisura y reparación próxima a una bisagra",
    },
    {
      id: "reaccion-inesperada",
      title: "Una reacción inesperada cambia el plan",
      label: "Detener de inmediato",
      tone: "pausa",
      context: "Durante un movimiento mínimo se percibe un sonido y aparece una línea junto al puente.",
      observe: "La nueva señal modifica el estado inicial y puede comprometer la estructura.",
      action: "Suelta la carga, apoya el producto, conserva la zona sin limpiar y escala el caso.",
      evidence: "Secuencia de hechos, imágenes del cambio y persona que recibe el escalamiento.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Microfisura visible en el puente de un armazón",
      crop: "bottom-right",
    },
  ],
  "sac-04": [
    {
      id: "riesgo-bajo",
      title: "Bajo: estable y de baja complejidad",
      label: "Continuar con control",
      tone: "seguro",
      context: "Producto estable, sin señales estructurales y con una intervención sencilla.",
      observe: "No hay fisuras, piezas críticas flojas ni reparaciones que cambien la resistencia.",
      action: "Revisa, explica, registra y continúa con el procedimiento autorizado.",
      evidence: "Vista general y registro del estado estable.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Armazón estable que representa un nivel de riesgo bajo",
      crop: "top-left",
    },
    {
      id: "riesgo-medio",
      title: "Medio: desgaste que exige precaución",
      label: "Validar el método",
      tone: "atencion",
      context: "Existe holgura o desgaste, pero no una pérdida estructural evidente.",
      observe: "La condición, el material y la complejidad de la maniobra deben leerse en conjunto.",
      action: "Documenta con detalle y aplica la validación definida antes de intervenir.",
      evidence: "Detalle del componente y justificación del nivel asignado.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Bisagra floja que representa un nivel de riesgo medio",
      crop: "top-right",
    },
    {
      id: "riesgo-alto",
      title: "Alto: señal estructural crítica",
      label: "Pausar y escalar",
      tone: "pausa",
      context: "Una fisura cruza el material en una zona que recibirá carga durante el trabajo.",
      observe: "La aceptación del cliente no cambia la condición técnica ni autoriza la maniobra.",
      action: "Pausa, protege el producto y espera una decisión autorizada.",
      evidence: "Imágenes de contexto y detalle, nivel alto y responsable que valida.",
      image: "/media/sac-inspeccion-fisura.png",
      imageAlt: "Fisura estructural en un armazón que representa riesgo alto",
    },
  ],
  "sac-05": [
    {
      id: "mostrar-hechos",
      title: "Mostrar hechos sin dramatizar",
      label: "Lenguaje profesional",
      tone: "seguro",
      context: "El asesor encuentra una holgura y mantiene el armazón visible durante la explicación.",
      observe: "El cliente necesita ubicar el hallazgo y entender por qué cambia el procedimiento.",
      action: "Di: «Quiero mostrarle esta zona para que tengamos el mismo registro antes de continuar».",
      evidence: "Descripción neutral con ubicación, apariencia y siguiente paso.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Asesor conversando con el cliente mientras muestra un armazón",
    },
    {
      id: "escuchar-inquietud",
      title: "Escuchar antes de responder",
      label: "Conversación guiada",
      tone: "atencion",
      context: "El cliente expresa preocupación por una reparación anterior y teme un cambio durante el ajuste.",
      observe: "Interrumpir o minimizar aumenta la tensión y dificulta confirmar la comprensión.",
      action: "Escucha completa, reconoce la preocupación y explica la revisión y la validación disponibles.",
      evidence: "Nota breve de la inquietud y del siguiente paso acordado.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Conversación atenta entre asesor y cliente",
    },
    {
      id: "desacuerdo",
      title: "Sin acuerdo, la recepción se pausa",
      label: "Escalamiento de servicio",
      tone: "pausa",
      context: "El cliente no reconoce una fisura mostrada durante la inspección inicial.",
      observe: "No existe una línea base compartida y continuar aumentaría el conflicto.",
      action: "No discutas ni presiones; conserva el producto a la vista y solicita apoyo autorizado.",
      evidence: "Hallazgo, evidencia mostrada, desacuerdo y persona que interviene.",
      image: "/media/sac-hero-recepcion.png",
      imageAlt: "Asesora mostrando el armazón a la cliente durante la recepción",
    },
  ],
  "sac-06": [
    {
      id: "vista-general",
      title: "Primero una vista que ubique el producto",
      label: "Foto de contexto",
      tone: "seguro",
      context: "La imagen frontal muestra el armazón completo, centrado y sobre un fondo limpio.",
      observe: "La orientación permite reconocer lado, forma y condición general sin depender de la memoria.",
      action: "Captura frontal, lateral derecha y lateral izquierda antes de los acercamientos.",
      evidence: "Serie general consistente asociada al identificador de la recepción.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Vista frontal completa y centrada de un armazón",
      crop: "top-left",
    },
    {
      id: "detalle-ubicable",
      title: "El detalle debe poder ubicarse",
      label: "Macro útil",
      tone: "seguro",
      context: "Un acercamiento enfocado muestra la línea exacta junto a la bisagra derecha.",
      observe: "El detalle es útil porque existe una vista general previa y una descripción del lado y componente.",
      action: "Combina contexto y acercamiento, controla reflejos y confirma el enfoque antes de guardar.",
      evidence: "«Fisura fina en unión superior de bisagra derecha» vinculada a ambas imágenes.",
      image: "/media/sac-inspeccion-fisura.png",
      imageAlt: "Fotografía macro enfocada de una fisura junto a una bisagra",
    },
    {
      id: "foto-insuficiente",
      title: "Una foto aislada no cuenta toda la historia",
      label: "Evitar",
      tone: "atencion",
      context: "Solo existe un acercamiento sin orientación, con brillo y sin indicar el lado del armazón.",
      observe: "Otra persona no podría localizar el hallazgo ni compararlo con el estado general.",
      action: "Repite la toma con fondo limpio, luz lateral, enfoque y una vista de contexto.",
      evidence: "Nueva serie que permite localizar, verificar y comparar.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Acercamiento de una plaqueta que necesita contexto fotográfico",
      crop: "bottom-left",
    },
  ],
  "sac-07": [
    {
      id: "expediente-coherente",
      title: "Texto, fotografía y riesgo cuentan lo mismo",
      label: "Registro completo",
      tone: "seguro",
      context: "La ficha identifica el servicio, el estado, la imagen y la decisión aplicada al mismo producto.",
      observe: "No existen campos predeterminados sin validar ni contradicciones entre el texto y la evidencia.",
      action: "Lee el expediente de principio a fin antes de mostrarlo al cliente.",
      evidence: "Ficha verificable con responsables, fecha, nivel y archivos relacionados.",
      image: "/media/sac-hero-recepcion.png",
      imageAlt: "Recepción de un armazón con revisión compartida",
    },
    {
      id: "hallazgo-omitido",
      title: "La imagen muestra algo que el texto omite",
      label: "Corregir antes de aceptar",
      tone: "atencion",
      context: "La fotografía revela una fisura, pero la ficha solo dice «desgaste normal».",
      observe: "La descripción no permite verificar el hallazgo ni justifica el nivel de riesgo.",
      action: "Corrige ubicación y condición, reclasifica si corresponde y vuelve a mostrar el registro.",
      evidence: "Texto actualizado que coincide con la imagen y conserva quién realizó el cambio.",
      image: "/media/sac-inspeccion-fisura.png",
      imageAlt: "Fisura visible que debe estar descrita en la ficha",
    },
    {
      id: "enmienda-trazable",
      title: "Un expediente cerrado no se sobrescribe",
      label: "Historial protegido",
      tone: "seguro",
      context: "Después del cierre se detecta un dato incompleto sobre una reparación previa.",
      observe: "Cambiar el original eliminaría la historia de lo que fue aceptado.",
      action: "Conserva el registro original y agrega una enmienda con motivo, fecha y responsable.",
      evidence: "Original más enmienda claramente vinculada y fechada.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Asesor explicando un registro al cliente",
    },
  ],
  "sac-08": [
    {
      id: "senal-critica",
      title: "La señal crítica detiene la operación",
      label: "Pausa inmediata",
      tone: "pausa",
      context: "Una fisura atraviesa una zona estructural que iba a recibir presión durante el ajuste.",
      observe: "Manipular nuevamente puede modificar el estado y destruir evidencia útil.",
      action: "Detén, apoya el producto en superficie protegida y conserva las piezas.",
      evidence: "Estado actual desde varias vistas y secuencia exacta de lo ocurrido.",
      image: "/media/sac-inspeccion-fisura.png",
      imageAlt: "Fisura crítica en la estructura de un armazón",
    },
    {
      id: "proteger-evidencia",
      title: "Pausar también significa proteger",
      label: "Acción controlada",
      tone: "atencion",
      context: "Una pieza se afloja durante la revisión y permanece junto al armazón.",
      observe: "Limpiar, ajustar o descartar la pieza cambiaría el estado que debe revisarse.",
      action: "No corrijas; separa el área, conserva la pieza y documenta antes de mover nuevamente.",
      evidence: "Vista general, detalle de la pieza y nota sobre la última acción realizada.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Bisagra separada y pieza suelta de un armazón",
      crop: "top-right",
    },
    {
      id: "entrega-completa",
      title: "Escalar es entregar un caso verificable",
      label: "Resumen autorizado",
      tone: "seguro",
      context: "La persona responsable necesita decidir sin repetir una manipulación insegura.",
      observe: "Faltan decisiones confiables cuando no se informa servicio, estado inicial, acciones y cambio observado.",
      action: "Entrega identificador, solicitud, hallazgo, secuencia, evidencia, situación del cliente y validación requerida.",
      evidence: "Registro de quién recibe, qué decide, cuándo lo hace y cuál es el siguiente paso.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Profesional explicando un caso de manera clara y verificable",
    },
  ],
  "sac-luna-01": [
    {
      id: "cr39-vs-policarbonato",
      title: "Selección de material por tipo de montura",
      label: "Criterio técnico",
      tone: "seguro",
      context: "El cliente eligió una montura al aire (tres piezas con taladro) para graduación media.",
      observe: "CR-39 presenta alto riesgo de fisura en los puntos de anclaje de los tornillos por estrés mecánico.",
      action: "Se recomienda Policarbonato o Trivex por su alta tenacidad y resistencia a la tracción en perforaciones.",
      evidence: "Orden de taller indicando material de alto impacto compatible con montura de taladro.",
      image: "/media/sac-luna-materiales.png",
      imageAlt: "Comparativa visual de materiales ópticos y resistencia",
    },
    {
      id: "alto-indice-bisel",
      title: "Optimización de espesor en miopía de -6.00 D",
      label: "Estética y peso",
      tone: "seguro",
      context: "Paciente con prescripción de -6.00 D busca reducir el grosor visible en los bordes temporales.",
      observe: "Un índice 1.67 o 1.74 disminuye el volumen periférico hasta en un 40% frente al índice estándar.",
      action: "Se explica la necesidad de tratamiento antirreflejo multicapa para evitar anillos de reflexión periféricos.",
      evidence: "Ficha con cálculo de espesor de borde y selección de bisel estético oculto.",
      image: "/media/sac-luna-01.png",
      imageAlt: "Lentes de alto índice biseladas con acabado pulido",
    },
    {
      id: "cuidados-antirreflejo",
      title: "Asesoría preventiva de limpieza al cliente",
      label: "Prevención SAC",
      tone: "seguro",
      context: "Entrega de lentes con tratamiento antirreflejo premium e hidrofóbico.",
      observe: "El 80% de rayaduras ocurren en las primeras dos semanas por limpieza con ropa o pañuelos de papel.",
      action: "Demuestra la limpieza con spray óptico de PH neutro y microfibra limpia sin frotar en seco.",
      evidence: "Folleto de cuidados SAC entregado y firmado por el paciente.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Asesor explicando cuidados de limpieza al cliente",
    },
  ],
  "sac-luna-02": [
    {
      id: "burbuja-interna-fabrica",
      title: "Defecto de polimerización en masa (procedente)",
      label: "Falla de planta",
      tone: "seguro",
      context: "El paciente reporta un punto negro en el campo visual superior a los 3 días de uso.",
      observe: "Bajo lupa con luz polarizada se observa una microburbuja interna de 0.2 mm; superficie lisa sin mellas.",
      action: "Se clasifica como defecto de fabricación cubierto al 100% y se genera reposición urgente.",
      evidence: "Foto macro con luz transmitida mostrando la burbuja interna y superficie táctil intacta.",
      image: "/media/sac-luna-02.png",
      imageAlt: "Microburbuja interna en la masa del polímero",
    },
    {
      id: "abrasion-limpieza-seco",
      title: "Rayado circular por fricción abrasiva (no procedente)",
      label: "Desgaste por uso",
      tone: "atencion",
      context: "Cliente con 5 meses de uso reclama que el centro de ambas lunas se ve nublado.",
      observe: "Bajo luz rasante se aprecian múltiples microrrayas circulares entrecruzadas propias de paño con polvo.",
      action: "Se muestra al cliente el patrón de abrasión mecánica y se le ofrece el beneficio de reposición con descuento.",
      evidence: "Macro de abrasión superficial circular y cotización de fidelización SAC.",
      image: "/media/sac-luna-craquelado.png",
      imageAlt: "Patrón de rayas circulares por fricción abrasiva en seco",
    },
    {
      id: "desportillado-montura-aire",
      title: "Fisura en taladro por sobreajuste de tornillo",
      label: "Riesgo de taller",
      tone: "pausa",
      context: "Ingreso de lente al aire con astillado radiante alrededor de la perforación nasal.",
      observe: "El torque aplicado al tornillo superó la tolerancia elástica del material sin arandela de amortiguación.",
      action: "Se detiene la intervención, se registra la fractura preexistente y se canaliza a evaluación técnica.",
      evidence: "Ficha de recepción con detalle fotográfico de la fisura perimetral al tornillo.",
      image: "/media/sac-casos-inspeccion.png",
      imageAlt: "Desportillado radiante en el orificio del taladro",
    },
  ],
  "sac-luna-03": [
    {
      id: "craquelado-red-termica",
      title: "Craquelado reticular por calor en vehículo (exclusión)",
      label: "Choque térmico",
      tone: "atencion",
      context: "Lunas dejadas sobre el tablero del automóvil en día soleado alcanzando más de 65 °C.",
      observe: "La luna muestra una red de microfracturas paralelas y entrecruzadas (patrón de telaraña uniforme).",
      action: "Se explica el fenómeno de expansión térmica diferencial entre el plástico y los minerales del antirreflejo.",
      evidence: "Informe fotográfico comparando crazing térmico vs defecto de fabricación.",
      image: "/media/sac-luna-craquelado.png",
      imageAlt: "Craquelado reticular por calor en tratamiento antirreflejo",
    },
    {
      id: "delaminacion-escamas-fabrica",
      title: "Desprendimiento en láminas por falta de adherencia",
      label: "Falla de vacío",
      tone: "seguro",
      context: "Tratamiento antirreflejo que se despega en forma de láminas o cáscaras desde el borde sin calor.",
      observe: "El polímero no presenta red reticular; el recubrimiento se levanta como película desprendida.",
      action: "Se valida como falla de adherencia en campana de vacío y se aprueba garantía inmediata de planta.",
      evidence: "Fotografía macro de la escama levantada y orden de sustitución por garantía.",
      image: "/media/sac-luna-03.png",
      imageAlt: "Delaminación en escamas del recubrimiento antirreflejo",
    },
    {
      id: "inspeccion-luz-rasante",
      title: "Método de contraste en mesa de inspección",
      label: "Técnica SAC",
      tone: "seguro",
      context: "Inspección técnica de lunas ingresadas por reclamo de visión borrosa.",
      observe: "Bajo luz cenital difusa el defecto es imperceptible; a 45° con haz focalizado salta a la vista.",
      action: "Colocar la luna sobre paño negro mate e iluminar a 45 grados con haz LED rasante.",
      evidence: "Registro fotográfico capturado bajo el protocolo de luz rasante estandarizado.",
      image: "/media/sac-luna-dictamen.png",
      imageAlt: "Inspección de lunas con luz rasante y fondo oscuro",
    },
  ],
  "sac-luna-04": [
    {
      id: "altura-pupilar-asimetrica",
      title: "Discrepancia de altura pupilar en progresivo",
      label: "Ajuste fisonómico",
      tone: "pausa",
      context: "Paciente con multifocales refiere que debe levantar el mentón para leer el teléfono celular.",
      observe: "La cruz de ajuste de la luna derecha quedó montada 2 mm por debajo del centro pupilar real.",
      action: "Se verifica que la altura montada es 16 mm pero la anatómica del paciente es 18 mm. Se programa reposición.",
      evidence: "Foto del paciente con montura calibrada y marcas de centrado señaladas con plumón.",
      image: "/media/sac-luna-multifocal.png",
      imageAlt: "Medición de alturas pupilares con regla milimetrada en armazón",
    },
    {
      id: "angulo-pantoscopico-inadecuado",
      title: "Corrección de inclinación pantoscópica en tienda",
      label: "Solución en taller",
      tone: "seguro",
      context: "Usuario experimenta campo de lectura cercano sumamente estrecho en montura metálica.",
      observe: "El ángulo pantoscópico es de 2 grados (completamente vertical); la distancia al vértice es de 16 mm.",
      action: "Se ajustan las charnelas y plaquetas para lograr 10° de inclinación y 12 mm de distancia al vértice.",
      evidence: "Prueba visual con cartilla de lectura confirmando ampliación inmediata del campo visual.",
      image: "/media/sac-luna-04.png",
      imageAlt: "Ajuste de ángulo pantoscópico en charnelas de la montura",
    },
    {
      id: "reconstruccion-marcas-laser",
      title: "Identificación de diseño y adición grabada",
      label: "Auditoría óptica",
      tone: "seguro",
      context: "Verificación de reclamo de multifocal recibido sin marcas de montaje impresas.",
      observe: "Los micrograbados láser son visibles al trasluz con luz puntual de alta intensidad.",
      action: "Se marcan los círculos de referencia láser y se mide la distancia a la cruz con la regleta del fabricante.",
      evidence: "Plantilla de reconstrucción superpuesta confirmando adición +2.25 D y código de diseño.",
      image: "/media/sac-luna-dictamen.png",
      imageAlt: "Reconstrucción de marcas láser con regleta milimétrica",
    },
  ],
  "sac-luna-05": [
    {
      id: "cotejo-potencia-lensometro",
      title: "Medición exacta de esfera y cilindro en recepción",
      label: "Control de calidad",
      tone: "seguro",
      context: "Recepción de lunas nuevas recién enviadas por el laboratorio antes de entrega.",
      observe: "La receta solicita OD: -2.00 -1.00 x 90°; el lensómetro marca OD: -2.00 -1.00 x 91° (dentro de tolerancia).",
      action: "Se validan los centros ópticos, se imprime el ticket del lensómetro y se anexa al sobre de entrega.",
      evidence: "Tira de papel impresa del lensómetro digital grapada a la orden de trabajo.",
      image: "/media/sac-luna-dictamen.png",
      imageAlt: "Pantalla del lensómetro digital mostrando graduación medida",
    },
    {
      id: "desviacion-eje-cilindro",
      title: "Detección de rotación de eje no tolerada",
      label: "Rechazo interno",
      tone: "atencion",
      context: "Auditoría de luna cilíndrica de -2.50 DC con prescripción de eje a 180°.",
      observe: "El lensómetro marca eje a 172° (desviación de 8 grados, superando el límite ANSI de 2 grados).",
      action: "Se rechaza internamente antes de que el cliente acuda a tienda y se ordena reposición express.",
      evidence: "Reporte de no conformidad interno con foto del lensómetro y prescripción médica.",
      image: "/media/sac-luna-05.png",
      imageAlt: "Desviación de eje astigmático fuera de tolerancia normativa",
    },
    {
      id: "registro-ficha-tecnica-lunas",
      title: "Llenado de ficha técnica de ingreso en garantía",
      label: "Trazabilidad SAC",
      tone: "seguro",
      context: "Ingreso de una luna en reclamo con registro formal de parámetros.",
      observe: "Un reclamo sin lensometría previa carece de sustento para reclamo ante el proveedor óptico.",
      action: "Completar potencia real, eje, prisma inducido, altura pupilar y estado del bisel en la ficha digital.",
      evidence: "Ficha técnica SAC firmada digitalmente con código QR de trazabilidad.",
      image: "/media/sac-hero-recepcion.png",
      imageAlt: "Asesor completando ficha técnica en tablet de atención",
    },
  ],
  "sac-luna-06": [
    {
      id: "cuatro-fotos-estandar",
      title: "Set completo de 4 fotografías obligatorias",
      label: "Protocolo visual",
      tone: "seguro",
      context: "Apertura de caso de garantía en plataforma SAC.",
      observe: "El laboratorio rechaza expedientes que solo contienen una foto borrosa o incompleta.",
      action: "Tomar Foto 1 (panorámica), Foto 2 (macro rasante), Foto 3 (lensómetro/láser) y Foto 4 (montura).",
      evidence: "Las 4 fotos cargadas con nitidez, sin reflejos que impidan ver el defecto analizado.",
      image: "/media/sac-luna-dictamen.png",
      imageAlt: "Set de 4 fotografías técnicas requeridas para garantía de lunas",
    },
    {
      id: "macro-luz-rasante-enfoque",
      title: "Técnica de enfoque macro para craquelado",
      label: "Fotografía técnica",
      tone: "seguro",
      context: "Captura de la microfractura del tratamiento antirreflejo para sustentar el reclamo.",
      observe: "El flash directo ciega la cámara; la luz lateral a 30 grados destaca el relieve de la falla.",
      action: "Apagar flash de la cámara, colocar linterna LED lateral y enfocar manualmente a 10 cm con fondo negro.",
      evidence: "Imagen macro 1080p con textura de microfisuras perfectamente definidas.",
      image: "/media/sac-luna-craquelado.png",
      imageAlt: "Detalle macrofotográfico con haz rasante enfocado en el defecto",
    },
    {
      id: "carga-ticket-sistema-sac",
      title: "Asociación de fotos al expediente del cliente",
      label: "Gestión digital",
      tone: "seguro",
      context: "Finalización del ingreso de evidencia en el sistema de gestión.",
      observe: "El archivo digital sincroniza en tiempo real con el equipo de control de calidad central.",
      action: "Verificar compresión sin pérdida, nombrar archivos con código de orden y confirmar carga al 100%.",
      evidence: "Ticket con estado 'Enviado a Auditoría' y las 4 fotos validadas en verde.",
      image: "/media/sac-luna-06.png",
      imageAlt: "Pantalla del sistema de gestión con fotos adjuntas al ticket",
    },
  ],
  "sac-luna-07": [
    {
      id: "contencion-cliente-mareo",
      title: "Contención empática ante síntoma de desadaptación",
      label: "Comunicación asertiva",
      tone: "seguro",
      context: "Paciente alterado porque siente que 'las gafas nuevas le deforman el suelo al caminar'.",
      observe: "El paciente teme que su dinero se haya perdido o que sus ojos sufran daños permanentes.",
      action: "Validar su experiencia: 'Entiendo que esto le cause alarma; vamos a revisarlo juntos técnicamente'.",
      evidence: "Registro de atención con desescalamiento y citación programada para refracción.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Asesor dialogando amablemente con paciente preocupado",
    },
    {
      id: "tiempos-auditoria-laboratorio",
      title: "Claridad en tiempos de respuesta de 24-48 horas",
      label: "Manejo de expectativas",
      tone: "seguro",
      context: "El cliente exige que le fabriquen unas lunas nuevas en el acto en la tienda.",
      observe: "Hacer promesas inmediatas imposibles de cumplir genera desconfianza y conflictos mayores.",
      action: "Explicar el procedimiento de auditoría en laboratorio con un plazo certero de 24 a 48 horas hábiles.",
      evidence: "Ticket con fecha y hora pactada para la comunicación del dictamen.",
      image: "/media/sac-luna-07.png",
      imageAlt: "Asesor indicando el cronograma de auditoría en la orden de servicio",
    },
    {
      id: "entrega-ticket-custodia",
      title: "Emisión de comprobante de custodia y recepción",
      label: "Seguridad y custodia",
      tone: "seguro",
      context: "El cliente deja su montura con las lunas para ser enviadas al laboratorio.",
      observe: "El cliente necesita tener constancia legal del valor y estado en que deja su producto.",
      action: "Emite el ticket digital con código único SAC, fotos adjuntas y teléfonos de contacto para consultas.",
      evidence: "Ticket físico o digital entregado con firma de recepción conforme.",
      image: "/media/sac-hero-recepcion.png",
      imageAlt: "Comprobante digital de recepción por garantía",
    },
  ],
  "sac-luna-08": [
    {
      id: "dictamen-laboratorio-procedente",
      title: "Reposición prioritaria por garantía procedente",
      label: "Cierre exitoso",
      tone: "seguro",
      context: "El laboratorio emite dictamen aprobatorio confirmando craquelado por estrés de vacío.",
      observe: "La reposición entra a producción urgente con código de garantía SAC.",
      action: "Al recibir las lunas nuevas, verifica lensometría y bisel, y coordina la entrega inmediata al cliente.",
      evidence: "Orden de reposición cerrada con acta de entrega de lunas nuevas y conformidad del usuario.",
      image: "/media/sac-luna-dictamen.png",
      imageAlt: "Informe técnico de garantía aprobada por laboratorio",
    },
    {
      id: "dictamen-no-procedente-alternativas",
      title: "Sustento técnico de exclusión y oferta comercial",
      label: "Manejo de rechazo",
      tone: "atencion",
      context: "El dictamen concluye daño químico por solventes externos (alcohol); no cubierto por garantía.",
      observe: "Entregar solo la negativa genera frustración; mostrar el informe del laboratorio con alternativas comerciales salva la relación.",
      action: "Explica el informe con fotos macro y ofrece el descuento de reposición por fidelización del 30%.",
      evidence: "Acta de notificación con informe de laboratorio y aceptación de alternativa comercial.",
      image: "/media/sac-luna-08.png",
      imageAlt: "Asesor explicando informe de laboratorio al cliente",
    },
    {
      id: "cierre-trazabilidad-kpi",
      title: "Cierre de ticket y métricas de calidad",
      label: "Auditoría de calidad",
      tone: "seguro",
      context: "Finalización de la atención en la plataforma de gestión SAC.",
      observe: "La trazabilidad de tiempos y motivos nutre los reportes mensuales de calidad de proveedores.",
      action: "Registra fecha de cierre, conformidad del paciente y clasifica el motivo raíz de la garantía.",
      evidence: "Ticket cerrado al 100% con trazabilidad completa de inicio a fin.",
      image: "/media/sac-conversacion-cliente.png",
      imageAlt: "Registro digital de cierre en plataforma SAC",
    },
  ],
  "sac-no-01": [
    {
      id: "no-limite-transparente",
      title: "Límite técnico expresado con seguridad y cortesía",
      label: "Asertividad correcta",
      tone: "seguro",
      context: "El cliente solicita forzar un armazón de pasta cristalizado para que quede más estrecho.",
      observe: "Aceptar la manipulación provocaría la fractura inevitable del puente de la montura.",
      action: "Explica con calma que el material ha perdido flexibilidad por los años y que forzarlo rompería el aro.",
      evidence: "El cliente comprende la limitación física y acepta una solución alternativa sin incidentes.",
      image: "/media/sac-no-01.png",
      imageAlt: "Asesor explicando límites de manipulación con serenidad",
    },
    {
      id: "no-promesa-falsa-riesgo",
      title: "El error de prometer lo imposible por complacencia",
      label: "Falla de complacencia",
      tone: "pausa",
      context: "Asesor acepta ajustar patillas resecas diciendo 'voy a intentar con cuidado a ver si aguanta'.",
      observe: "La patilla se rompe y el cliente reclama indignado que 'en la óptica se la malograron'.",
      action: "Detén la intervención antes de calentar; la complacencia sin garantía documentada es falta grave.",
      evidence: "Constancia de advertencia previa y negativa a forzar materiales cristalinos.",
      image: "/media/sac-no-sandwich.png",
      imageAlt: "Explicación de riesgos antes de manipular monturas delicadas",
    },
    {
      id: "no-comunicacion-clara",
      title: "Firmeza institucional sin rudeza",
      label: "Protocolo asertivo",
      tone: "atencion",
      context: "Cliente insiste en que le cambien un tornillo barrido con pegamento instantáneo dentro del barril.",
      observe: "Usar fuerza dañará la bisagra integrada de la montura de marca de alto costo.",
      action: "Explica con respeto el daño interno de la rosca y orienta a un cambio de frente o varilla.",
      evidence: "Inspección fotográfica del barril barrido y alternativas de repuesto comunicadas.",
      image: "/media/sac-no-01.png",
      imageAlt: "Inspección detallada de bisagra y comunicación de límites",
    },
  ],
  "sac-no-02": [
    {
      id: "sandwich-caso-ajuste",
      title: "Aplicación impecable de la técnica sandwich",
      label: "Técnica Sandwich",
      tone: "seguro",
      context: "Cliente con prisa exige entrega en 30 minutos de lunas con tratamiento antirreflejo especial.",
      observe: "El cliente tiene prisa genuina pero el curado de la capa exige 4 horas de reposo.",
      action: "1. Empatía ('Entiendo su urgencia'). 2. Límite ('El curado de calidad requiere 4 horas'). 3. Alternativa ('Le prestamos montura o enviamos sin costo a su oficina a las 5 pm').",
      evidence: "Cliente aliviado y agradecido por el envío a domicilio sin arriesgar la calidad óptica.",
      image: "/media/sac-no-sandwich.png",
      imageAlt: "Técnica sandwich aplicada en mostrador de óptica",
    },
    {
      id: "sandwich-error-no-cortante",
      title: "El NO cortante que destruye la relación",
      label: "Mala práctica",
      tone: "pausa",
      context: "El asesor contesta con un frío 'No se puede, regrese mañana' sin dar explicaciones.",
      observe: "La respuesta seca genera frustración inmediata y reclamo por maltrato en atención.",
      action: "Corrige de inmediato: acompaña toda negativa con el motivo técnico y una propuesta de apoyo.",
      evidence: "Capacitación en técnicas de comunicación empática y resolución asertiva.",
      image: "/media/sac-no-02.png",
      imageAlt: "Comunicación constructiva frente a respuestas cortantes",
    },
    {
      id: "sandwich-alternativa-firme",
      title: "Límite firme con doble propuesta de solución",
      label: "Resolución efectiva",
      tone: "seguro",
      context: "Cliente desea adaptar lunas talladas a un armazón que no tiene la ranura de bisel adecuada.",
      observe: "Reconocer la preferencia del cliente por su montura favorita pero señalar la incompatibilidad física.",
      action: "Propone biselar a una montura de medidas similares o pedir lunas personalizadas para esa curva.",
      evidence: "Cotización de alternativas viables aceptada de mutuo acuerdo.",
      image: "/media/sac-no-sandwich.png",
      imageAlt: "Asesor ofreciendo alternativas compatibles en mostrador",
    },
  ],
  "sac-no-03": [
    {
      id: "taller-acetato-reseco",
      title: "Negativa a calentar acetato reseco y blanquecino",
      label: "Prevención en taller",
      tone: "pausa",
      context: "Montura de más de 4 años con eflorescencia blanquecina en puente y codos.",
      observe: "El calentador evaporará los escasos plastificantes restantes provocando una fractura seca.",
      action: "Muestra la resequedad al cliente y declina el calentamiento térmico por alto riesgo de rotura.",
      evidence: "Ficha de inspección de riesgo alto con registro de resequedad estructural.",
      image: "/media/sac-no-riesgo-taller.png",
      imageAlt: "Detalle macro de microfisura y envejecimiento de acetato",
    },
    {
      id: "taller-soldadura-fragil",
      title: "Rechazo de soldadura fría sobre puente metálico fatigado",
      label: "Límite técnico",
      tone: "atencion",
      context: "Armazón metálico que ya fue soldado anteriormente con estaño casero en el puente nasal.",
      observe: "Una nueva aplicación térmica destruirá el baño galvánico y desoldará los brazos de plaqueta.",
      action: "Explica que la soldadura casera desnaturalizó el metal y recomienda cambio de armazón.",
      evidence: "Informe fotográfico de soldadura previa irregular y advertencia de riesgo.",
      image: "/media/sac-no-03.png",
      imageAlt: "Inspección técnica de puente metálico fatigado",
    },
    {
      id: "taller-explicacion-macro",
      title: "Evidencia visual compartida para convencer sin discutir",
      label: "Evidencia pedagógica",
      tone: "seguro",
      context: "Cliente duda de la advertencia técnica y cree que el técnico 'no quiere trabajar'.",
      observe: "Las palabras pueden generar desconfianza; la imagen macro ampliada en pantalla es irrefutable.",
      action: "Coloca la montura bajo la cámara de aumento y muestra la grieta viva en la pantalla.",
      evidence: "Fotografía macro archivada en el ticket digital y conformidad del cliente.",
      image: "/media/sac-no-riesgo-taller.png",
      imageAlt: "Cámara macro mostrando microgrieta interna de montura",
    },
  ],
  "sac-no-04": [
    {
      id: "receta-vencida-seguridad",
      title: "Negativa clínica ante receta óptica de 3 años de antigüedad",
      label: "Ética clínica",
      tone: "seguro",
      context: "Paciente solicita fabricar lunas progresivas de alto costo con receta emitida en 2023.",
      observe: "Fabricar con esa fórmula provocará mala visión, dolores de cabeza y reclamos por garantía.",
      action: "Explica que por su salud visual y precisión óptica se requiere refracción actualizada.",
      evidence: "Derivación prioritaria a gabinete optométrico para refracción de cortesía.",
      image: "/media/sac-no-04.png",
      imageAlt: "Optómetra explicando la vigencia de la receta médica",
    },
    {
      id: "receta-presion-comercial",
      title: "Resistir la presión del 'hágamelo bajo mi responsabilidad'",
      label: "Firmeza profesional",
      tone: "pausa",
      context: "Cliente firma que asume el riesgo con tal de no hacerse el examen.",
      observe: "Legalmente la óptica es responsable por fabricar un producto sanitario sin receta válida.",
      action: "Reitera con firmeza y calidez que el estándar clínico no permite fabricar a ciegas.",
      evidence: "Protocolo de refracción médica obligatoria aplicado con total integridad.",
      image: "/media/sac-no-04.png",
      imageAlt: "Optómetra manteniendo el estándar clínico de refracción",
    },
    {
      id: "receta-examen-cortesia",
      title: "El examen optométrico como puente de resolución",
      label: "Solución clínica",
      tone: "seguro",
      context: "El cliente acepta la recomendación al comprender el beneficio para su confort visual.",
      observe: "La refracción revela un aumento de astigmatismo que la receta antigua no contemplaba.",
      action: "Realiza la refracción en gabinete y emite la prescripción actualizada con éxito.",
      evidence: "Nueva receta emitida con graduación perfecta y cliente plenamente satisfecho.",
      image: "/media/sac-no-alternativas.png",
      imageAlt: "Optometrista realizando refracción de control en gabinete",
    },
  ],
  "sac-no-05": [
    {
      id: "garantia-impacto-rayadura",
      title: "Denegación técnica de garantía por rayaduras mecánicas",
      label: "Dictamen de garantía",
      tone: "atencion",
      context: "Cliente reclama garantía de antirreflejo en lunas con rayones circulares por limpiarlas en seco con papel toalla.",
      observe: "El antirreflejo no está craquelado ni desprendido; los surcos corresponden a abrasión mecánica por sílice.",
      action: "Muestra bajo lámpara de luz rasante el patrón circular de abrasión y comunica la improcedencia.",
      evidence: "Informe con fotos macro diferenciando rayas de fricción frente a craquelado térmico.",
      image: "/media/sac-no-05.png",
      imageAlt: "Examen de rayas mecánicas con luz rasante en mostrador",
    },
    {
      id: "garantia-descuento-comercial",
      title: "Ofrecimiento de plan renueva con descuento de fidelización",
      label: "Fidelización activa",
      tone: "seguro",
      context: "Tras comunicar la improcedencia de garantía, el cliente se siente decepcionado por el costo de reposición.",
      observe: "Dejar ir al cliente con las manos vacías genera un detractor de la marca.",
      action: "Ofrece el plan renueva SAC con 40% de descuento de cortesía comercial y spray limpiador gratis.",
      evidence: "Orden de compra con descuento comercial de fidelización y cliente retenido.",
      image: "/media/sac-no-alternativas.png",
      imageAlt: "Presentación de opciones de reposición con descuento especial",
    },
    {
      id: "garantia-informe-microscopico",
      title: "Sustento fotográfico irrefutable del laboratorio",
      label: "Sustento técnico",
      tone: "seguro",
      context: "Cliente alega que 'las lunas vinieron así de fábrica'.",
      observe: "La inspección de control de calidad previa a la entrega demuestra que salieron sin defectos.",
      action: "Presenta el acta de entrega original firmada y el informe microscópico actual.",
      evidence: "Documentación contrastada y acuerdo de renovación asistida.",
      image: "/media/sac-no-05.png",
      imageAlt: "Comparativa de informes técnicos de entrega y laboratorio",
    },
  ],
  "sac-no-06": [
    {
      id: "desescalamiento-voz-calma",
      title: "Modulación de voz ante cliente alterado",
      label: "Desescalamiento",
      tone: "seguro",
      context: "Un cliente alza la voz en la tienda exigiendo reembolso inmediato sin comprobante.",
      observe: "Responder al mismo volumen desata una discusión pública que asusta a otros usuarios.",
      action: "Baja el tono, habla con pausas deliberadas y mantén una mirada comprensiva y firme.",
      evidence: "El cliente baja gradualmente su volumen al no encontrar confrontación refleja.",
      image: "/media/sac-no-desescalamiento.png",
      imageAlt: "Asesor manteniendo postura serena y lenguaje no verbal de calma",
    },
    {
      id: "desescalamiento-espacio-privado",
      title: "Invitación a espacio de asesoría privada",
      label: "Contención de entorno",
      tone: "seguro",
      context: "La tensión en el mostrador principal interrumpe el flujo normal de las ventas.",
      observe: "El cliente hostil se siente observado y su orgullo le impide retroceder en público.",
      action: "'Acompáñeme a esta mesa con un vaso con agua para revisar juntos los detalles con la debida calma'.",
      evidence: "Atención personalizada en área privada con reducción total de la agresividad.",
      image: "/media/sac-no-06.png",
      imageAlt: "Atención privada en mesa de asesoría para resolver casos complejos",
    },
    {
      id: "desescalamiento-evitar-contienda",
      title: "Evitar palabras detonantes como 'cálmese' o 'no grite'",
      label: "Comunicación no violenta",
      tone: "pausa",
      context: "El asesor intenta calmar al usuario diciendo 'señor cálmese que no está en su casa'.",
      observe: "Las frases de reproche multiplican la indignación del usuario exponencialmente.",
      action: "Usa frases puente: 'Entiendo lo frustrante de la situación; veamos cómo podemos solucionarlo'.",
      evidence: "Registro de desescalamiento exitoso sin quejas formales en el libro de reclamaciones.",
      image: "/media/sac-no-desescalamiento.png",
      imageAlt: "Comunicación empática y asertiva que disuelve la hostilidad",
    },
  ],
  "sac-no-07": [
    {
      id: "alternativas-bandeja-opciones",
      title: "Presentación de la bandeja de 2 soluciones viables",
      label: "Menú de alternativas",
      tone: "seguro",
      context: "Cliente no puede acceder a la garantía de fábrica por haber transcurrido 18 meses.",
      observe: "Decir simplemente 'su garantía expiró' cierra el diálogo y frustra al paciente.",
      action: "Presenta 2 vías: 1) Pulido y cambio de plaquetas sin costo, o 2) Reposición de lunas con 45% de descuento.",
      evidence: "El cliente evalúa ambas propuestas y elige la reposición con descuento agradeciendo la atención.",
      image: "/media/sac-no-alternativas.png",
      imageAlt: "Bandeja de presentación de alternativas y soluciones viables",
    },
    {
      id: "alternativas-sin-salida",
      title: "El error de cerrar puertas sin opciones de salida",
      label: "Mala práctica",
      tone: "pausa",
      context: "El asesor le dice al usuario 'ya no se puede hacer nada con sus lentes' y se da media vuelta.",
      observe: "El usuario siente abandono total por parte de la marca y busca a la competencia.",
      action: "Siempre acompaña un límite con al menos dos opciones viables de solución o renovación.",
      evidence: "Protocolo de alternativas obligatorias aplicado en el 100% de atenciones complejas.",
      image: "/media/sac-no-07.png",
      imageAlt: "Reorientación de la atención hacia propuestas constructivas",
    },
    {
      id: "alternativas-acompanamiento",
      title: "Acompañamiento en la selección de la mejor alternativa",
      label: "Asesoría consultiva",
      tone: "seguro",
      context: "El cliente no sabe cuál de las dos opciones le conviene más según su presupuesto.",
      observe: "El asesor compara tiempos, durabilidad y costo con total transparencia.",
      action: "Explica objetivamente los beneficios de cada alternativa para que el cliente elija seguro.",
      evidence: "Elección informada del cliente y cierre de venta con fidelización duradera.",
      image: "/media/sac-no-alternativas.png",
      imageAlt: "Asesor guiando al cliente en la toma de decisiones informada",
    },
  ],
  "sac-no-08": [
    {
      id: "cierre-acta-deslinde",
      title: "Emisión y lectura transparente del acta de deslinde",
      label: "Respaldo formal",
      tone: "seguro",
      context: "El cliente decide continuar con una manipulación leve bajo advertencia de fragilidad del material.",
      observe: "Si no existe firma previa, cualquier rotura accidental recaerá sobre el técnico que intervino.",
      action: "Lee junto al cliente los puntos del acta de advertencia y solicita su firma de consentimiento.",
      evidence: "Acta firmada con checklist de estado previo y fotos adjuntas en el sistema SAC.",
      image: "/media/sac-no-08.png",
      imageAlt: "Revisión conjunta del acta de deslinde técnico informado",
    },
    {
      id: "cierre-firma-cliente",
      title: "Consentimiento informado sin letra chica ni engaños",
      label: "Transparencia legal",
      tone: "seguro",
      context: "El documento debe ser claro, conciso y redactado en lenguaje comprensible para el usuario.",
      observe: "Términos legales incomprensibles generan desconfianza y resistencia a la firma.",
      action: "Usa el formato estandarizado SAC que destaca en negrita los hallazgos y acuerdos concretos.",
      evidence: "Firma digital del cliente registrada con huella o firma en tableta digital.",
      image: "/media/sac-no-08.png",
      imageAlt: "Firma de conformidad informada en tableta digital en mostrador",
    },
    {
      id: "cierre-trazabilidad-crm",
      title: "Cierre de ticket en plataforma y seguimiento post-venta",
      label: "Trazabilidad SAC",
      tone: "seguro",
      context: "Culminación del caso con resolución de alternativa comercial o deslinde aprobado.",
      observe: "Registrar el motivo de la negativa alimenta las métricas de calidad y previene fraudes.",
      action: "Sube las fotos, clasifica la causa raíz y programa una llamada de seguimiento a los 7 días.",
      evidence: "Ticket cerrado con calificación 5 estrellas en encuesta de satisfacción post-atención.",
      image: "/media/sac-no-sandwich.png",
      imageAlt: "Registro y cierre formal de caso en la plataforma informática SAC",
    },
  ],
};

export const questionBank: QuizQuestion[] = [
  {
    id: "sac-q-001",
    moduleId: "sac-01",
    role: "Todos",
    difficulty: "Básica",
    prompt: "Al iniciar una recepción, ¿qué acción establece una línea base confiable?",
    options: [
      "Solicitar la aceptación y revisar el producto después",
      "Guardar el producto y completar la ficha al finalizar el trabajo",
      "Confirmar el servicio e inspeccionar el producto junto con el cliente",
      "Preguntar solo cuánto tiempo tiene el armazón",
    ],
    answer: 2,
    explanation:
      "Confirmar la solicitud e inspeccionar juntos permite acordar el estado inicial antes de cualquier manipulación.",
  },
  {
    id: "sac-q-002",
    moduleId: "sac-01",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "El armazón parece estable y no presenta daños evidentes. ¿Qué corresponde?",
    options: [
      "Omitir el registro porque no hay novedades",
      "Completar la revisión y registrar el estado observado",
      "Prometer que el procedimiento no modificará el producto",
      "Registrar únicamente la marca y el color",
    ],
    answer: 1,
    explanation:
      "La ausencia de una novedad visible también forma parte de la línea base y debe quedar respaldada por una revisión completa.",
  },
  {
    id: "sac-q-003",
    moduleId: "sac-01",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es la secuencia más adecuada antes de solicitar la aceptación?",
    options: [
      "Revisar, mostrar, explicar, registrar y confirmar comprensión",
      "Registrar, firmar, revisar y explicar si existe una duda",
      "Explicar, firmar, fotografiar y decidir el nivel de riesgo",
      "Fotografiar, guardar el producto y completar la revisión más tarde",
    ],
    answer: 0,
    explanation:
      "La aceptación se solicita al final de una explicación respaldada por revisión y evidencia, no antes.",
  },
  {
    id: "sac-q-004",
    moduleId: "sac-01",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Qué función cumple la aceptación del cliente dentro del protocolo?",
    options: [
      "Autoriza a omitir controles cuando el local está ocupado",
      "Garantiza que no existirá una inconformidad posterior",
      "Traslada al cliente todas las decisiones técnicas",
      "Registra que recibió la explicación y expresó su decisión",
    ],
    answer: 3,
    explanation:
      "La aceptación documenta la comunicación; no sustituye controles, cuidado técnico ni validaciones internas.",
  },
  {
    id: "sac-q-005",
    moduleId: "sac-01",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "Durante la revisión aparece una línea cuya naturaleza no puede confirmar. ¿Cuál es la mejor decisión?",
    options: [
      "Continuar con una maniobra suave para comprobar si la línea cambia",
      "Pausar, documentar la zona y solicitar una validación",
      "Clasificarla como desgaste superficial sin registrarla",
      "Pedir la firma y dejar la evaluación para el final",
    ],
    answer: 1,
    explanation:
      "Una duda estructural debe resolverse antes de intervenir; probar mediante manipulación puede agravar una condición existente.",
  },
  {
    id: "sac-q-006",
    moduleId: "sac-01",
    role: "Asesor",
    difficulty: "Avanzada",
    prompt: "Hay varios clientes esperando y la recepción no presenta novedades aparentes. ¿Cómo conserva la calidad sin crear un cuello de botella?",
    options: [
      "Solicita una firma anticipada y completa la inspección cuando tenga tiempo",
      "Reduce la revisión a una fotografía frontal",
      "Aplica una secuencia breve pero completa y registra cada control esencial",
      "Recibe el producto y pide a otra persona que explique después",
    ],
    answer: 2,
    explanation:
      "La eficiencia proviene de una secuencia consistente, no de omitir los controles que establecen el estado inicial.",
  },
  {
    id: "sac-q-007",
    moduleId: "sac-02",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué conjunto incluye componentes estructurales que deben revisarse siempre?",
    options: [
      "Estuche, paño, etiqueta y funda",
      "Aro, puente, bisagras, varillas y terminales",
      "Color, estilo, precio y colección",
      "Receta, factura, empaque y publicidad",
    ],
    answer: 1,
    explanation:
      "Aro, puente, bisagras, varillas y terminales transmiten o soportan cargas durante el uso y la manipulación.",
  },
  {
    id: "sac-q-008",
    moduleId: "sac-02",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "Una bisagra abre con resistencia y produce un chasquido. ¿Qué debe hacer?",
    options: [
      "Abrirla varias veces hasta que se libere",
      "Aplicar lubricante antes de documentar",
      "Compararla solo con el color de la otra bisagra",
      "Detener la prueba, registrar el hallazgo y evaluar su riesgo",
    ],
    answer: 3,
    explanation:
      "La resistencia y el ruido son señales funcionales; insistir puede introducir una tensión innecesaria.",
  },
  {
    id: "sac-q-009",
    moduleId: "sac-02",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es el registro más verificable de una novedad?",
    options: [
      "Fisura fina de 4 mm junto a la bisagra derecha, visible en fotografía de detalle",
      "Armazón en estado regular para su antigüedad",
      "Tiene una marca pequeña que parece normal",
      "Producto usado con algunos detalles generales",
    ],
    answer: 0,
    explanation:
      "La descripción precisa ubicación, tamaño y evidencia, por lo que otra persona puede verificarla.",
  },
  {
    id: "sac-q-010",
    moduleId: "sac-02",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Se observa residuo de adhesivo cerca del puente. ¿Qué interpretación es más prudente?",
    options: [
      "El adhesivo confirma que el puente es más resistente",
      "El residuo es solo estético y no cambia la evaluación",
      "Puede indicar una reparación previa y debe investigarse antes de manipular",
      "La única acción necesaria es retirar el adhesivo",
    ],
    answer: 2,
    explanation:
      "Un adhesivo en una zona de carga puede ocultar una reparación y modificar la respuesta del material.",
  },
  {
    id: "sac-q-011",
    moduleId: "sac-02",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "Las varillas parecen desalineadas, pero el puente muestra blanqueamiento del material. ¿Qué prioriza?",
    options: [
      "Corregir primero la simetría para evaluar el resultado",
      "Documentar el puente y validar su integridad antes de ajustar",
      "Calentar ambas varillas para equilibrar la tensión",
      "Cambiar los tornillos y repetir la inspección",
    ],
    answer: 1,
    explanation:
      "El blanqueamiento puede revelar tensión o degradación; la integridad estructural se evalúa antes de buscar simetría.",
  },
  {
    id: "sac-q-012",
    moduleId: "sac-02",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Una fotografía no muestra fisuras, pero la inspección con luz lateral revela una. ¿Qué conclusión corresponde?",
    options: [
      "La fotografía invalida el hallazgo visual",
      "La fisura puede omitirse porque no aparece en la primera imagen",
      "El caso conserva el nivel definido antes de usar la luz lateral",
      "Debe actualizarse el registro y obtener una imagen que haga visible la fisura",
    ],
    answer: 3,
    explanation:
      "La evidencia debe adaptarse al hallazgo real; una imagen insuficiente no reemplaza una inspección mejor iluminada.",
  },
  {
    id: "sac-q-013",
    moduleId: "sac-03",
    role: "Optómetra",
    difficulty: "Básica",
    prompt: "¿Cuándo debe considerarse el uso de calor controlado?",
    options: [
      "Siempre que el armazón sea usado",
      "Cuando el cliente necesita una entrega rápida",
      "Cuando la técnica aprobada, el material y la condición lo justifican",
      "Después de cualquier ajuste manual, sin importar el material",
    ],
    answer: 2,
    explanation:
      "El calor es una herramienta condicionada por la técnica y el producto; no constituye un paso automático.",
  },
  {
    id: "sac-q-014",
    moduleId: "sac-03",
    role: "Optómetra",
    difficulty: "Básica",
    prompt: "¿Dónde conviene apoyar el armazón durante un ajuste localizado?",
    options: [
      "Cerca del punto de trabajo y lejos de zonas debilitadas",
      "En la bisagra opuesta para aumentar el recorrido",
      "Sobre la zona reparada para inmovilizarla",
      "En el borde de la luna para distribuir la fuerza",
    ],
    answer: 0,
    explanation:
      "Un apoyo cercano reduce la palanca y evita trasladar carga a bisagras, lunas o reparaciones vulnerables.",
  },
  {
    id: "sac-q-015",
    moduleId: "sac-03",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Durante el calentamiento localizado, el material cambia ligeramente de color. ¿Qué corresponde?",
    options: [
      "Reducir un poco la temperatura y terminar el ajuste",
      "Mover el calor a una zona más amplia",
      "Enfriar y repetir de inmediato con mayor apoyo",
      "Detener el procedimiento, proteger el producto y reevaluar",
    ],
    answer: 3,
    explanation:
      "Un cambio de color es una reacción inesperada; continuar puede agravarla antes de comprender su causa.",
  },
  {
    id: "sac-q-016",
    moduleId: "sac-03",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Cuál es la explicación más clara antes de un ajuste que podría requerir calor?",
    options: [
      "Aplicaremos calor porque todos los armazones se ajustan de la misma forma",
      "Según el material y el estado, el técnico definirá si necesita calor controlado y revisará la respuesta en cada paso",
      "El calor no cambia ningún material cuando lo aplica una persona experta",
      "La firma permite realizar cualquier técnica que sea necesaria",
    ],
    answer: 1,
    explanation:
      "La respuesta correcta explica la condición y el control del proceso sin generalizar ni prometer un resultado.",
  },
  {
    id: "sac-q-017",
    moduleId: "sac-03",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "Un armazón de acetato tiene un adorno adherido junto al punto que requiere ajuste. ¿Qué debe integrar en su decisión?",
    options: [
      "Solo la temperatura habitual del acetato",
      "Solo el tiempo disponible para terminar el trabajo",
      "La sensibilidad del adorno, del adhesivo, de las lunas y del material base",
      "La preferencia del cliente por conservar el adorno",
    ],
    answer: 2,
    explanation:
      "La técnica debe considerar todos los elementos expuestos al calor o a la fuerza, no solo el material principal.",
  },
  {
    id: "sac-q-018",
    moduleId: "sac-03",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "Tras un primer ajuste pequeño, la pieza ofrece más resistencia que al inicio. ¿Cuál es el siguiente paso?",
    options: [
      "Detenerse y revisar si apareció tensión, deformación o una señal estructural",
      "Aplicar una fuerza continua para superar la resistencia",
      "Aumentar el calor hasta recuperar el movimiento inicial",
      "Cambiar el punto de apoyo sin registrar el primer intento",
    ],
    answer: 0,
    explanation:
      "Una respuesta distinta a la prevista exige reevaluación; insistir elimina la oportunidad de detectar un cambio temprano.",
  },
  {
    id: "sac-q-019",
    moduleId: "sac-04",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué determina el nivel de riesgo de una recepción?",
    options: [
      "La antigüedad por sí sola",
      "La combinación de estado, reparaciones, material, antigüedad y procedimiento",
      "La cantidad de clientes que esperan",
      "La disposición del cliente a firmar",
    ],
    answer: 1,
    explanation:
      "La clasificación es multivariable y debe apoyarse en hechos observables y en la exigencia del trabajo.",
  },
  {
    id: "sac-q-020",
    moduleId: "sac-04",
    role: "Todos",
    difficulty: "Básica",
    prompt: "Un caso de riesgo bajo, ¿qué controles conserva?",
    options: [
      "Solo el nombre del cliente y el servicio",
      "La fotografía frontal, pero no la explicación",
      "La revisión, pero no el registro si no existen novedades",
      "Revisión, explicación, registro y confirmación",
    ],
    answer: 3,
    explanation:
      "Bajo no significa ausencia de protocolo; indica que las condiciones observadas permiten continuar con los controles habituales.",
  },
  {
    id: "sac-q-021",
    moduleId: "sac-04",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "Un armazón tiene desgaste moderado y una bisagra con holgura, sin fisuras ni reparaciones visibles. ¿Qué clasificación inicial es más razonable?",
    options: [
      "Bajo, porque la bisagra todavía se mueve",
      "Alto, porque cualquier holgura impide recibir el producto",
      "Medio, con documentación detallada y precaución adicional",
      "No clasificable hasta que el cliente firme",
    ],
    answer: 2,
    explanation:
      "El desgaste y la holgura elevan la precaución, pero sin una señal estructural crítica el caso puede gestionarse inicialmente como medio.",
  },
  {
    id: "sac-q-022",
    moduleId: "sac-04",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué hallazgo obliga a reclasificar un caso mientras se completa la inspección?",
    options: [
      "Una fisura que aparece con iluminación lateral",
      "Una preferencia del cliente por otro horario",
      "Una marca comercial distinta a la registrada",
      "La falta del estuche original",
    ],
    answer: 0,
    explanation:
      "Una fisura cambia la evaluación estructural y exige actualizar el nivel, el registro y la explicación.",
  },
  {
    id: "sac-q-023",
    moduleId: "sac-04",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "Un armazón antiguo está estable, pero el trabajo requiere una manipulación exigente cerca de una soldadura previa. ¿Qué pesa más en la clasificación?",
    options: [
      "Que la apariencia general sea aceptable",
      "Que el cliente conozca la soldadura",
      "Que la soldadura tenga un acabado discreto",
      "La combinación de reparación estructural y exigencia del procedimiento",
    ],
    answer: 3,
    explanation:
      "El riesgo surge de la interacción entre la zona reparada y la carga prevista, incluso si el aspecto general parece estable.",
  },
  {
    id: "sac-q-024",
    moduleId: "sac-04",
    role: "Asesor",
    difficulty: "Avanzada",
    prompt: "El cliente acepta continuar con un caso clasificado como alto, pero aún no existe validación interna. ¿Qué corresponde?",
    options: [
      "Continuar porque la aceptación resuelve el requisito",
      "Mantener la pausa y obtener la validación autorizada",
      "Cambiar el nivel a medio y reforzar las fotografías",
      "Iniciar solo la parte menos compleja del trabajo",
    ],
    answer: 1,
    explanation:
      "La decisión del cliente no reemplaza el control técnico ni la autorización definida para un riesgo alto.",
  },
  {
    id: "sac-q-025",
    moduleId: "sac-05",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "¿Cuál es la mejor forma de iniciar la revisión con el cliente?",
    options: [
      "Necesito que firme antes de revisar su armazón",
      "Revisemos juntos el armazón para registrar su estado antes de intervenirlo",
      "Voy a decidir el riesgo cuando termine el trabajo",
      "Solo necesito saber si alguna vez se le cayó",
    ],
    answer: 1,
    explanation:
      "La frase explica el propósito, invita a participar y sitúa la revisión antes de cualquier intervención.",
  },
  {
    id: "sac-q-026",
    moduleId: "sac-05",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "El cliente dice que tiene prisa y que puede firmar sin explicación. ¿Qué corresponde?",
    options: [
      "Aceptar la firma y enviarle las fotografías después",
      "Resumir solo los riesgos altos y omitir los demás controles",
      "Realizar una explicación breve pero completa y confirmar que la comprendió",
      "Recibir el producto sin registro y completarlo al final del día",
    ],
    answer: 2,
    explanation:
      "La prisa no elimina el deber de revisar, informar y comprobar comprensión; la conversación puede ser ágil sin quedar incompleta.",
  },
  {
    id: "sac-q-027",
    moduleId: "sac-05",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "El cliente no está de acuerdo con una fisura señalada durante la recepción. ¿Cuál es la respuesta profesional?",
    options: [
      "Insistir en que el personal siempre tiene la razón",
      "Retirar la observación para evitar una discusión",
      "Pedir la firma como constancia de que la fisura sí existe",
      "Escuchar, mostrar la evidencia, explicar el hallazgo y pausar si no hay acuerdo",
    ],
    answer: 3,
    explanation:
      "La evidencia y una pausa responsable permiten gestionar el desacuerdo sin presión, confrontación ni alteración del registro.",
  },
  {
    id: "sac-q-028",
    moduleId: "sac-05",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Qué pregunta comprueba mejor que el cliente entendió el procedimiento?",
    options: [
      "¿Podría contarme con sus palabras qué vamos a realizar y qué condición revisaremos?",
      "¿Está de acuerdo con todo lo que le expliqué?",
      "¿Firma aquí para que podamos comenzar?",
      "¿Confía en que nuestro equipo hará lo correcto?",
    ],
    answer: 0,
    explanation:
      "Pedir que la persona explique con sus palabras permite verificar comprensión real, no solo obtener una respuesta afirmativa.",
  },
  {
    id: "sac-q-029",
    moduleId: "sac-05",
    role: "Asesor",
    difficulty: "Avanzada",
    prompt: "¿Qué frase debe evitarse al explicar una reparación previa?",
    options: [
      "Se observa adhesivo cerca de una zona que recibe carga",
      "Esta reparación requiere validación antes de manipular",
      "Si se rompe será porque usted ya lo trajo dañado",
      "Voy a registrar la zona y consultar el siguiente paso",
    ],
    answer: 2,
    explanation:
      "Asignar culpa de antemano es defensivo, inexacto y deteriora la confianza; SAC comunica hechos y acciones verificables.",
  },
  {
    id: "sac-q-030",
    moduleId: "sac-05",
    role: "Asesor",
    difficulty: "Avanzada",
    prompt: "El cliente comprende la explicación, pero decide no aceptar el procedimiento. ¿Qué debe hacer el equipo?",
    options: [
      "Presionarlo porque la recepción ya fue iniciada",
      "Respetar la decisión, documentarla y cerrar o escalar el caso según corresponda",
      "Pedir a otra persona que obtenga la firma",
      "Continuar únicamente con la parte que parezca menos riesgosa",
    ],
    answer: 1,
    explanation:
      "La aceptación debe ser libre e informada; una negativa se respeta y se registra sin ejecutar una intervención no autorizada.",
  },
  {
    id: "sac-q-031",
    moduleId: "sac-06",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué secuencia fotográfica permite reconocer el producto y ubicar sus novedades?",
    options: [
      "Solo un acercamiento de la novedad",
      "Una foto del estuche y otra de la orden",
      "Vistas frontal y laterales, más un detalle de cada novedad",
      "Una fotografía tomada desde cualquier ángulo disponible",
    ],
    answer: 2,
    explanation:
      "Las vistas de contexto identifican orientación y producto; los detalles hacen verificable cada hallazgo.",
  },
  {
    id: "sac-q-032",
    moduleId: "sac-06",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Por qué un acercamiento aislado puede resultar insuficiente?",
    options: [
      "Porque no siempre permite ubicar el hallazgo dentro del producto",
      "Porque las fotos de detalle nunca son válidas",
      "Porque aumenta automáticamente el nivel de riesgo",
      "Porque solo una cámara profesional puede capturar novedades",
    ],
    answer: 0,
    explanation:
      "Sin una vista de contexto, otra persona podría no identificar el lado, el componente o incluso el producto fotografiado.",
  },
  {
    id: "sac-q-033",
    moduleId: "sac-06",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué práctica protege mejor la privacidad durante el registro fotográfico?",
    options: [
      "Fotografiar también el documento del cliente para dar contexto",
      "Enviar las imágenes al chat personal del equipo como respaldo",
      "Conservar el rostro del cliente para demostrar que estuvo presente",
      "Encuadrar solo lo necesario y guardar los archivos en el sistema autorizado",
    ],
    answer: 3,
    explanation:
      "La evidencia debe limitarse a la finalidad del servicio y permanecer en el repositorio autorizado y trazable.",
  },
  {
    id: "sac-q-034",
    moduleId: "sac-06",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "La fotografía de una fisura quedó desenfocada. ¿Qué corresponde antes de cerrar la recepción?",
    options: [
      "Conservarla porque la descripción escrita es suficiente",
      "Repetirla con enfoque, luz y contexto adecuados",
      "Aumentar digitalmente el contraste y borrar la original",
      "Cambiar la descripción para que coincida con lo visible",
    ],
    answer: 1,
    explanation:
      "Una evidencia ilegible debe repetirse mientras el estado inicial aún puede documentarse de manera confiable.",
  },
  {
    id: "sac-q-035",
    moduleId: "sac-06",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Una imagen muestra una deformación que no aparece en la ficha. ¿Qué debe hacerse?",
    options: [
      "Eliminar la imagen para conservar la coherencia",
      "Cerrar la recepción y explicarla solo si surge una consulta",
      "Actualizar la ficha, revisar el nivel y volver a explicar al cliente",
      "Mantener el registro porque la fotografía habla por sí sola",
    ],
    answer: 2,
    explanation:
      "La coherencia se logra completando el expediente y revisando la decisión, no suprimiendo una evidencia válida.",
  },
  {
    id: "sac-q-036",
    moduleId: "sac-06",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué garantiza la trazabilidad de una fotografía?",
    options: [
      "Su asociación al identificador de recepción, vista, hallazgo y momento de captura",
      "Que tenga un tamaño de archivo mayor a un megabyte",
      "Que permanezca también en el teléfono de quien la tomó",
      "Que incluya un filtro para destacar el color del armazón",
    ],
    answer: 0,
    explanation:
      "La trazabilidad permite relacionar la imagen con un caso, una ubicación y un momento verificables.",
  },
  {
    id: "sac-q-037",
    moduleId: "sac-07",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "¿Qué debe hacerse con los valores que aparecen seleccionados por defecto en una ficha?",
    options: [
      "Conservarlos para acelerar todas las recepciones",
      "Comprobar cada uno y cambiarlo cuando no describa el caso",
      "Revisarlos únicamente si el riesgo es alto",
      "Pedir al cliente que los valide después de firmar",
    ],
    answer: 1,
    explanation:
      "Cada campo debe representar la observación real; un valor predeterminado nunca equivale a una verificación.",
  },
  {
    id: "sac-q-038",
    moduleId: "sac-07",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuándo debe mostrarse al cliente el texto de aceptación?",
    options: [
      "Después de guardar la firma",
      "Solo cuando lo solicite expresamente",
      "Antes de aceptar, con tiempo para leer, preguntar y decidir",
      "Al retirar el producto terminado",
    ],
    answer: 2,
    explanation:
      "La información debe preceder a la decisión y coincidir exactamente con lo que quedará registrado.",
  },
  {
    id: "sac-q-039",
    moduleId: "sac-07",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "Después de cerrar la recepción se detecta un error en una observación. ¿Qué acción conserva la trazabilidad?",
    options: [
      "Editar el registro original sin dejar rastro",
      "Eliminar la recepción y crear otra con la misma firma",
      "Cambiar únicamente la versión impresa",
      "Conservar el original y agregar una enmienda con motivo, fecha y responsable",
    ],
    answer: 3,
    explanation:
      "Una enmienda documentada corrige el dato sin borrar el historial ni separar versiones del expediente.",
  },
  {
    id: "sac-q-040",
    moduleId: "sac-07",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "El cliente ya confirmó su comprensión, pero falta una fotografía obligatoria. ¿Qué corresponde?",
    options: [
      "Completar la evidencia y mostrar cualquier cambio antes de cerrar",
      "Cerrar porque la confirmación compensa la fotografía faltante",
      "Agregar una imagen de otro producto como referencia",
      "Continuar y pedir al técnico que tome la fotografía al final",
    ],
    answer: 0,
    explanation:
      "La aceptación no convierte un expediente incompleto en válido; la evidencia debe corresponder al estado previo a la intervención.",
  },
  {
    id: "sac-q-041",
    moduleId: "sac-07",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué dato adicional es indispensable al registrar un caso de riesgo alto?",
    options: [
      "La preferencia de color del cliente",
      "La persona autorizada que validó el caso y su referencia de escalamiento",
      "El precio original del armazón",
      "La hora prevista de cierre del local",
    ],
    answer: 1,
    explanation:
      "El riesgo alto requiere una pausa y una decisión autorizada que deben quedar vinculadas al expediente.",
  },
  {
    id: "sac-q-042",
    moduleId: "sac-07",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Cuál es la mejor comprobación final de un expediente?",
    options: [
      "Que todos los campos tengan algún texto, aunque sea genérico",
      "Que la firma ocupe suficiente espacio en la página",
      "Que datos, hallazgos, nivel, evidencias y explicación se refieran al mismo caso",
      "Que el registro haya sido completado por una sola persona",
    ],
    answer: 2,
    explanation:
      "La consistencia entre elementos permite reconstruir la decisión y detectar omisiones o contradicciones.",
  },
  {
    id: "sac-q-043",
    moduleId: "sac-08",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuál es la primera acción al detectar una señal crítica durante la manipulación?",
    options: [
      "Detener la intervención y proteger el producto",
      "Completar la maniobra para no dejar la pieza a medias",
      "Limpiar la zona antes de fotografiarla",
      "Buscar una pieza de reemplazo antes de informar",
    ],
    answer: 0,
    explanation:
      "Detenerse limita nuevos cambios y conserva el estado necesario para evaluar y documentar lo ocurrido.",
  },
  {
    id: "sac-q-044",
    moduleId: "sac-08",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué debe incluir un escalamiento completo?",
    options: [
      "Solo una fotografía y la palabra urgente",
      "La opinión de quien recibió el producto, sin datos del caso",
      "Identificador, estado inicial, acciones, cambio observado, evidencia y situación del cliente",
      "Únicamente el nombre del cliente y el nivel de riesgo",
    ],
    answer: 2,
    explanation:
      "Un resumen estructurado permite que la persona autorizada decida con evidencia y sin reconstruir información faltante.",
  },
  {
    id: "sac-q-045",
    moduleId: "sac-08",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "Mientras se espera una validación, ¿qué debe comunicarse al cliente?",
    options: [
      "Que el caso está en pausa para una revisión responsable y cuál será el siguiente contacto",
      "Que seguramente el producto deberá reemplazarse",
      "Que firme para que el equipo pueda seguir investigando",
      "Que la espera confirma que el riesgo es responsabilidad del cliente",
    ],
    answer: 0,
    explanation:
      "La comunicación debe explicar el estado y el siguiente paso sin anticipar una conclusión todavía no autorizada.",
  },
  {
    id: "sac-q-046",
    moduleId: "sac-08",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Una pieza se separa durante un ajuste. ¿Qué secuencia es correcta?",
    options: [
      "Intentar unirla, fotografiar el resultado y luego avisar",
      "Detenerse, conservar todas las piezas, documentar el estado e informar",
      "Desechar la pieza suelta para evitar que se pierda",
      "Terminar los ajustes restantes antes de abrir el escalamiento",
    ],
    answer: 1,
    explanation:
      "Conservar la condición y todas las piezas protege la evidencia y permite una revisión técnica completa.",
  },
  {
    id: "sac-q-047",
    moduleId: "sac-08",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Surge un desacuerdo sobre si una fisura existía al recibir el producto. ¿Qué debe priorizarse?",
    options: [
      "Defender la versión del equipo antes de revisar el expediente",
      "Modificar la hora del registro para aclarar la secuencia",
      "Cerrar la conversación hasta que el cliente se calme",
      "Preservar el producto, revisar evidencia y tiempos, y escalar sin alterar el historial",
    ],
    answer: 3,
    explanation:
      "La decisión debe basarse en evidencia íntegra y trazable; la discusión o la edición retrospectiva debilitan el caso.",
  },
  {
    id: "sac-q-048",
    moduleId: "sac-08",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "La autorización para continuar llega por una llamada. ¿Qué debe hacerse antes de reanudar?",
    options: [
      "Continuar de inmediato porque una autorización verbal es suficiente por sí sola",
      "Pedir al cliente que recuerde quién autorizó",
      "Registrar quién autorizó, la decisión, la fecha y la referencia del escalamiento",
      "Eliminar la pausa del historial para simplificar el expediente",
    ],
    answer: 2,
    explanation:
      "Toda decisión crítica debe quedar vinculada a una persona, momento y referencia verificables antes de continuar.",
  },
  {
    id: "sac-luna-q-001",
    moduleId: "sac-luna-01",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Por qué el material CR-39 no se recomienda para monturas al aire con taladro o ranuradas de nylon?",
    options: [
      "Porque el CR-39 no admite ningún tipo de coloración ni tinte",
      "Porque posee baja resistencia a la tracción e impacto, presentando alto riesgo de astillado en perforaciones",
      "Porque es el material más costoso y pesado del mercado",
      "Porque solo puede biselarse de forma manual con lija",
    ],
    answer: 1,
    explanation: "El monómero CR-39 es quebradizo ante perforaciones mecánicas de taladro; para monturas al aire se exige Policarbonato o Trivex.",
  },
  {
    id: "sac-luna-q-002",
    moduleId: "sac-luna-01",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es la principal ventaja técnica de una luna de Alto Índice (1.67 o 1.74) en una miopía elevada?",
    options: [
      "Permite eliminar la necesidad de usar lentes para siempre",
      "Reduce sensiblemente el espesor en los bordes y el peso total del lente",
      "Hace que el lente sea irrompible ante cualquier impacto",
      "Evita que el paciente deba realizarse refracciones futuras",
    ],
    answer: 1,
    explanation: "Los polímeros de alto índice refractan la luz con menor curvatura geométrica, reduciendo el espesor de borde en miopías altas.",
  },
  {
    id: "sac-luna-q-003",
    moduleId: "sac-luna-01",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué función cumple la capa hidrofóbica superior en un tratamiento antirreflejo multicapa?",
    options: [
      "Aumentar el grosor de la luna en 2 milímetros",
      "Repeler agua, grasa y suciedad para facilitar la limpieza y prolongar la vida útil del recubrimiento",
      "Oscurecer el lente bajo la radiación solar",
      "Corregir pequeñas desviaciones del eje cilíndrico",
    ],
    answer: 1,
    explanation: "La capa hidrofóbica y oleofóbica sella los microporos de los óxidos minerales impidiendo que la grasa penetre y degrade la adherencia.",
  },
  {
    id: "sac-luna-q-004",
    moduleId: "sac-luna-01",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué propiedad óptica describe el coeficiente o número Abbe en un polímero oftálmico?",
    options: [
      "La dureza al rayado de la superficie externa",
      "La dispersión cromática; a mayor número Abbe, menor aberración cromática percibida en la periferia",
      "La velocidad a la que se oscurece la molécula fotocromática",
      "La resistencia a altas temperaturas dentro de un sauna",
    ],
    answer: 1,
    explanation: "El número Abbe cuantifica la dispersión cromática del material. Un valor Abbe alto (como 58 en CR-39 o 45 en Trivex) garantiza nitidez sin halos de color.",
  },
  {
    id: "sac-luna-q-005",
    moduleId: "sac-luna-01",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuál de estos cuidados debe advertirse expresamente al cliente que adquiere lunas con antirreflejo?",
    options: [
      "Limpiarlas siempre con toalla de papel o el borde de la camisa",
      "Lavar con agua fría y jabón neutro o spray óptico específico, secando con microfibra sin frotar en seco",
      "Dejar las gafas en la guantera del vehículo bajo el sol para desinfectarlas",
      "Limpiarlas con alcohol puro para retirar la grasa rápidamente",
    ],
    answer: 1,
    explanation: "La limpieza en húmedo con microfibra limpia previene rayaduras por micropartículas de polvo y preserva las capas antirreflejo.",
  },
  {
    id: "sac-luna-q-006",
    moduleId: "sac-luna-01",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Por qué los filtros de luz azul en masa suelen mostrar un ligero tinte residual amarillento o verdoso?",
    options: [
      "Porque el material sufrió un defecto grave de quemadura en fábrica",
      "Porque al absorber y bloquear parte del espectro azul de alta energía, la luz transmitida tiende hacia tonos cálidos",
      "Porque están fabricados exclusivamente con vidrio mineral antiguo",
      "Porque se les aplicó un tinte solar para uso nocturno",
    ],
    answer: 1,
    explanation: "El bloqueo selectivo de longitudes de onda azul-violeta (400-455 nm) genera por física óptica un leve matiz cálido en la transmisión lumínica.",
  },
  {
    id: "sac-luna-q-007",
    moduleId: "sac-luna-02",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cómo se distingue con certeza técnica una burbuja de fabricación de una mella por impacto?",
    options: [
      "La burbuja se siente áspera y profunda al pasar la uña por encima",
      "La burbuja se encuentra en la masa interna del material y la superficie externa está perfectamente lisa e intacta al tacto",
      "La burbuja solo aparece si el lente se expone al sol directo",
      "No existe manera técnica de diferenciarlas",
    ],
    answer: 1,
    explanation: "Las inclusiones gaseosas de fabricación son intrínsecas a la masa y no alteran la continuidad física de la superficie pulida.",
  },
  {
    id: "sac-luna-q-008",
    moduleId: "sac-luna-02",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué patrón visual en una luna evidencia desgaste por limpieza incorrecta y no una falla de fábrica?",
    options: [
      "Un desprendimiento homogéneo en escamas desde el borde del bisel",
      "Múltiples microrrayas circulares u horizontales concentradas en el centro de la zona óptica",
      "Una burbuja esférica única en el cuadrante temporal",
      "Un color residual verde homogéneo en ambas caras",
    ],
    answer: 1,
    explanation: "Las microrrayas multidireccionales en el centro provienen del frotamiento repetitivo con prendas o paños sucios en seco.",
  },
  {
    id: "sac-luna-q-009",
    moduleId: "sac-luna-02",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Un cliente acude con una luna rota en la zona del taladro tras una caída al suelo. ¿Aplica la garantía de fabricación?",
    options: [
      "Sí, la garantía cubre cualquier rotura independientemente de la causa",
      "No, la fractura por impacto mecánico externo es una exclusión explícita de la garantía de producto",
      "Sí, siempre que el cliente afirme que la montura no cayó fuerte",
      "No, a menos que el cliente compre un armazón nuevo en la misma visita",
    ],
    answer: 1,
    explanation: "Las fracturas por golpes, caídas o sobretorque mecánico son daños externos accidentales no atribuibles a defecto de elaboración.",
  },
  {
    id: "sac-luna-q-010",
    moduleId: "sac-luna-02",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Cuál es el procedimiento técnico si se detecta una tensión interna anómala en el biselado de una luna?",
    options: [
      "Ignorarla si el cliente no la nota a simple vista",
      "Verificar con polariscopio/colimador de tensiones si el tamaño de la luna es excesivo para el aro y rectificar el bisel para evitar fractura espontánea",
      "Pegar la luna al aro con pegamento instantáneo para fijarla",
      "Apretar el tornillo de cierre con máxima fuerza",
    ],
    answer: 1,
    explanation: "Una luna sobredimensionada genera tensiones birrefringentes que pueden desportillar el borde o deformar la montura si no se ajusta el bisel.",
  },
  {
    id: "sac-luna-q-011",
    moduleId: "sac-luna-02",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Por qué el contacto con químicos como acetona o alcohol concentrado anula la garantía de las lunas?",
    options: [
      "Porque los solventes orgánicos disuelven los polímeros y atacan irreversiblemente las capas de tratamiento óptico",
      "Porque el alcohol hace que el lente gane graduación esférica",
      "Porque el laboratorio exige exclusivamente desinfectantes con lejía pura",
      "Porque los químicos cambian el color del armazón pero nunca afectan las lunas",
    ],
    answer: 1,
    explanation: "Los solventes desintegran el enlace molecular de los polímeros y lacas, configurando un daño químico por agresión externa.",
  },
  {
    id: "sac-luna-q-012",
    moduleId: "sac-luna-02",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué debe hacer el asesor si un defecto reportado por el cliente resulta ser daño por mal uso evidente?",
    options: [
      "Culpar abiertamente al cliente y negarse a recibir el producto",
      "Explicar con empatía y fundamento visual el informe técnico, y ofrecer las alternativas comerciales de fidelización con descuento",
      "Aceptar la garantía mintiendo al laboratorio para favorecer al paciente",
      "Retener las gafas del paciente indefinidamente",
    ],
    answer: 1,
    explanation: "La transparencia fundamentada con amabilidad y alternativas de resolución mantiene la confianza del cliente sin comprometer la ética técnica.",
  },
  {
    id: "sac-luna-q-013",
    moduleId: "sac-luna-03",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuál es el aspecto característico del craquelado (crazing) por choque térmico en un antirreflejo?",
    options: [
      "Un orificio circular perforado en el centro",
      "Una fina red homogénea de microfisuras entrecruzadas tipo telaraña o vidrio roto diminuto",
      "Una mancha aceitosa que desaparece al frotar con los dedos",
      "Un cambio permanente de color transparente a negro oscuro",
    ],
    answer: 1,
    explanation: "El crazing térmico genera una red geométrica reticular provocada por la diferencia de dilatación entre el sustrato orgánico y las capas minerales.",
  },
  {
    id: "sac-luna-q-014",
    moduleId: "sac-luna-03",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Por qué dejar las gafas sobre el tablero de un vehículo estacionado al sol provoca craquelado?",
    options: [
      "Porque la luz solar hace que el plástico se vuelva magnético",
      "Porque el habitáculo alcanza temperaturas de 60-80 °C, expandiendo el polímero a un ritmo muy superior al de las capas inorgánicas del antirreflejo",
      "Porque los cristales del auto absorben todo el oxígeno del aire",
      "Porque el antirreflejo solo resiste temperaturas bajo cero",
    ],
    answer: 1,
    explanation: "El estrés térmico por calor extremo supera el límite elástico del tratamiento, quebrando la matriz mineral en millones de microfracturas.",
  },
  {
    id: "sac-luna-q-015",
    moduleId: "sac-luna-03",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cómo se diferencia la delaminación por falla de planta del craquelado por calor?",
    options: [
      "La delaminación se despega en forma de láminas o escamas desde los bordes sin presentar la red reticular de microfracturas por temperatura",
      "La delaminación ocurre únicamente en lentes de contacto",
      "El craquelado por calor solo afecta la cara interna de la luna",
      "La delaminación hace que la luna cambie de graduación en lensómetro",
    ],
    answer: 1,
    explanation: "La falta de adhesión en cámara de vacío provoca levantamiento en escamas continuas, mientras que el calor fisura la capa en telaraña cerrada.",
  },
  {
    id: "sac-luna-q-016",
    moduleId: "sac-luna-03",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Cuál es el montaje óptico ideal para evidenciar y fotografiar el craquelado de una luna en tienda?",
    options: [
      "Luz solar directa sin ningún ángulo específico",
      "Luz LED blanca a 45 grados tangencial/rasante con fondo negro mate no reflectante debajo de la luna",
      "Flash directo a quemarropa a 2 centímetros de la luna",
      "Inspección en cuarto totalmente a oscuras sin ninguna iluminación",
    ],
    answer: 1,
    explanation: "La luz rasante a 45° sobre fondo oscuro resalta el plano de microfisuras por dispersión de luz sin reflejos parásitos en la cámara.",
  },
  {
    id: "sac-luna-q-017",
    moduleId: "sac-luna-03",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿El vapor directo de hornos, planchas o saunas está cubierto por la garantía del antirreflejo?",
    options: [
      "Sí, el antirreflejo está garantizado para cocinas industriales y saunas",
      "No, el vapor a alta temperatura produce choque térmico y constituye exclusión técnica por condiciones ambientales inadecuadas",
      "Sí, siempre que las lunas se hayan comprado hace menos de un año",
      "Solo si el cliente llevaba puestos guantes de protección",
    ],
    answer: 1,
    explanation: "La exposición a fuentes de vapor caliente dilata bruscamente el material y craquela el recubrimiento; se cataloga como daño por choque térmico.",
  },
  {
    id: "sac-luna-q-018",
    moduleId: "sac-luna-03",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Si el laboratorio valida que la luna sufrió desprendimiento en láminas por falla de laca base, ¿cuál es el paso a seguir?",
    options: [
      "Cobrar el 50% de la luna nueva al cliente",
      "Tramitar de inmediato la reposición prioritaria por garantía procedente al 100% sin costo para el usuario",
      "Sugerir al cliente que no use antirreflejo nunca más",
      "Devolver las lunas dañadas sin brindar respuesta",
    ],
    answer: 1,
    explanation: "Al confirmarse falla atribuible a los procesos de laboratorio, el protocolo SAC garantiza la reposición íntegra con máxima prioridad.",
  },
  {
    id: "sac-luna-q-019",
    moduleId: "sac-luna-04",
    role: "Optómetra",
    difficulty: "Básica",
    prompt: "¿Cuál es el periodo de adaptación recomendado antes de dictaminar un reclamo por no-adaptación en progresivos?",
    options: [
      "24 horas únicamente",
      "Entre 15 y 30 días de uso continuado y progresivo",
      "6 meses sin interrupción",
      "No existe periodo de adaptación; debe verse perfecto desde el primer minuto",
    ],
    answer: 1,
    explanation: "El sistema visual y vestibular requiere de 2 a 4 semanas para automatizar los movimientos sacádicos y la coordinación ojo-cabeza en multifocales.",
  },
  {
    id: "sac-luna-q-020",
    moduleId: "sac-luna-04",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Un paciente con progresivos nuevos indica que para leer en el celular debe levantar excesivamente el mentón. ¿Cuál es la causa más probable?",
    options: [
      "La altura pupilar quedó montada demasiado baja respecto a su centro pupilar real",
      "La altura pupilar quedó montada excesivamente alta",
      "La montura tiene demasiado ángulo pantoscópico",
      "El armazón está demasiado pegado a los ojos",
    ],
    answer: 0,
    explanation: "Si el centro óptico del multifocal está muy bajo, el paciente debe hiperflexionar la cabeza hacia atrás para alcanzar el corredor de lectura cercana.",
  },
  {
    id: "sac-luna-q-021",
    moduleId: "sac-luna-04",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "¿Cuál es el valor recomendado de inclinación o ángulo pantoscópico para un óptimo rendimiento en lentes progresivos?",
    options: [
      "0 grados (totalmente perpendicular a la visual)",
      "Entre 8 y 12 grados de inclinación hacia los pómulos",
      "25 grados de inclinación extrema",
      "-5 grados (inclinada hacia arriba alejándose de los pómulos)",
    ],
    answer: 1,
    explanation: "Una inclinación pantoscópica de 8-12° equipara la distancia al vértice entre la zona de lejos y la zona de cerca, maximizando los campos útiles.",
  },
  {
    id: "sac-luna-q-022",
    moduleId: "sac-luna-04",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "¿Qué información fundamental proporcionan los micrograbados láser temporales y nasales de una luna progresiva?",
    options: [
      "La fecha de vencimiento de la garantía",
      "La marca del fabricante, el código de diseño del pasillo y el valor de la adición cercana real",
      "El número de cédula del paciente",
      "El precio sugerido de venta al público",
    ],
    answer: 1,
    explanation: "Los grabados láser estandarizados permiten reconstruir la cruz de centrado, verificar la adición grabada y comprobar si hubo rotación en el bisel.",
  },
  {
    id: "sac-luna-q-023",
    moduleId: "sac-luna-04",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Antes de solicitar un cambio de lunas por desadaptación en multifocales, ¿qué acción física debe realizarse primero?",
    options: [
      "Cambiar inmediatamente la prescripción con más aumento",
      "Realizar un ajuste anatómico de montura: cerrar/abrir plaquetas, modificar ángulo pantoscópico y distancia de vértice",
      "Decirle al cliente que compre una montura más grande",
      "Retirar las lunas y biselarlas a mano en tienda",
    ],
    answer: 1,
    explanation: "Más del 60% de los problemas de adaptación se corrigen optimizando el calce fisonómico (pantoscópico, ángulo facial y altura de plaquetas).",
  },
  {
    id: "sac-luna-q-024",
    moduleId: "sac-luna-04",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "Si la distancia nasopupilar (DNP) de montaje tiene un error de 3 mm respecto a la anatomía del paciente, ¿qué consecuencia óptica se produce?",
    options: [
      "Ninguna, el cerebro compensa cualquier discrepancia",
      "Se induce un efecto prismático no prescrito y el pasillo de progresión queda fuera de la línea de mirada, provocando visión doble o borrosa",
      "El lente se vuelve fotocromático automáticamente",
      "La graduación se reduce a la mitad",
    ],
    answer: 1,
    explanation: "El descentramiento respecto al pasillo de progresión empuja al ojo a mirar por las zonas periféricas de aberración, impidiendo la visión clara.",
  },
  {
    id: "sac-luna-q-025",
    moduleId: "sac-luna-05",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "¿Cuál es el primer paso indispensable antes de medir cualquier luna en el lensómetro digital?",
    options: [
      "Limpiar la lente con un paño abrasivo",
      "Calibrar o poner a cero el equipo y comprobar que la platina de apoyo esté limpia y nivelada",
      "Subir el brillo de la pantalla al máximo",
      "Marcar la lente con tinta permanente indeleble",
    ],
    answer: 1,
    explanation: "El lensómetro digital debe calibrarse a cero para garantizar la exactitud métrica de esfera, cilindro y prismas.",
  },
  {
    id: "sac-luna-q-026",
    moduleId: "sac-luna-05",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Por qué ambas varillas del armazón deben apoyarse firmemente en la platina del lensómetro al medir?",
    options: [
      "Para evitar que la montura se caiga al suelo",
      "Para garantizar la horizontalidad óptica y evitar falsas lecturas en el ángulo del eje del astigmatismo",
      "Para medir la flexibilidad de los resortes de la bisagra",
      "Para comprobar si el armazón conduce electricidad",
    ],
    answer: 1,
    explanation: "La platina fija la línea de referencia 0°-180°; si el armazón se inclina, el eje cilíndrico medido sufrirá un desfase artificial.",
  },
  {
    id: "sac-luna-q-027",
    moduleId: "sac-luna-05",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Cuál es la tolerancia máxima permitida en el eje para un cilindro de -2.50 DC según la norma internacional de calidad?",
    options: [
      "+/- 15 grados",
      "+/- 2 grados",
      "+/- 45 grados",
      "No existe tolerancia; cualquier desviación es aceptable",
    ],
    answer: 1,
    explanation: "A mayor potencia cilíndrica, más estricta es la tolerancia de eje (+/- 2° para cilindros > 1.50 D según ANSI Z80.1).",
  },
  {
    id: "sac-luna-q-028",
    moduleId: "sac-luna-05",
    role: "Asesor",
    difficulty: "Avanzada",
    prompt: "¿Qué anomalía grave debe descartarse al cotejar los valores del lensómetro contra la receta del paciente?",
    options: [
      "Que el lente tenga un peso menor a 15 gramos",
      "La transposición involuntaria de valores entre ojo derecho (OD) y ojo izquierdo (OI) o signo invertido en cilindro (+/-)",
      "Que el color del estuche no combine con el aro",
      "Que el lente tenga un diseño rectangular en lugar de redondo",
    ],
    answer: 1,
    explanation: "Montar la prescripción del OD en el OI o invertir el signo cilíndrico genera incompatibilidad visual severa de inmediato.",
  },
  {
    id: "sac-luna-q-029",
    moduleId: "sac-luna-05",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "¿Qué función tienen los tres puntos que marca el lensómetro al accionar el marcador de tinta?",
    options: [
      "Indicar los tres defectos más graves de la luna",
      "Señalar el centro óptico en el punto central y la línea horizontal del eje con los dos puntos laterales",
      "Decorar la superficie para que el cliente la distinga",
      "Identificar el precio de la luna en tienda",
    ],
    answer: 1,
    explanation: "El marcador fija el centro óptico libre de prismas y la horizontal 0-180° para cotejar distancias nasopupilares y alturas.",
  },
  {
    id: "sac-luna-q-030",
    moduleId: "sac-luna-05",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Por qué es obligatorio imprimir y adjuntar la tira del lensómetro a la orden de garantía SAC?",
    options: [
      "Para gastar el papel térmico del equipo",
      "Porque constituye la evidencia documental objetiva e inalterable de los valores medidos en tienda",
      "Para entregársela al cliente como recibo de pago adicional",
      "Porque sustituye a la firma del paciente",
    ],
    answer: 1,
    explanation: "El comprobante del lensómetro digital es una pieza clave en auditorías de control de calidad ante proveedores y laboratorios.",
  },
  {
    id: "sac-luna-q-031",
    moduleId: "sac-luna-06",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuántas fotografías estandarizadas exige el protocolo SAC para abrir un expediente de garantía de lunas?",
    options: [
      "1 sola fotografía general tomada de lejos",
      "Exactamente 4 fotografías con objetivos y ángulos técnicos definidos",
      "10 fotografías de cada tornillo de la montura",
      "Ninguna fotografía si el cliente está molesto",
    ],
    answer: 1,
    explanation: "El estándar SAC exige 4 tomas: panorámica frontal, macro con luz rasante, lectura lensómetro/láser y estado de montura.",
  },
  {
    id: "sac-luna-q-032",
    moduleId: "sac-luna-06",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué debe capturarse en la Foto 1 del protocolo de evidencia técnica?",
    options: [
      "El rostro del cliente en primer plano",
      "Vista general frontal panorámica sobre fondo neutro mostrando el armazón completo, aros y ambas lunas",
      "La fachada exterior de la óptica",
      "La boleta de compra exclusivamente",
    ],
    answer: 1,
    explanation: "La foto 1 certifica el estado estético integral, simetría y alineación del producto al momento exacto de la recepción.",
  },
  {
    id: "sac-luna-q-033",
    moduleId: "sac-luna-06",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es el objetivo principal de la Foto 2 con luz rasante a 45 grados?",
    options: [
      "Crear un efecto artístico para redes sociales",
      "Revelar con nitidez la textura, profundidad y patrón del defecto (rayas, craquelado o delaminación)",
      "Verificar el color de los ojos del paciente",
      "Comprobar si el armazón flota en agua",
    ],
    answer: 1,
    explanation: "La luz rasante genera sombras y contrastes que hacen evidente si el daño es superficial, reticular o por falta de adherencia.",
  },
  {
    id: "sac-luna-q-034",
    moduleId: "sac-luna-06",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué debe mostrar con claridad la Foto 3 en lentes progresivos ingresados por desadaptación?",
    options: [
      "El estuche original cerrado",
      "La reconstrucción de las marcas láser con regleta o la pantalla del lensómetro con la potencia y adición leída",
      "El manual de usuario de la montura",
      "La firma del técnico del taller",
    ],
    answer: 1,
    explanation: "Demostrar que la adición grabada coincide o no con la orden médica descarta errores de marcación o despacho de planta.",
  },
  {
    id: "sac-luna-q-035",
    moduleId: "sac-luna-06",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Por qué la Foto 4 se enfoca en el bisel, ranuras de nylon o taladros de la montura?",
    options: [
      "Para comprobar si la montura tiene polvo en las esquinas",
      "Para descartar daños estructurales, deformaciones en el aro o fisuras inducidas por caídas mecánicas",
      "Para verificar el código de barras de la etiqueta de precio",
      "Para saber si el armazón es de metal o de plástico",
    ],
    answer: 1,
    explanation: "El estado de los aros y perforaciones demuestra si el producto sufrió sobrepresión, caídas o traumatismos que anulan la garantía.",
  },
  {
    id: "sac-luna-q-036",
    moduleId: "sac-luna-06",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué norma de nomenclatura y calidad deben cumplir las fotos antes de subirse al ticket digital SAC?",
    options: [
      "Tener filtro sepia para verse elegantes",
      "Estar nítidas, bien iluminadas, sin reflejos que oculten el defecto y asociadas al código único de orden SAC",
      "Tener un tamaño menor a 5 KB aunque queden borrosas",
      "Guardarse únicamente en el teléfono personal del asesor",
    ],
    answer: 1,
    explanation: "La trazabilidad institucional requiere imágenes de alta resolución debidamente rotuladas y centralizadas en el expediente SAC.",
  },
  {
    id: "sac-luna-q-037",
    moduleId: "sac-luna-07",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "Un cliente ingresa enfadado gritando que las lunas que compró 'no sirven para nada'. ¿Cuál es la primera respuesta del asesor?",
    options: [
      "Exigirle que baje la voz o se retire de la tienda",
      "Escuchar activamente sin interrumpir, validar su frustración con empatía y ofrecer revisar técnicamente su caso de inmediato",
      "Decirle que la culpa es de su médico oftalmólogo",
      "Ignorarlo hasta que se canse de hablar",
    ],
    answer: 1,
    explanation: "La empatía inicial y la disposición a investigar técnicamente desescalan el conflicto y abren un canal constructivo de atención.",
  },
  {
    id: "sac-luna-q-038",
    moduleId: "sac-luna-07",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Por qué el asesor en tienda NUNCA debe prometer un cambio de lunas gratis antes del informe de laboratorio?",
    options: [
      "Porque no tiene acceso a internet en tienda",
      "Porque si el dictamen concluye daño por calor o agresión química externa, la empresa no podrá respaldar esa falsa promesa sin generar una crisis mayor",
      "Porque el cliente siempre miente sobre sus lentes",
      "Porque las lunas nuevas tardan un año en llegar",
    ],
    answer: 1,
    explanation: "Generar expectativas infundadas antes del análisis imparcial de laboratorio vulnera los procedimientos de auditoría y la credibilidad institucional.",
  },
  {
    id: "sac-luna-q-039",
    moduleId: "sac-luna-07",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Cuál es el plazo estandarizado por el protocolo SAC para emitir el dictamen técnico de evaluación de lunas?",
    options: [
      "30 días hábiles",
      "De 24 a 48 horas laborables con notificación trazable al paciente",
      "15 minutos mientras el cliente espera de pie",
      "6 meses después de la compra",
    ],
    answer: 1,
    explanation: "Fijar un marco temporal de 24 a 48 horas proporciona certidumbre al cliente y tiempo suficiente al laboratorio para las pruebas.",
  },
  {
    id: "sac-luna-q-040",
    moduleId: "sac-luna-07",
    role: "Asesor",
    difficulty: "Avanzada",
    prompt: "¿Qué documento obligatorio debe entregarse al paciente cuando deja su producto en revisión en tienda?",
    options: [
      "Una servilleta con una anotación a mano",
      "Comprobante formal de recepción y custodia con código de ticket SAC, detalle de estado observable y 4 fotos adjuntas",
      "Un vale de descuento para su próxima compra únicamente",
      "Ningún documento, solo un apretón de manos",
    ],
    answer: 1,
    explanation: "El comprobante de custodia formaliza la tenencia temporal del producto y blinda jurídicamente la recepción para ambas partes.",
  },
  {
    id: "sac-luna-q-041",
    moduleId: "sac-luna-07",
    role: "Asesor",
    difficulty: "Básica",
    prompt: "Si un paciente expresa miedo a que sus ojos sufran daño permanente por usar sus nuevas gafas, ¿qué orientación brinda el asesor?",
    options: [
      "Confirmarle que sus ojos corren peligro grave",
      "Tranquilizarlo explicando que las lentes oftálmicas no dañan anatómicamente el ojo y que cualquier molestia se corregirá ajustando la graduación o el centrado",
      "Decirle que consulte en internet",
      "Aconsejarle que tire las gafas a la basura",
    ],
    answer: 1,
    explanation: "Explicar la naturaleza óptica de la refracción disipa temores irracionales y reafirma la seguridad del paciente en el servicio profesional.",
  },
  {
    id: "sac-luna-q-042",
    moduleId: "sac-luna-07",
    role: "Asesor",
    difficulty: "Intermedia",
    prompt: "¿Qué canal debe registrarse en el ticket SAC para asegurar la comunicación oportuna del resultado al cliente?",
    options: [
      "Ninguno, el cliente debe venir a preguntar todos los días",
      "Teléfono móvil con WhatsApp confirmado y correo electrónico con acuse de recibo",
      "Únicamente dirección postal para enviar una carta",
      "Redes sociales personales del asesor",
    ],
    answer: 1,
    explanation: "Disponer de dos canales ágiles garantiza que la resolución técnica sea comunicada inmediatamente al concluir las 24-48 horas.",
  },
  {
    id: "sac-luna-q-043",
    moduleId: "sac-luna-08",
    role: "Todos",
    difficulty: "Básica",
    prompt: "Cuando el informe técnico del laboratorio determina que el reclamo es PROCEDENTE por garantía, ¿cuál es la acción inmediata?",
    options: [
      "Hacer esperar al cliente un mes adicional",
      "Ingresar la orden de reposición prioritaria de lunas sin costo y dar seguimiento express en taller hasta la entrega",
      "Pedirle al cliente que pague el 50% de los insumos",
      "Cerrar el caso sin fabricar nada",
    ],
    answer: 1,
    explanation: "El reclamo procedente activa la vía de reposición prioritaria con costo cero para el usuario, asegurando una experiencia correctiva excelente.",
  },
  {
    id: "sac-luna-q-044",
    moduleId: "sac-luna-08",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Si el dictamen concluye que el daño fue por abrasión mecánica (mal uso), ¿cómo debe presentarse la resolución al cliente?",
    options: [
      "Con una carta fría de rechazo tajante sin explicaciones",
      "Mostrando amablemente las fotos macro del dictamen, fundamentando el motivo técnico y ofreciendo el plan de reposición con descuento de fidelización SAC",
      "Ocultando el informe técnico para no discutir",
      "Diciéndole que vuelva a reclamar en otra sucursal",
    ],
    answer: 1,
    explanation: "La evidencia visual transparente respaldada por una alternativa comercial accesible atenúa la frustración y conserva al cliente.",
  },
  {
    id: "sac-luna-q-045",
    moduleId: "sac-luna-08",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué porcentaje de descuento de fidelización comercial suele ofrecerse en SAC para reposición de lunas no cubiertas por garantía?",
    options: [
      "0% (precio completo sin ninguna facilidad)",
      "Entre 30% y 50% de descuento de cortesía institucional",
      "100% de descuento siempre, sin importar el motivo",
      "Un recargo adicional por haber dañado las lunas",
    ],
    answer: 1,
    explanation: "El plan de fidelización SAC permite al usuario reponer sus lunas dañadas por accidente a un costo preferencial solidario.",
  },
  {
    id: "sac-luna-q-046",
    moduleId: "sac-luna-08",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Al entregar las lunas nuevas de reposición, ¿qué verificación previa es obligatoria en el taller de tienda?",
    options: [
      "Limpiarlas con alcohol puro",
      "Verificar nuevamente en lensómetro potencias, ejes, adición y bisel para asegurar que la entrega sea 100% conforme",
      "Entregarlas en sobre cerrado sin abrirlo jamás",
      "Cobrar una tarifa de calibración no informada",
    ],
    answer: 1,
    explanation: "El control de calidad en tienda previa a la entrega final evita entregar lunas con nuevos errores y garantiza cierre definitivo del ticket.",
  },
  {
    id: "sac-luna-q-047",
    moduleId: "sac-luna-08",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué requisito final debe cumplirse para dar por cerrado un ticket de garantía en la plataforma SAC?",
    options: [
      "Borrar el historial de fotos del sistema",
      "Registrar la firma de conformidad del paciente en el acta de entrega y documentar los tiempos y causas en el KPI de calidad",
      "Esperar 90 días a que el ticket expire automáticamente",
      "Cambiar el nombre del cliente por uno anónimo",
    ],
    answer: 1,
    explanation: "El cierre formal requiere conformidad explícita del usuario y alimenta los indicadores de mejora continua con los proveedores ópticos.",
  },
  {
    id: "sac-luna-q-048",
    moduleId: "sac-luna-08",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cómo contribuye la correcta trazabilidad de los reclamos de lunas a la mejora operativa de la empresa?",
    options: [
      "No aporta nada, solo genera trabajo administrativo",
      "Permite identificar lotes o proveedores defectuosos, ajustar procesos de taller y capacitar al equipo en puntos críticos",
      "Permite despedir a los técnicos cada semana",
      "Sirve únicamente para fines tributarios",
    ],
    answer: 1,
    explanation: "La analítica de causas raíz en el sistema SAC retroalimenta el control de calidad, mejorando la selección de insumos y los protocolos técnicos.",
  },
  {
    id: "sac-no-q-001",
    moduleId: "sac-no-01",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuál es el principal riesgo de dar un 'SÍ' complaciente a una solicitud técnica inviable?",
    options: [
      "Que el cliente se vuelva demasiado exigente en visitas futuras",
      "Asumir la culpa y el costo financiero de la rotura o defecto previsible",
      "Que el sistema de inventario no registre la operación",
      "Que los tiempos de entrega se reduzcan innecesariamente",
    ],
    answer: 1,
    explanation: "Aceptar pedidos inviables traslada la responsabilidad legal y operativa a la óptica cuando el material colapsa.",
  },
  {
    id: "sac-no-q-002",
    moduleId: "sac-no-01",
    role: "Todos",
    difficulty: "Básica",
    prompt: "En el protocolo SAC, ¿qué define una comunicación asertiva frente a la negativa?",
    options: [
      "Ser tajante y no permitir preguntas del cliente",
      "Expresar hechos y límites técnicos objetivos con empatía y firmeza",
      "Disculparse reiteradamente y culpar al taller de producción",
      "Derivar inmediatamente al cliente a otra sucursal",
    ],
    answer: 1,
    explanation: "La asertividad comunica límites técnicos con serenidad y empatía, sin agresividad ni sumisión complaciente.",
  },
  {
    id: "sac-no-q-003",
    moduleId: "sac-no-01",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué actitud corporal y vocal facilita la aceptación de un límite por parte del cliente?",
    options: [
      "Mirar hacia la computadora y hablar rápido para evitar interrupciones",
      "Contacto visual sereno, postura abierta y tono de voz pausado",
      "Cruzar los brazos para denotar autoridad y seguridad institucional",
      "Sonreír continuamente mientras se repite la negativa",
    ],
    answer: 1,
    explanation: "El lenguaje no verbal sereno y pausado genera confianza y reduce la reactividad emocional del interlocutor.",
  },
  {
    id: "sac-no-q-004",
    moduleId: "sac-no-01",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Cuando deba respaldar una negativa en las políticas de la óptica, ¿cuál es la mejor formulación?",
    options: [
      "Son normas de la gerencia y a mí me prohíben hacer excepciones",
      "Si por mí fuera lo haría, pero el sistema no me lo permite",
      "Nuestro protocolo de seguridad protege la integridad de su producto y su salud visual",
      "Es política interna de la empresa y no está sujeta a discusión",
    ],
    answer: 2,
    explanation: "Enfocar las políticas como un marco de protección para el propio cliente genera aceptación constructiva.",
  },
  {
    id: "sac-no-q-005",
    moduleId: "sac-no-01",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Cuál es el primer paso antes de formular una respuesta negativa a una petición compleja?",
    options: [
      "Consultar el stock de productos de reemplazo",
      "Escuchar activamente la solicitud completa sin interrumpir al cliente",
      "Llamar al supervisor para que esté presente",
      "Entregar el folleto de términos y condiciones",
    ],
    answer: 1,
    explanation: "Escuchar sin cortar valida al usuario y permite comprender exactamente qué necesita antes de definir el límite.",
  },
  {
    id: "sac-no-q-006",
    moduleId: "sac-no-01",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Por qué decir NO a tiempo se considera un acto de excelencia en el servicio?",
    options: [
      "Porque disminuye la carga laboral del taller técnico",
      "Porque previene frustraciones mayores, roturas no deseadas y reclamos formales",
      "Porque filtra a los clientes que no tienen presupuesto para compras nuevas",
      "Porque acelera el tiempo promedio de atención por mostrador",
    ],
    answer: 1,
    explanation: "Un límite oportuno evita que un problema prevenible se transforme en una rotura irreversible o un conflicto grave.",
  },
  {
    id: "sac-no-q-007",
    moduleId: "sac-no-02",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuáles son las 3 capas que componen la 'Técnica Sandwich' en atención al cliente?",
    options: [
      "Saludo formal - Negativa tajante - Despedida cordial",
      "Apertura empática (pan) - Límite técnico (relleno) - Alternativa viable (pan)",
      "Explicación legal - Costo de reparación - Firma de conformidad",
      "Diagnóstico - Presupuesto - Facturación inmediata",
    ],
    answer: 1,
    explanation: "La técnica sandwich amortigua el límite técnico entre una validación empática inicial y una propuesta de solución final.",
  },
  {
    id: "sac-no-q-008",
    moduleId: "sac-no-02",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué palabra detonante debe evitarse inmediatamente después de la frase empática de apertura?",
    options: [
      "Sin embargo",
      "Pero",
      "Por lo tanto",
      "Además",
    ],
    answer: 1,
    explanation: "La palabra 'pero' borra psicológicamente todo lo positivo que se dijo antes. Se recomienda usar conectores constructivos.",
  },
  {
    id: "sac-no-q-009",
    moduleId: "sac-no-02",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es un ejemplo correcto de la capa de apertura empática ante una urgencia de tiempo?",
    options: [
      "No se preocupe que aquí todos los clientes vienen con prisa",
      "Comprendo perfectamente su urgencia de tener sus lentes listos para su viaje de mañana...",
      "Si hubiera venido más temprano podríamos haber hecho algo",
      "El laboratorio tiene horarios fijos que no podemos alterar",
    ],
    answer: 1,
    explanation: "Validar la emoción y necesidad específica del cliente demuestra genuino interés por su bienestar.",
  },
  {
    id: "sac-no-q-010",
    moduleId: "sac-no-02",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "En la capa central (relleno), ¿cómo debe explicarse el límite técnico?",
    options: [
      "Con tecnicismos en inglés para demostrar superioridad científica",
      "Con claridad, brevedad y fundamentado en la seguridad del producto",
      "Con rodeos extensos para que el cliente no se ofenda",
      "Culpando a los operarios de la máquina de biselado",
    ],
    answer: 1,
    explanation: "El límite debe ser claro, conciso y directo, fundamentado en la física de los materiales o la calidad óptica.",
  },
  {
    id: "sac-no-q-011",
    moduleId: "sac-no-02",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué cualidad indispensable debe tener la tercera capa (alternativa viable)?",
    options: [
      "Ser totalmente gratuita sin importar el costo para la tienda",
      "Ser una promesa condicional que dependa de la buena voluntad del taller",
      "Ser realista, ejecutable en plazos claros y de valor real para el cliente",
      "Ser la opción más costosa del catálogo para compensar el tiempo",
    ],
    answer: 2,
    explanation: "La alternativa debe ser una solución factible y tangible que resuelva la necesidad de fondo del usuario.",
  },
  {
    id: "sac-no-q-012",
    moduleId: "sac-no-02",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Si el cliente insiste tras aplicar la técnica sandwich, ¿cómo se refuerza el mensaje?",
    options: [
      "Repitiendo el sandwich manteniendo la calma y enfocándose en la alternativa ofrecida",
      "Elevando el tono de voz para marcar autoridad",
      "Ignorando al cliente hasta que decida retirarse",
      "Aceptando la solicitud para evitar una discusión prolongada",
    ],
    answer: 0,
    explanation: "La reiteración serena de las opciones viables enfoca la mente del cliente en la solución y no en la negativa.",
  },
  {
    id: "sac-no-q-013",
    moduleId: "sac-no-03",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué condición en un armazón de acetato exige denegar la aplicación de calor?",
    options: [
      "Color negro brillante reciente",
      "Presencia de microfisuras o resequedad blanquecina con pérdida de plastificantes",
      "Montura con plaquetas nasales de silicona",
      "Armazón con menos de 3 meses de compra",
    ],
    answer: 1,
    explanation: "El acetato envejecido con microfisuras o cristalización se fractura de inmediato al recibir choque térmico.",
  },
  {
    id: "sac-no-q-014",
    moduleId: "sac-no-03",
    role: "Todos",
    difficulty: "Básica",
    prompt: "Si un cliente trae una montura reparada previamente con pegamento casero en la bisagra, ¿qué se debe hacer?",
    options: [
      "Calentar a máxima temperatura para derretir el pegamento",
      "Informar el riesgo crítico y rechazar la manipulación mecánica sin deslinde firmado",
      "Forzar el tornillo con alicate de presión",
      "Sumergir la montura en acetona pura",
    ],
    answer: 1,
    explanation: "Los pegamentos cianoacrilatos cristalizan el metal y el plástico; forzarlos genera rotura del componente.",
  },
  {
    id: "sac-no-q-015",
    moduleId: "sac-no-03",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es la herramienta más efectiva en mostrador para convencer al cliente de una negativa técnica?",
    options: [
      "El catálogo comercial impreso",
      "La visualización macro bajo lupa o pantalla compartida de la fisura",
      "La llamada telefónica al gerente de zona",
      "El comprobante de caja de compras anteriores",
    ],
    answer: 1,
    explanation: "Mostrar la grieta ampliada en pantalla elimina la subjetividad: el cliente ve con sus propios ojos la fractura inminente.",
  },
  {
    id: "sac-no-q-016",
    moduleId: "sac-no-03",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Por qué no se debe permitir que un cliente manipule las pinzas de taller en mostrador?",
    options: [
      "Porque las herramientas ópticas son pesadas",
      "Por normas de seguridad laboral, esterilidad y riesgo de accidentes o daño mayor",
      "Porque podría desgastar el teflón de las boquillas",
      "Porque el cliente podría aprender a reparar sus monturas solo",
    ],
    answer: 1,
    explanation: "El uso de instrumental óptico es de uso técnico exclusivo para evitar lesiones y roturas descontroladas.",
  },
  {
    id: "sac-no-q-017",
    moduleId: "sac-no-03",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué alternativa técnica viable se presenta cuando una montura no resiste más ajustes?",
    options: [
      "Aconsejarle que use cinta adhesiva transparente",
      "Trasvase de lunas a una montura compatible o plan de renovación de armazón",
      "Pegar las varillas en ángulo fijo con masilla epóxica",
      "Limar los bordes hasta que asiente sola",
    ],
    answer: 1,
    explanation: "El traspaso de lunas a un aro compatible o un plan renueva permite salvar la inversión óptica del paciente con seguridad.",
  },
  {
    id: "sac-no-q-018",
    moduleId: "sac-no-03",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "En caso de que el cliente exija intentar el ajuste bajo su riesgo, ¿qué documento SAC es indispensable?",
    options: [
      "Una nota simple escrita en una servilleta",
      "El acta de deslinde técnico informado con firma de consentimiento del usuario",
      "El comprobante de pago de la consulta médica",
      "La tarjeta de presentación del técnico que atenderá",
    ],
    answer: 1,
    explanation: "El acta de deslinde técnico informado formaliza que el usuario conoce el riesgo inminente de rotura previa intervención.",
  },
  {
    id: "sac-no-q-019",
    moduleId: "sac-no-04",
    role: "Optómetra",
    difficulty: "Básica",
    prompt: "¿Cuál es el periodo máximo de vigencia recomendado para una receta de refracción oftálmica?",
    options: [
      "3 meses",
      "12 meses (1 año)",
      "5 años",
      "No tiene vencimiento mientras la persona vea bien",
    ],
    answer: 1,
    explanation: "Los cambios acomodativos y fisiológicos hacen que una prescripción mayor a 1 año no garantice confort visual.",
  },
  {
    id: "sac-no-q-020",
    moduleId: "sac-no-04",
    role: "Optómetra",
    difficulty: "Básica",
    prompt: "¿Por qué el optómetra debe negarse a dispensar lunas progresivas con receta vencida?",
    options: [
      "Porque las fábricas no aceptan pedidos sin fecha del mes en curso",
      "Porque variaciones en la distancia interpupilar o adición causarán mareos y rechazo",
      "Porque los progresivos solo funcionan con recetas emitidas por oftalmólogos",
      "Porque el costo del tratamiento antirreflejo sube con recetas antiguas",
    ],
    answer: 1,
    explanation: "Los multifocales exigen parámetros milimétricos actuales; una fórmula caduca garantiza desadaptación e ineficiencia.",
  },
  {
    id: "sac-no-q-021",
    moduleId: "sac-no-04",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Cuando el paciente insiste 'hágalas con la fórmula vieja porque yo veo bien con ella', ¿cuál es la respuesta asertiva?",
    options: [
      "Está bien, pero si le duele la cabeza no venga a reclamar",
      "Nuestra ética clínica busca su salud visual; confirmar su agudeza hoy le garantiza confort y previene fatiga",
      "Usted no es profesional de la salud y no sabe cómo funcionan los ojos",
      "Tendré que cobrarle un recargo por desacato a la norma médica",
    ],
    answer: 1,
    explanation: "Centrar la negativa en la protección de su salud visual y ofrecer la confirmación optométrica genera tranquilidad y profesionalismo.",
  },
  {
    id: "sac-no-q-022",
    moduleId: "sac-no-04",
    role: "Optómetra",
    difficulty: "Intermedia",
    prompt: "Si la graduación de una receta externa parece excesiva o presenta saltos incongruentes, ¿qué protocolo rige?",
    options: [
      "Fabricar de inmediato tal cual vino para no ofender al emisor",
      "Pausar la venta, realizar lensometría de los lentes actuales y ofrecer refracción de control",
      "Modificar los números a criterio propio sin consultar al paciente",
      "Romper la receta y pedirle que traiga otra",
    ],
    answer: 1,
    explanation: "Verificar con lensometría los lentes en uso y confirmar en gabinete resuelve dudas y protege al usuario de errores de transcripción.",
  },
  {
    id: "sac-no-q-023",
    moduleId: "sac-no-04",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "¿Cuál es la responsabilidad legal de dispensar un producto óptico con receta caducada?",
    options: [
      "Ninguna, la responsabilidad es 100% del cliente que pagó",
      "Responsabilidad profesional y solidaria por dispensar dispositivos médicos sin aval clínico vigente",
      "Solo aplica si el paciente sufre un accidente automovilístico",
      "Una multa menor que cubre el seguro de la tienda",
    ],
    answer: 1,
    explanation: "Los lentes correctivos son dispositivos médicos de prescripción; el establecimiento responde por dispensaciones negligentes.",
  },
  {
    id: "sac-no-q-024",
    moduleId: "sac-no-04",
    role: "Optómetra",
    difficulty: "Avanzada",
    prompt: "¿Cómo se transforma la negativa de receta vencida en una oportunidad comercial y de fidelización?",
    options: [
      "Ofreciendo el examen optométrico gratuito o preferente en el momento para cerrar la venta con su fórmula perfecta",
      "Cobrando una penalidad de renovación de receta",
      "Vendiendo lentes de sol sin aumento en lugar de correctivos",
      "Enviando al cliente a una óptica vecina",
    ],
    answer: 0,
    explanation: "El gabinete optométrico disponible en tienda soluciona la vigencia en minutos y asegura una prescripción precisa y actualizada.",
  },
  {
    id: "sac-no-q-025",
    moduleId: "sac-no-05",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué defecto sí está cubierto por la garantía de fábrica de tratamientos antirreflejo?",
    options: [
      "Rayaduras longitudinales por limpieza con camiseta",
      "Craquelado reticular homogéneo por falla de adherencia o tensión térmica de fábrica",
      "Marcas por apoyo de las lunas boca abajo sobre superficies rugosas",
      "Quemaduras por salpicadura de aceite de cocina",
    ],
    answer: 1,
    explanation: "El craquelado en red reticular uniforme refleja vicios de tratamiento o adherencia en laboratorio, cubierto por garantía.",
  },
  {
    id: "sac-no-q-026",
    moduleId: "sac-no-05",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué patrón visual identifica una rayadura por mal uso frente a una falla de fábrica?",
    options: [
      "Líneas o surcos abrasivos aleatorios localizados en el área de contacto",
      "Pérdida simétrica del color en ambos bordes superiores",
      "Burbujas microscópicas atrapadas en el núcleo del monómero",
      "Lente perfectamente liso pero que cambia de color",
    ],
    answer: 0,
    explanation: "Las rayas por roce mecánico o limpieza inadecuada forman surcos microscópicos irregulares con bordes dentados.",
  },
  {
    id: "sac-no-q-027",
    moduleId: "sac-no-05",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Al comunicar la improcedencia de una garantía, ¿qué fraseología es la más adecuada?",
    options: [
      "Usted rayó sus lentes por descuidado y no le corresponde nada",
      "El informe microscópico muestra marcas por fricción mecánica externa; por norma técnica no califica como falla de fabricación",
      "A nosotros el proveedor no nos reconoce esto así que no podemos ayudarlo",
      "Si hubiera comprado el lente más caro esto no le habría pasado",
    ],
    answer: 1,
    explanation: "Despersonalizar la causa y apoyarse en el dictamen técnico objetivo del laboratorio previene discusiones estériles.",
  },
  {
    id: "sac-no-q-028",
    moduleId: "sac-no-05",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Por qué el alcohol isopropílico no debe aplicarse en ciertos tratamientos de lunas orgánicas?",
    options: [
      "Porque evapora el tinte del monómero y deteriora los recubrimientos hidrofóbicos",
      "Porque hace que el lente aumente de grosor",
      "Porque vuelve el lente completamente opaco en 5 segundos",
      "Porque derrite el titanio de las monturas",
    ],
    answer: 0,
    explanation: "Los solventes agresivos degradan las multicapas nanométricas y resecan la capa hidrofóbica superior.",
  },
  {
    id: "sac-no-q-029",
    moduleId: "sac-no-05",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Cuál es la mejor alternativa comercial cuando una garantía es dictaminada como NO procedente?",
    options: [
      "Invitar al cliente a retirarse de la tienda",
      "Ofrecer el Plan Renueva SAC con un descuento de fidelización comercial de 30% a 50% en un nuevo par",
      "Prometerle que en su próxima compra le regalaremos un estuche",
      "Ofrecerle pulir la luna aunque pierda la curvatura",
    ],
    answer: 1,
    explanation: "El descuento comercial de cortesía alivia el impacto económico del cliente y salva la relación a largo plazo.",
  },
  {
    id: "sac-no-q-030",
    moduleId: "sac-no-05",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué respaldo documental debe emitirse al cliente tras una denegación de garantía?",
    options: [
      "Ninguno, las negativas se comunican solo verbalmente",
      "Informe técnico de laboratorio con fotografías macro y opciones comerciales detalladas",
      "Una copia de la ley de protección al consumidor subrayada",
      "Una factura con cargo por servicio de revisión",
    ],
    answer: 1,
    explanation: "Entregar el informe formal con fotos y dictamen fundamenta la seriedad de la óptica y brinda sustento irrefutable.",
  },
  {
    id: "sac-no-q-031",
    moduleId: "sac-no-06",
    role: "Todos",
    difficulty: "Básica",
    prompt: "Ante un cliente profundamente alterado que grita en mostrador, ¿cuál es el primer paso?",
    options: [
      "Gritar más fuerte para restablecer el orden en la tienda",
      "Escuchar en silencio receptivo durante la fase de desahogo (60-90 segundos) sin interrumpir",
      "Amenazar con llamar a seguridad privada inmediatamente",
      "Darse la vuelta e ingresar al taller hasta que se calme",
    ],
    answer: 1,
    explanation: "La curva de hostilidad indica que la adrenalina disminuye tras 60-90 segundos si no encuentra resistencia refleja.",
  },
  {
    id: "sac-no-q-032",
    moduleId: "sac-no-06",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Por qué nunca se debe decir 'cálmese' a una persona enojada?",
    options: [
      "Porque es una palabra en desuso en el idioma español",
      "Porque se interpreta como descalificación de su sentir y aumenta la frustración",
      "Porque indica que el asesor está asustado",
      "Porque solo los médicos pueden prescribir calma",
    ],
    answer: 1,
    explanation: "Decir 'cálmese' invalida el estado emocional de la persona y suele interpretarse como arrogancia o desprecio.",
  },
  {
    id: "sac-no-q-033",
    moduleId: "sac-no-06",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué técnica de modulación vocal ayuda a desactivar la agresión verbal?",
    options: [
      "Subir el volumen al nivel del cliente para sonar firme",
      "Bajar el volumen, enlentecer el ritmo de habla y usar un tono cálido y grave",
      "Hablar entre dientes para no comprometerse",
      "Repetir 'sí, señor' rápidamente de forma monótona",
    ],
    answer: 1,
    explanation: "La técnica del reflejo inverso induce biológicamente al interlocutor a bajar su propio tono para poder escuchar.",
  },
  {
    id: "sac-no-q-034",
    moduleId: "sac-no-06",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cuál es el beneficio de invitar al cliente hostil a una mesa o espacio de atención privado?",
    options: [
      "Ocultar el problema a los demás clientes y permitir que el usuario baje la guardia sin público",
      "Encerrar al cliente para que no pueda irse",
      "Poder discutir con mayor comodidad sin que nadie grabe",
      "Evitar tener que ofrecerle alternativas comerciales",
    ],
    answer: 0,
    explanation: "Quitar el 'escenario' público ayuda al cliente a abandonar la postura defensiva sin sentir que pierde reputación.",
  },
  {
    id: "sac-no-q-035",
    moduleId: "sac-no-06",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Si el cliente insiste en exigir el Libro de Reclamaciones ante una negativa técnica, ¿qué se debe hacer?",
    options: [
      "Negarlo diciendo que el sistema está caído",
      "Facilitarlo de inmediato con amabilidad, orientando su llenado y manteniendo el respeto",
      "Discutir punto por punto antes de permitirle escribir",
      "Decirle que solo el gerente general puede autorizar el libro",
    ],
    answer: 1,
    explanation: "Entregar el libro de reclamaciones con cortesía es una obligación legal y demuestra transparencia y tranquilidad institucional.",
  },
  {
    id: "sac-no-q-036",
    moduleId: "sac-no-06",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué hacer si un cliente pasa de la hostilidad verbal a amenazas físicas o agresiones directas?",
    options: [
      "Responder físicamente para defender el patrimonio",
      "Activar el protocolo de emergencia, priorizar la seguridad física y contactar apoyo de seguridad",
      "Retarlo a salir a la calle para solucionar el problema",
      "Aceptar todas sus exigencias y regalarle mercancía",
    ],
    answer: 1,
    explanation: "La integridad física del equipo humano está por encima de cualquier producto o trámite comercial.",
  },
  {
    id: "sac-no-q-037",
    moduleId: "sac-no-07",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿En qué consiste la 'Regla de Oro' al emitir una respuesta negativa en SAC?",
    options: [
      "Acompañar siempre el límite con al menos dos alternativas viables de solución",
      "Cobrar el 50% por adelantado antes de decir que no",
      "Repetir la negativa dos veces para que no queden dudas",
      "Hacer firmar al cliente dos copias idénticas del recibo",
    ],
    answer: 0,
    explanation: "La regla de oro exige que todo límite técnico o normativo vaya de la mano de al menos 2 alternativas constructivas.",
  },
  {
    id: "sac-no-q-038",
    moduleId: "sac-no-07",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Por qué brindar dos opciones es más efectivo que brindar solo una?",
    options: [
      "Porque confunde al cliente y lo hace dudar",
      "Porque devuelve al cliente la sensación de control y capacidad de elección sobre su problema",
      "Porque duplica las posibilidades de comisiones del asesor",
      "Porque así lo exige el código tributario",
    ],
    answer: 1,
    explanation: "Ofrecer alternativas transforma una imposición en un proceso de elección donde el cliente recupera la autonomía.",
  },
  {
    id: "sac-no-q-039",
    moduleId: "sac-no-07",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Ante una montura rota irreparable, ¿cuál es la dupla típica de opciones viables recomendada en SAC?",
    options: [
      "Opción A: Pegamento casero; Opción B: Descartar los lentes",
      "Opción 1: Trasvase de lunas a un aro compatible; Opción 2: Montura nueva con descuento comercial de renovación",
      "Opción 1: Esperar 6 meses por un repuesto; Opción 2: Usar lentes de contacto sin graduar",
      "Opción A: Devolver las lunas; Opción B: Cobrar penalidad",
    ],
    answer: 1,
    explanation: "El trasvase aprovecha las lunas actuales de forma inmediata, mientras que el plan renueva ofrece una solución integral definitiva.",
  },
  {
    id: "sac-no-q-040",
    moduleId: "sac-no-07",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "Al presentar las dos alternativas, ¿cómo debe ser la postura del asesor?",
    options: [
      "Presionar agresivamente por la más cara",
      "Explicar ventajas, tiempos y costos de ambas con objetividad y dejar que el usuario decida",
      "Indicar que ninguna de las dos le parece conveniente",
      "Decidir por el cliente sin consultarle",
    ],
    answer: 1,
    explanation: "La asesoría consultiva expone con honestidad los pros y contras de cada camino para que la decisión sea informada.",
  },
  {
    id: "sac-no-q-041",
    moduleId: "sac-no-07",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué ocurre cuando se comunica un NO sin ninguna alternativa de apoyo?",
    options: [
      "El cliente agradece la brevedad de la atención",
      "Se crea un callejón sin salida que genera frustración, resentimiento y pérdida de clientela",
      "El cliente regresa inmediatamente al día siguiente",
      "Se optimizan los procesos internos del laboratorio",
    ],
    answer: 1,
    explanation: "Un NO absoluto sin salida empuja al cliente a la competencia sintiendo que no fue valorado ni ayudado.",
  },
  {
    id: "sac-no-q-042",
    moduleId: "sac-no-07",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Si ninguna de las alternativas comerciales le acomoda al cliente, ¿cuál es el cierre profesional?",
    options: [
      "Reclamarle por hacer perder el tiempo al personal",
      "Agradecer su visita, entregarle su ficha con el estado diagnosticado y dejar las puertas abiertas",
      "Retener su montura hasta que abone el costo de la revisión",
      "Ignorar su despedida",
    ],
    answer: 1,
    explanation: "Cerrar con elegancia y cortesía mantiene la reputación de la óptica y permite que el cliente vuelva cuando lo requiera.",
  },
  {
    id: "sac-no-q-043",
    moduleId: "sac-no-08",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Cuál es la función primordial del acta de deslinde técnico informado?",
    options: [
      "Cobrar un cargo administrativo extra al paciente",
      "Dejar constancia escrita y firmada de los riesgos advertidos antes de una intervención delicada",
      "Reemplazar la factura o boleta de venta",
      "Garantizar que el producto quedará idéntico a nuevo",
    ],
    answer: 1,
    explanation: "El acta respalda documentalmente que el cliente fue informado de la fragilidad del producto y asumió el riesgo voluntariamente.",
  },
  {
    id: "sac-no-q-044",
    moduleId: "sac-no-08",
    role: "Todos",
    difficulty: "Básica",
    prompt: "¿Qué elemento gráfico debe adjuntarse obligatoriamente a la ficha digital de deslinde en SAC?",
    options: [
      "El logotipo de la marca del armazón",
      "La serie de fotografías de inspección (frontal, codos y detalle macro del daño preexistente)",
      "Una foto del rostro del asesor",
      "El croquis de ubicación de la sucursal",
    ],
    answer: 1,
    explanation: "Las imágenes macro demuestran el estado real en que ingresó el producto antes de cualquier manipulación.",
  },
  {
    id: "sac-no-q-045",
    moduleId: "sac-no-08",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Cómo debe presentarse el documento de deslinde al cliente para no alarmarlo?",
    options: [
      "Diciéndole 'firme aquí si quiere que lo atendamos o váyase'",
      "Explicando que es un respaldo mutuo de transparencia sobre lo conversado y el estado del producto",
      "Escondiendo el texto y pidiendo solo la firma en blanco",
      "Afirmando que es un trámite sin importancia que nadie lee",
    ],
    answer: 1,
    explanation: "Enfocar el documento como una constancia de transparencia y cuidado mutuo genera confianza y colaboración.",
  },
  {
    id: "sac-no-q-046",
    moduleId: "sac-no-08",
    role: "Todos",
    difficulty: "Intermedia",
    prompt: "¿Qué datos clave debe contener el acta de constancia SAC?",
    options: [
      "Estado inicial detallado, advertencias técnicas comunicadas, alternativa elegida y firma del usuario",
      "Número de cuenta bancaria y clave secreta del cliente",
      "Opinión personal del asesor sobre el gusto del cliente",
      "Solo la fecha y el nombre de la tienda",
    ],
    answer: 0,
    explanation: "El acta debe ser un relato fáctico del estado inicial, los riesgos advertidos, la decisión acordada y las firmas correspondientes.",
  },
  {
    id: "sac-no-q-047",
    moduleId: "sac-no-08",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "Una vez firmado el deslinde y concluida la atención, ¿qué paso garantiza la trazabilidad operativa?",
    options: [
      "Tirar la ficha física al papelero al finalizar el día",
      "Cargar la constancia y fotos al ticket en la plataforma SAC y registrar la resolución",
      "Guardar el documento en el casillero personal del asesor",
      "Publicar la foto en las redes sociales de la tienda",
    ],
    answer: 1,
    explanation: "Subir la información a la plataforma centralizada SAC asegura trazabilidad ante cualquier auditoría o consulta posterior.",
  },
  {
    id: "sac-no-q-048",
    moduleId: "sac-no-08",
    role: "Todos",
    difficulty: "Avanzada",
    prompt: "¿Qué acción de seguimiento post-servicio refuerza la satisfacción del cliente tras un caso difícil?",
    options: [
      "Una llamada o mensaje de seguimiento técnico a los 5-7 días consultando su adaptación y confort",
      "Enviar promociones de productos no relacionados cada 24 horas",
      "Esperar a que el cliente vuelva a quejarse para contactarlo",
      "Cerrar la ficha sin volver a tocar el tema",
    ],
    answer: 0,
    explanation: "El seguimiento proactivo demuestra genuino compromiso profesional y fideliza al paciente de por vida.",
  },
];

/** Ocho preguntas de recepción segura, una por módulo de la Cápsula 01. */
export const receptionCertificationQuestionIds = [
  "sac-q-003",
  "sac-q-009",
  "sac-q-015",
  "sac-q-021",
  "sac-q-027",
  "sac-q-033",
  "sac-q-039",
  "sac-q-045",
] as const;

/** Ocho preguntas de garantía de lunas, una por módulo de la Cápsula 02. */
export const lunasCertificationQuestionIds = [
  "sac-luna-q-003",
  "sac-luna-q-009",
  "sac-luna-q-015",
  "sac-luna-q-021",
  "sac-luna-q-027",
  "sac-luna-q-033",
  "sac-luna-q-039",
  "sac-luna-q-045",
] as const;

/** Preguntas estables usadas por la certificación principal. */
export const certificationQuestionIds = receptionCertificationQuestionIds;

/** Diez preguntas balanceadas usadas por Trivia Sprint. */
export const triviaQuestionIds = [
  "sac-q-001",
  "sac-q-008",
  "sac-q-014",
  "sac-q-020",
  "sac-q-026",
  "sac-q-032",
  "sac-q-038",
  "sac-q-044",
  "sac-q-047",
  "sac-q-048",
] as const;

function selectQuestions(ids: readonly string[]): QuizQuestion[] {
  return ids.map((id) => {
    const question = questionBank.find((item) => item.id === id);
    if (!question) {
      throw new Error(`No existe la pregunta publicada ${id}.`);
    }
    return question;
  });
}

export const finalQuizQuestions = selectQuestions(certificationQuestionIds);

export const lunasQuizQuestions = selectQuestions(lunasCertificationQuestionIds);

/** Ocho preguntas de asertividad y límites técnicos, una por módulo de la Cápsula 03. */
export const decirNoCertificationQuestionIds = [
  "sac-no-q-003",
  "sac-no-q-009",
  "sac-no-q-015",
  "sac-no-q-021",
  "sac-no-q-027",
  "sac-no-q-033",
  "sac-no-q-039",
  "sac-no-q-045",
] as const;

export const decirNoQuizQuestions = selectQuestions(decirNoCertificationQuestionIds);

export const triviaQuestions = selectQuestions(triviaQuestionIds);

export const riskCases: RiskCase[] = [
  {
    id: "risk-01",
    title: "Ajuste menor en armazón estable",
    context:
      "Armazón reciente, sin fisuras, reparaciones ni deformaciones. Bisagras estables y ajuste solicitado de baja complejidad.",
    signals: ["Estructura estable", "Sin reparaciones visibles", "Intervención de baja complejidad"],
    answer: "Bajo",
    explanation:
      "Las condiciones permiten continuar con el protocolo habitual: inspección, explicación, registro y confirmación.",
  },
  {
    id: "risk-02",
    title: "Holgura y desgaste moderado",
    context:
      "Armazón de uso frecuente con desgaste superficial, una bisagra con holgura y sin fisuras visibles. Se solicita alineación.",
    signals: ["Desgaste moderado", "Holgura funcional", "Ajuste con precaución adicional"],
    answer: "Medio",
    explanation:
      "La combinación exige documentación detallada y una técnica prudente, aunque no se observa una falla estructural crítica.",
  },
  {
    id: "risk-03",
    title: "Fisura junto a la bisagra",
    context:
      "Una línea de fisura cruza el aro de acetato cerca de la bisagra derecha. El cliente solicita retirar y volver a montar las lunas.",
    signals: ["Fisura estructural", "Zona de carga", "Manipulación exigente"],
    answer: "Alto",
    explanation:
      "La fisura está en una zona crítica y la intervención aumentaría la carga. Se debe pausar y escalar antes de continuar.",
  },
  {
    id: "risk-04",
    title: "Limpieza sin novedades",
    context:
      "Armazón metálico estable, tornillos completos y lunas bien asentadas. Se solicita limpieza y cambio de plaquetas compatibles.",
    signals: ["Sin señales estructurales", "Piezas completas", "Procedimiento controlado"],
    answer: "Bajo",
    explanation:
      "El estado y el procedimiento son de baja complejidad, pero se mantienen todos los controles de recepción.",
  },
  {
    id: "risk-05",
    title: "Antecedente incierto y ajuste moderado",
    context:
      "El cliente desconoce la antigüedad. No se observan fisuras, pero existe deformación moderada y diferencia de tensión entre varillas.",
    signals: ["Antigüedad desconocida", "Deformación moderada", "Respuesta funcional desigual"],
    answer: "Medio",
    explanation:
      "La incertidumbre y la respuesta desigual justifican una evaluación cautelosa y controles adicionales antes del ajuste.",
  },
  {
    id: "risk-06",
    title: "Soldadura estructural previa",
    context:
      "Armazón metálico con soldadura visible en el puente. Se solicita ensanchar el frente y la maniobra concentraría fuerza cerca de la reparación.",
    signals: ["Reparación estructural", "Puente intervenido", "Carga prevista junto a la soldadura"],
    answer: "Alto",
    explanation:
      "La reparación y la exigencia del procedimiento forman una combinación crítica que requiere validación autorizada.",
  },
  {
    id: "risk-07",
    title: "Tornillo incompleto",
    context:
      "No hay fisuras, pero falta parcialmente un tornillo y la luna presenta movimiento leve. Se solicita un ajuste general.",
    signals: ["Pieza de sujeción incompleta", "Movimiento de la luna", "Corrección previa necesaria"],
    answer: "Medio",
    explanation:
      "La inestabilidad debe corregirse y documentarse antes de cualquier otro ajuste; no es una condición normal de riesgo bajo.",
  },
  {
    id: "risk-08",
    title: "Material quebradizo y decolorado",
    context:
      "El acetato presenta blanqueamiento, microfisuras y una textura quebradiza en ambos terminales. Se solicita curvar las varillas con calor.",
    signals: ["Material degradado", "Microfisuras", "Procedimiento térmico solicitado"],
    answer: "Alto",
    explanation:
      "Las señales de degradación y la aplicación de calor elevan el caso a alto; se debe detener y solicitar evaluación técnica.",
  },
  {
    id: "risk-09",
    title: "Cambio rutinario de tornillo",
    context:
      "Armazón reciente y estable. Un tornillo compatible está completo pero se afloja con el uso; no existen fisuras ni deformación.",
    signals: ["Estructura estable", "Repuesto compatible", "Intervención localizada"],
    answer: "Bajo",
    explanation:
      "El procedimiento es localizado y el producto no presenta señales críticas. Corresponde continuar con el registro habitual.",
  },
];

export const conversationCases: ConversationCase[] = [
  {
    id: "conversation-01",
    customer: "«No veo ninguna fisura; recíbalo así porque tengo prisa».",
    context: "La luz lateral revela una línea fina junto a la bisagra derecha.",
    options: [
      "No se preocupe, seguro no pasará nada.",
      "Voy a mostrarle la zona con esta iluminación y registrarla antes de decidir el siguiente paso.",
      "Si no la ve, firme aquí para dejar constancia.",
      "El técnico decidirá después; ahora no necesitamos detenernos.",
    ],
    answer: 1,
    explanation:
      "Mostrar la evidencia y explicar la decisión incorpora al cliente sin minimizar la señal ni ejercer presión.",
  },
  {
    id: "conversation-02",
    customer: "«¿Me garantiza que el armazón no se va a romper?».",
    context: "El producto tiene desgaste moderado y requiere un ajuste localizado.",
    options: [
      "Sí, nuestros técnicos garantizan cualquier ajuste.",
      "No puedo decirle nada hasta que firme.",
      "No es posible prometer un resultado absoluto; sí puedo explicarle el estado, la técnica y los controles que aplicaremos.",
      "Solo se rompería por el desgaste que usted causó.",
    ],
    answer: 2,
    explanation:
      "La respuesta informa límites y controles de manera transparente, sin promesas absolutas ni atribución anticipada de culpa.",
  },
  {
    id: "conversation-03",
    customer: "«Ese adhesivo siempre estuvo ahí y nunca dio problemas».",
    context: "El adhesivo está en el puente, cerca del punto que debe manipularse.",
    options: [
      "Entonces podemos ignorarlo porque ya resistió antes.",
      "Voy a retirarlo para comprobar qué hay debajo.",
      "Si firma, el antecedente deja de ser relevante.",
      "Gracias por indicarlo. Al estar en una zona de carga, debemos registrarlo y validar la intervención antes de continuar.",
    ],
    answer: 3,
    explanation:
      "Reconocer la información del cliente y explicar su relevancia permite actuar con criterio sin discutir ni manipular la zona.",
  },
  {
    id: "conversation-04",
    customer: "«No estoy de acuerdo con el estado que escribieron».",
    context: "La ficha todavía no ha sido aceptada ni cerrada.",
    options: [
      "Revisemos juntos cada observación y su fotografía; si persiste la diferencia, pausaremos para solicitar apoyo.",
      "Debe firmar porque las fotografías ya fueron tomadas.",
      "Borraré las observaciones para evitar una inconformidad.",
      "Cerraremos la ficha y podrá reclamar después.",
    ],
    answer: 0,
    explanation:
      "Revisar la evidencia y pausar si no hay acuerdo protege la comprensión, el consentimiento y la integridad del registro.",
  },
];

/** Orden operativo canónico; la interfaz puede mezclarlo para el reto. */
export const protocolOrder: ProtocolStep[] = [
  {
    id: "protocol-01",
    label: "Confirmar el servicio solicitado",
    explanation: "Define el alcance antes de revisar o manipular el producto.",
  },
  {
    id: "protocol-02",
    label: "Inspeccionar el producto junto con el cliente",
    explanation: "Establece una línea base compartida de armazón y lunas.",
  },
  {
    id: "protocol-03",
    label: "Clasificar el nivel de riesgo",
    explanation: "Relaciona los hallazgos con la complejidad del procedimiento.",
  },
  {
    id: "protocol-04",
    label: "Mostrar hallazgos y explicar el procedimiento",
    explanation: "Informa con hechos observables y sin promesas absolutas.",
  },
  {
    id: "protocol-05",
    label: "Capturar evidencia y completar la ficha",
    explanation: "Vincula fotografías, descripciones, responsables y nivel de riesgo.",
  },
  {
    id: "protocol-06",
    label: "Obtener la validación requerida",
    explanation: "Un riesgo alto permanece en pausa hasta contar con autorización trazable.",
  },
  {
    id: "protocol-07",
    label: "Resolver preguntas y confirmar comprensión",
    explanation: "Verifica que la persona comprende lo observado y el siguiente paso.",
  },
  {
    id: "protocol-08",
    label: "Registrar la aceptación y cerrar la recepción",
    explanation: "La decisión se documenta únicamente después de completar los controles previos.",
  },
];

/** Puntos de observación sobre la imagen de inspección; x e y son porcentajes. */
export const visualFindings: VisualFinding[] = [
  {
    id: "visual-01",
    label: "Inicio de la fisura",
    x: 56,
    y: 38,
    explanation: "El extremo más fino ayuda a distinguir una fisura de una marca superficial.",
  },
  {
    id: "visual-02",
    label: "Extensión sobre el aro",
    x: 62,
    y: 42,
    explanation: "Seguir la línea permite estimar su recorrido y documentar su orientación.",
  },
  {
    id: "visual-03",
    label: "Blanqueamiento del material",
    x: 59,
    y: 50,
    explanation: "El cambio de color puede indicar tensión o degradación alrededor de la novedad.",
  },
  {
    id: "visual-04",
    label: "Borde potencialmente inestable",
    x: 67,
    y: 55,
    explanation: "La proximidad al borde puede facilitar que la fisura se propague durante la manipulación.",
  },
  {
    id: "visual-05",
    label: "Zona cercana a la bisagra",
    x: 73,
    y: 48,
    explanation: "Las bisagras transmiten carga; una novedad próxima requiere especial precaución.",
  },
  {
    id: "visual-06",
    label: "Punto de concentración de carga",
    x: 69,
    y: 61,
    explanation: "Identificar dónde se concentraría la fuerza ayuda a decidir que no debe manipularse sin validación.",
  },
];

export const checklistChallenge: ChecklistChallengeItem[] = [
  {
    id: "check-01",
    label: "Confirmar el servicio solicitado",
    required: true,
    feedback: "El alcance debe estar claro antes de iniciar la inspección.",
  },
  {
    id: "check-02",
    label: "Inspeccionar armazón y lunas junto con el cliente",
    required: true,
    feedback: "Esta revisión establece la línea base compartida.",
  },
  {
    id: "check-03",
    label: "Registrar hallazgos con ubicación precisa",
    required: true,
    feedback: "Una descripción verificable indica componente, lado y condición.",
  },
  {
    id: "check-04",
    label: "Clasificar el riesgo con criterios observables",
    required: true,
    feedback: "La clasificación combina estado, reparación, material y procedimiento.",
  },
  {
    id: "check-05",
    label: "Capturar vistas de contexto y detalle",
    required: true,
    feedback: "Ambas vistas son necesarias para ubicar y verificar la novedad.",
  },
  {
    id: "check-06",
    label: "Registrar la validación si el riesgo es alto",
    required: true,
    feedback: "Un caso alto no continúa sin una autorización identificable.",
  },
  {
    id: "check-07",
    label: "Confirmar comprensión y resolver preguntas",
    required: true,
    feedback: "La decisión debe ser informada, no una respuesta automática.",
  },
  {
    id: "check-08",
    label: "Solicitar la aceptación al final",
    required: true,
    feedback: "La aceptación se registra después de completar revisión, explicación y evidencia.",
  },
  {
    id: "check-09",
    label: "Solicitar la firma antes de inspeccionar para ahorrar tiempo",
    required: false,
    feedback: "La firma anticipada no demuestra una explicación completa ni una decisión informada.",
  },
  {
    id: "check-10",
    label: "Prometer que no habrá cambios si el riesgo parece bajo",
    required: false,
    feedback: "SAC no ofrece garantías absolutas; comunica condiciones y controles.",
  },
  {
    id: "check-11",
    label: "Eliminar fotografías que contradigan la descripción",
    required: false,
    feedback: "Una contradicción se corrige completando la ficha, nunca suprimiendo evidencia válida.",
  },
];

export const botKnowledge: BotKnowledgeItem[] = [
  {
    id: "bot-secuencia",
    intent: "Secuencia de recepción",
    keywords: ["secuencia", "pasos", "como empiezo", "iniciar", "recepcion", "primer contacto", "proceso"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Confirma el servicio solicitado con el cliente manteniendo el armazón a la vista y escucha sus necesidades.\n• [A] Analizar el riesgo: Examina conjuntamente aros, puente, bisagras y lunas para determinar la línea base compartida y el nivel de riesgo (Bajo/Medio/Alto).\n• [P] Protocolo SAC: Sigue la secuencia obligatoria: inspeccionar, registrar 4 fotografías de evidencia y explicar la manipulación antes de intervenir.\n• [A] Asegurar y Acordar: Comprueba que el cliente comprendió las condiciones, registra la aceptación en la ficha digital y escala si detectas novedades críticas.",
    relatedModuleIds: ["sac-01", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-inspeccion",
    intent: "Componentes de inspección",
    keywords: ["inspeccionar", "revisar", "componentes", "armazon", "bisagra", "tornillos", "puente", "aros"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Invita al cliente a la revisión: «Revisemos juntos cada parte del armazón para dejar constancia de su estado inicial».\n• [A] Analizar el riesgo: Inspecciona en orden sistemático aro, puente, bisagras, tornillos, varillas, terminales, plaquetas y superficies de las lunas en busca de microfisuras o fatiga.\n• [P] Protocolo SAC: Verifica la apertura y simetría con movimientos suaves, sin ejercer tensión ni usar bisagras o soldaduras como punto de apoyo.\n• [A] Asegurar y Acordar: Registra cada hallazgo con su ubicación exacta y fotografía macro; evita descripciones generales como «buen estado» sin respaldo.",
    relatedModuleIds: ["sac-02"],
    escalation: false,
  },
  {
    id: "bot-bajo",
    intent: "Riesgo bajo",
    keywords: ["riesgo bajo", "bajo", "estable", "sin novedades", "perfecto estado", "nuevo"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Reconoce que el armazón se encuentra en condición estable y confirma el procedimiento de ajuste o mantenimiento solicitado.\n• [A] Analizar el riesgo: Clasificación Riesgo Bajo confirmada: ausencia total de fisuras, deformación, holguras o reparaciones previas, en monturas con menos de 1 año.\n• [P] Protocolo SAC: Aplica la técnica estándar adecuada al material; un riesgo bajo no elimina la inspección ni las fotos testimoniales del proceso.\n• [A] Asegurar y Acordar: Completa los datos en la ficha digital, informa al cliente las precauciones habituales y obtén su firma antes de manipular.",
    relatedModuleIds: ["sac-04"],
    escalation: false,
  },
  {
    id: "bot-medio",
    intent: "Riesgo medio",
    keywords: ["riesgo medio", "medio", "holgura", "desgaste", "deformacion", "tornillo flojo", "rayones"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Muestra al cliente de forma tranquila el desgaste natural, las holguras o la ligera deformación observada.\n• [A] Analizar el riesgo: Clasificación Riesgo Medio: armazones entre 1 y 2 años de uso, holguras mecánicas o desgaste superficial que requieren precaución adicional.\n• [P] Protocolo SAC: Documenta las novedades con fotografías claras, distribuye el apoyo al ajustar sin forzar los terminales y protege las lunas contra rayaduras.\n• [A] Asegurar y Acordar: Explica que la maniobra busca corregir el asentamiento sin forzar el material fatigado y deja registrada la confirmación en la ficha.",
    relatedModuleIds: ["sac-04"],
    escalation: false,
  },
  {
    id: "bot-alto",
    intent: "Riesgo alto",
    keywords: ["riesgo alto", "alto", "critico", "pausar", "detener", "peligro", "romperse"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Contén la situación con calma: «Por seguridad técnica de su armazón, necesitamos realizar una pausa preventiva antes de intervenir».\n• [A] Analizar el riesgo: Clasificación Riesgo Alto: detectada fisura, material quebradizo, soldadura previa, pieza inestable o más de 2 años de uso.\n• [P] Protocolo SAC: Detén de inmediato cualquier manipulación o uso de calor; captura fotografías amplias y macro del punto crítico sobre superficie protegida.\n• [A] Asegurar y Acordar: Registra la referencia de escalamiento obligatoria en la ficha digital; no continúes sin la validación formal del optómetra o taller.",
    relatedModuleIds: ["sac-04", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-escalamiento",
    intent: "Cuándo escalar un caso",
    keywords: ["escalar", "escalamiento", "cuando escalo", "validacion", "autorizar", "supervisor", "taller", "permiso"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Identifica la condición crítica o desacuerdo con el cliente y mantén una postura profesional y comprensiva.\n• [A] Analizar el riesgo: Determina el criterio técnico: escala antes de continuar cuando observes fisuras, piezas críticas sueltas, reparaciones estructurales, deformación severa o cualquier duda técnica.\n• [P] Protocolo SAC: Coloca el armazón en la bandeja de protección, no intentes soluciones improvisadas y documenta la secuencia completa con fotos nítidas.\n• [A] Asegurar y Acordar: Traslada el caso al optómetra o supervisor autorizado, registra el código de escalamiento en la ficha y acuerda con el cliente el seguimiento.",
    relatedModuleIds: ["sac-04", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-fisura",
    intent: "Fisura o microfisura",
    keywords: ["fisura", "microfisura", "grieta", "rajado", "linea", "quebrado", "partido"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Señala la fisura al cliente en el mostrador: «Quiero mostrarle esta línea para que ambos tengamos el mismo registro previo».\n• [A] Analizar el riesgo: Clasificación Riesgo Alto: una microfisura es un punto de concentración de tensiones; cualquier presión o calor provocará la fractura completa.\n• [P] Protocolo SAC: Prohibido manipular o probar la resistencia con las manos. Toma 1 foto general de ubicación y 1 foto macro iluminada del detalle.\n• [A] Asegurar y Acordar: Escala el caso para validación técnica, informa al cliente el riesgo inminente de rotura y obtén su decisión documentada en la ficha.",
    relatedModuleIds: ["sac-02", "sac-04", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-calor",
    intent: "Uso de calor",
    keywords: ["calor", "calentar", "temperatura", "acetato", "ajuste", "calentador", "aire caliente", "arena"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Confirma con el cliente la zona que requiere amoldarse y revisa si el material admite conformación térmica.\n• [A] Analizar el riesgo: El calor controlado (60-70°C) solo es apto para acetato y zyl; nunca apliques calor sobre TR-90, poliamidas con memoria, piezas pegadas ni sobre fisuras.\n• [P] Protocolo SAC: Aplica calor de manera gradual y localizada con calentador de aire o arena, protegiendo las lunas; detén de inmediato ante cambio de brillo, olor o resistencia.\n• [A] Asegurar y Acordar: Recuerda que el calor relaja el plástico pero no repara el material reseco; documenta el procedimiento y registra la aceptación.",
    relatedModuleIds: ["sac-03"],
    escalation: false,
  },
  {
    id: "bot-reparacion",
    intent: "Reparación previa",
    keywords: ["reparacion", "soldadura", "adhesivo", "pegamento", "arreglado", "pega loca", "brujita"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Pregunta al cliente con naturalidad: «¿Este armazón ha tenido alguna reparación o soldadura anterior en esta zona?».\n• [A] Analizar el riesgo: Clasificación Riesgo Alto: adhesivos instantáneos o soldaduras caseras debilitan los polímeros y metales adyacentes, alterando la resistencia.\n• [P] Protocolo SAC: No apliques fuerza, calor ni solventes sobre la zona reparada; captura un acercamiento nítido donde se aprecie el residuo o la unión.\n• [A] Asegurar y Acordar: Registra la reparación previa en la ficha de inspección, solicita autorización técnica de escalamiento y explica las limitaciones de garantía.",
    relatedModuleIds: ["sac-02", "sac-04"],
    escalation: true,
  },
  {
    id: "bot-fotos",
    intent: "Fotografías necesarias",
    keywords: ["foto", "fotografia", "evidencia", "imagen", "camara", "fotos necesarias", "cuantas fotos"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Explica al cliente: «Tomamos fotografías del armazón para respaldar su entrega y garantizar transparencia técnica».\n• [A] Analizar el riesgo: La ausencia de evidencia fotográfica imposibilita defender el servicio ante reclamos por daños preexistentes.\n• [P] Protocolo SAC: Serie obligatoria de 4 tomas: 1 frontal completa, 1 lateral derecha, 1 lateral izquierda y 1 o más detalles macro de cualquier anomalía visible.\n• [A] Asegurar y Acordar: Usa fondo neutro y luz uniforme sin reflejos en las lunas; verifica que las imágenes queden sincronizadas y con huella SHA-256 en la ficha.",
    relatedModuleIds: ["sac-06"],
    escalation: false,
  },
  {
    id: "bot-foto-borrosa",
    intent: "Fotografía borrosa o con reflejo",
    keywords: ["borrosa", "desenfocada", "oscura", "reflejo", "repetir foto", "foto borrosa"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Detecta de inmediato si la foto en pantalla no permite leer inscripciones o distinguir rayones y fisuras.\n• [A] Analizar el riesgo: Una foto borrosa no tiene validez como evidencia técnica ni jurídica y no protege a la óptica ante un reclamo.\n• [P] Protocolo SAC: Repite la toma antes de finalizar: apoya el dispositivo para evitar trepidación, enfoca el borde crítico y orienta la luz para anular destellos.\n• [A] Asegurar y Acordar: Comprueba en la vista previa del sistema que la imagen sea nítida y reemplaza la toma defectuosa antes de pedir la firma al cliente.",
    relatedModuleIds: ["sac-06"],
    escalation: false,
  },
  {
    id: "bot-aceptacion",
    intent: "Aceptación informada y firma",
    keywords: ["firma", "aceptacion", "consentimiento", "autoriza", "firmar", "digital", "tableta"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Presenta la ficha en pantalla: «Le invito a revisar los hallazgos que documentamos y el procedimiento acordado».\n• [A] Analizar el riesgo: La firma no exime de responsabilidad técnica ni autoriza la negligencia; su propósito es acreditar la información mutua previa.\n• [P] Protocolo SAC: Lee las confirmaciones verbales con el cliente (revisión conjunta, riesgos explicados, dudas resueltas) antes de habilitar el canvas de firma.\n• [A] Asegurar y Acordar: Recaba la firma digital del cliente, emite el número de recibo SAC y genera la constancia verificable para el expediente de taller.",
    relatedModuleIds: ["sac-05", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-negativa",
    intent: "Cliente no acepta firmar",
    keywords: ["no firma", "no acepta", "se niega", "rechaza", "negativa", "no quiere firmar"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Escucha con empatía y serenidad: «Comprendo perfectamente su posición y respetamos su decisión sobre su producto».\n• [A] Analizar el riesgo: Sin aceptación informada, cualquier manipulación que resulte en rotura o desajuste recae enteramente sobre la óptica.\n• [P] Protocolo SAC: Prohibido manipular o intervenir el armazón. Registra en la plataforma: «Recepción cancelada por desistimiento del cliente a firmar».\n• [A] Asegurar y Acordar: Devuelve el armazón intacto al cliente, documenta el cierre en el sistema y notifica al supervisor si hubo inconformidad.",
    relatedModuleIds: ["sac-05", "sac-07"],
    escalation: true,
  },
  {
    id: "bot-desacuerdo",
    intent: "Desacuerdo sobre el estado",
    keywords: ["desacuerdo", "reclamo", "inconforme", "discute", "no esta de acuerdo", "molesto", "enojado"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Escucha sin interrumpir ni ponerte a la defensiva: «Entiendo su sorpresa; permítame revisarlo junto a usted bajo esta lupa».\n• [A] Analizar el riesgo: El desacuerdo sobre el estado inicial no se resuelve con discusiones, sino con evidencia observable y fotografías previas.\n• [P] Protocolo SAC: Pausa la recepción; muestra serenamente la condición con luz directa y comprueba si existen antecedentes en el historial del cliente.\n• [A] Asegurar y Acordar: Si la diferencia persiste, no inicies el trabajo; solicita la presencia del optómetra o administrador y registra la observación en la ficha.",
    relatedModuleIds: ["sac-05", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-privacidad",
    intent: "Privacidad de la evidencia",
    keywords: ["privacidad", "datos", "rostro", "documento", "compartir", "whatsapp", "fotos personales"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Asegura la confidencialidad de la información y la protección de los datos personales del cliente.\n• [A] Analizar el riesgo: Capturar rostros o documentos personales en las fotos de inspección infringe las normativas de protección de datos.\n• [P] Protocolo SAC: Encuadra exclusivamente el armazón óptico sobre el tapete de trabajo; no utilices teléfonos personales ni compartas fotos por redes o chats externos.\n• [A] Asegurar y Acordar: Todas las evidencias se almacenan cifradas en el almacenamiento seguro de SAC (R2 con SHA-256) asociadas únicamente a la orden de trabajo.",
    relatedModuleIds: ["sac-06", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-correccion",
    intent: "Corrección de una ficha",
    keywords: ["corregir", "error", "editar", "enmienda", "equivocado", "cambiar datos"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Identifica oportunamente el error u omisión en los datos de la recepción con honestidad técnica.\n• [A] Analizar el riesgo: Alterar o sobrescribir un expediente ya firmado anula su validez legal y genera sospecha de manipulación de evidencia.\n• [P] Protocolo SAC: Si el expediente está en borrador, rectifica el dato y revalida con el cliente. Si ya fue cerrado, genera una enmienda formal fechada.\n• [A] Asegurar y Acordar: Conserva el documento original inalterado y adjunta la nota aclaratoria con motivo, hora y código del colaborador responsable.",
    relatedModuleIds: ["sac-07"],
    escalation: false,
  },
  {
    id: "bot-rotura",
    intent: "Cambio o rotura durante el proceso",
    keywords: ["se rompio", "rotura", "se separo", "pieza suelta", "durante el ajuste", "quebro en taller", "accidente"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Mantén la serenidad, contén la situación y actúa con total transparencia ante el cliente y el equipo.\n• [A] Analizar el riesgo: Determina si la rotura ocurrió en una zona con riesgo alto previamente advertido o si se trató de un incidente técnico imprevisto.\n• [P] Protocolo SAC: Detén de inmediato toda manipulación. Guarda todas las partes, tornillos y fragmentos en la bandeja de protección; no intentes pegar ni ocultar la rotura.\n• [A] Asegurar y Acordar: Toma fotos del estado actual, escala inmediatamente al supervisor de local con la ficha inicial y activa el protocolo de garantía autorizado.",
    relatedModuleIds: ["sac-08"],
    escalation: true,
  },
  {
    id: "bot-lenguaje",
    intent: "Lenguaje recomendado",
    keywords: ["que digo", "como explico", "frase", "lenguaje", "hablar", "comunicacion", "palabras"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Comunícate con calidez, respeto y tono consultivo, evitando tecnicismos incomprensibles o tonos alarmistas.\n• [A] Analizar el riesgo: Las palabras imprecisas como «esto se va a romper» generan pánico; frases como «no le pasará nada» crean falsas garantías.\n• [P] Protocolo SAC: Utiliza frases objetivas: «Se observa esta zona fatigada», «El procedimiento requiere calor controlado», «Vamos a validar con el especialista».\n• [A] Asegurar y Acordar: Verifica la comprensión del cliente preguntando: «¿Tiene alguna duda sobre el procedimiento?» antes de solicitar la firma.",
    relatedModuleIds: ["sac-01", "sac-05"],
    escalation: false,
  },
  {
    id: "bot-campos",
    intent: "Campos obligatorios",
    keywords: ["campos", "ficha", "datos obligatorios", "formulario", "registro", "que lleno"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Considera la ficha digital como el expediente técnico que protege la trazabilidad de la sucursal y del cliente.\n• [A] Analizar el riesgo: Omitir datos como la antigüedad, material o reparaciones previas distorsiona el cálculo automático del nivel de riesgo.\n• [P] Protocolo SAC: Completa obligatoriamente: orden de trabajo, tienda, asesor, datos de contacto del cliente, inspección de armazón/lunas, 4 fotos y checklist.\n• [A] Asegurar y Acordar: Revisa que el nivel de riesgo calculado concuerde con lo observado y valida el código de escalamiento si resulta Riesgo Alto.",
    relatedModuleIds: ["sac-07"],
    escalation: false,
  },
  {
    id: "bot-certificacion",
    intent: "Certificación final",
    keywords: ["certificado", "certificacion", "evaluacion final", "aprobar", "nota", "examen", "cuanto necesito"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: La certificación avala que dominas los protocolos operativos y de seguridad para la atención de clientes en la óptica.\n• [A] Analizar el riesgo: La evaluación integradora consta de 9 casos situacionales reales que evalúan criterio técnico, prevención y servicio.\n• [P] Protocolo SAC: Para aprobar requieres al menos 8 respuestas correctas de 9 (~89%), con retroalimentación inmediata en cada intento.\n• [A] Asegurar y Acordar: Al aprobar, desbloqueas tu constancia oficial con código único verificable (`SAC-[ID]-2026`) lista para imprimir o guardar en PDF.",
    relatedModuleIds: ["sac-01", "sac-08", "sac-luna-01", "sac-luna-08"],
    escalation: false,
  },
  {
    id: "bot-garantia-lunas",
    intent: "Garantía de lunas y criterios de cobertura",
    keywords: ["garantia de lunas", "garantia lunas", "cambio de lunas", "cubre la garantia", "falla de luna", "luna en garantia", "garantia de cristales"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Escucha atentamente el motivo de inconformidad del cliente y valida la fecha de entrega y comprobante de compra.\n• [A] Analizar el riesgo: Distingue el origen del problema: falla de laboratorio/tratamiento (craquelado, delaminación) frente a desgaste o daño por uso (abrasión, calor, químicos, caídas).\n• [P] Protocolo SAC: Realiza limpieza técnica, inspección con luz rasante y lensometría; captura las 4 fotos obligatorias y emite la orden de garantía formal.\n• [A] Asegurar y Acordar: Explica al cliente el plazo de evaluación técnica del laboratorio (24 a 48 h), entrega el comprobante con ticket y evita prometer desenlaces no autorizados.",
    relatedModuleIds: ["sac-luna-01", "sac-luna-02", "sac-luna-08"],
    escalation: false,
  },
  {
    id: "bot-craquelado-lunas",
    intent: "Craquelado de antirreflejo y defectos de capa",
    keywords: ["craquelado", "antirreflejo", "se pela", "descascarado", "capa suelta", "delaminacion", "mancha en la luna"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Explica al cliente que examinarás minuciosamente el tratamiento óptico con instrumental adecuado para evaluar su integridad.\n• [A] Analizar el riesgo: Observa con luz rasante y aumento: si presenta un entramado o red uniforme de microfisuras, corresponde a craquelado por tensión térmica o falla de adhesión de fábrica.\n• [P] Protocolo SAC: Limpia con spray neutro y paño suave, toma macrofotografía del patrón reticular y registra las lecturas en lensómetro.\n• [A] Asegurar y Acordar: Ingresa la orden de garantía por defecto de tratamiento al sistema SAC y adjunta el informe fotográfico para dictamen prioritario de laboratorio.",
    relatedModuleIds: ["sac-luna-02", "sac-luna-03", "sac-luna-06"],
    escalation: false,
  },
  {
    id: "bot-adaptacion-progresivos",
    intent: "Garantía de adaptación en multifocales y progresivos",
    keywords: ["progresivo", "multifocal", "desadaptacion", "no me acostumbro", "mareo progresivo", "veo borroso con progresivos", "garantia de adaptacion"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Recibe las dudas del paciente con empatía: la adaptación a multifocales requiere precisión técnica y acompañamiento profesional.\n• [A] Analizar el riesgo: Verifica que la consulta esté dentro del periodo de adaptación (30 a 60 días) y revisa si el armazón ha perdido ajuste, inclinación o alineación.\n• [P] Protocolo SAC: Con el armazón puesto en el paciente, corrobora centros ópticos, altura pupilar, ángulo pantoscópico y distancia al vértice; coteja potencias en lensómetro.\n• [A] Asegurar y Acordar: Si las alturas o graduación requieren reajuste, deriva a refracción de control con optometría o tramita el reemplazo por garantía de adaptación según política SAC.",
    relatedModuleIds: ["sac-luna-04", "sac-luna-05", "sac-luna-07"],
    escalation: false,
  },
  {
    id: "bot-juegos",
    intent: "Juegos y simuladores",
    keywords: ["juego", "simulador", "trivia", "laboratorio", "reto", "detective", "gamificacion", "monedas", "xp"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Los 6 simuladores interactivos permiten entrenar el criterio operativo en un entorno seguro y dinámico.\n• [A] Analizar el riesgo: Desarrolla reflejos para clasificar riesgos (Laboratorio), secuenciar pasos (Protocolo) y detectar fallas ocultas (Detective visual).\n• [P] Protocolo SAC: Completa los retos de Trivia Sprint, Conversaciones difíciles y Checklist contrarreloj para poner a prueba tu velocidad y empatía.\n• [A] Asegurar y Acordar: Cada reto guarda tus intentos en el servidor, sumando puntos de experiencia (XP) y monedas para el ranking general de la sucursal.",
    relatedModuleIds: ["sac-04", "sac-05", "sac-08"],
    escalation: false,
  },
  {
    id: "bot-garantia",
    intent: "Garantías sobre el resultado",
    keywords: ["garantia", "garantizar", "prometer", "seguro no pasa", "responsabilidad", "quedara bien"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Gestiona las expectativas del cliente con total honestidad desde el primer saludo en el mostrador.\n• [A] Analizar el riesgo: Ningún técnico u optómetra puede garantizar ausencia de daño en materiales usados sometidos a tensión o calor.\n• [P] Protocolo SAC: Nunca prometas que un armazón deformado o fatigado quedará «como nuevo»; explica que el servicio busca optimizar su uso con cuidado técnico.\n• [A] Asegurar y Acordar: Deja constancia en la ficha de que el cliente conoce los riesgos inherentes y acepta el procedimiento sin promesas absolutas.",
    relatedModuleIds: ["sac-01", "sac-05", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-materiales",
    intent: "Materiales del armazón",
    keywords: ["material", "acetato", "metal", "titanio", "tr90", "pasta", "poliamida", "aluminio", "montura al aire"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Identifica con certeza el material del armazón antes de seleccionar las pinzas o aplicar temperatura.\n• [A] Analizar el riesgo: Acetato (admite calor 60-70°C); Titanio (alta memoria, soldadura especial); TR-90/Grilamid (no calentar directamente); Al aire (tensión en lunas).\n• [P] Protocolo SAC: Utiliza pinzas con protecciones de teflón para no marcar metales pulidos y evita calor en polímeros que pierden memoria de forma.\n• [A] Asegurar y Acordar: Registra el material específico en la ficha de recepción e informa al cliente sobre la flexibilidad o rigidez natural de su montura.",
    relatedModuleIds: ["sac-02", "sac-03"],
    escalation: false,
  },
  {
    id: "bot-antiguedad",
    intent: "Antigüedad del armazón",
    keywords: ["antiguedad", "anos", "antiguo", "tiempo de uso", "viejo", "mas de 2 anos", "cuanto tiempo"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Indaga cordialmente con el cliente: «¿Hace cuántos años o meses adquirió este armazón?».\n• [A] Analizar el riesgo: En la norma SAC, armazones con más de 2 años de uso se catalogan como Riesgo Alto por pérdida de plastificantes y fatiga de metales.\n• [P] Protocolo SAC: Inspecciona con lupa señales de blanqueamiento por sudor en terminales y puente; manipula con suavidad extrema sin torsiones bruscas.\n• [A] Asegurar y Acordar: Informa al cliente que los años vuelven los materiales cristalinos o quebradizos, documenta la antigüedad y registra el escalamiento.",
    relatedModuleIds: ["sac-02", "sac-04", "sac-07"],
    escalation: true,
  },
  {
    id: "bot-tornillo-bisagra",
    intent: "Tornillos y bisagras flojas",
    keywords: ["tornillo", "bisagra", "patita floja", "varilla", "suelta", "tornillo barrido", "flex vencido"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Atiende la necesidad del cliente de ajustar una varilla o cambiar un tornillo con amabilidad y destreza.\n• [A] Analizar el riesgo: Evalúa si la bisagra solo requiere apriete, si la rosca interna está desgastada o si el sistema flex interno está quebrado.\n• [P] Protocolo SAC: Utiliza destornillador del calibre exacto con apoyo firme; si la rosca gira en falso no fuerces; aplica fijador óptico suave si es necesario.\n• [A] Asegurar y Acordar: Si el barril de la bisagra presenta fisura o el flex no tiene recuperación, clasifica como Riesgo Alto y notifica antes de intervenir.",
    relatedModuleIds: ["sac-02", "sac-03"],
    escalation: false,
  },
  {
    id: "bot-ayuda",
    intent: "Ayuda o situación no prevista",
    keywords: ["ayuda", "no se", "duda", "caso raro", "soporte", "que hago", "no entiendo", "emergencia"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Mantén la calma: ante cualquier duda o caso no contemplado en la rutina diaria, la seguridad del producto es prioridad.\n• [A] Analizar el riesgo: Improvisar o probar la resistencia a la fuerza ante situaciones desconocidas es la principal causa de roturas no aseguradas.\n• [P] Protocolo SAC: Pausa la recepción, coloca el armazón en la bandeja de inspección y no realices ningún procedimiento mecánico ni térmico.\n• [A] Asegurar y Acordar: Consulta inmediatamente al optómetra líder o supervisor de tienda y documenta la consulta en la plataforma SAC.",
    relatedModuleIds: ["sac-01", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-como-decir-no",
    intent: "Cómo decir NO al cliente de forma asertiva",
    keywords: ["decir no", "como decir no", "negar servicio", "no al cliente", "limites tecnicos", "asertividad", "rechazar pedido"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Escucha con atención la petición del cliente y valida su necesidad antes de apresurar cualquier respuesta.\n• [A] Analizar el riesgo: Identifica si la solicitud vulnera normas clínicas, físicas del material o tiempos mínimos de estabilización óptica.\n• [P] Protocolo SAC: Aplica la técnica sandwich: apertura empática, comunicación del límite técnico objetivo y presentación inmediata de 2 alternativas viables.\n• [A] Asegurar y Acordar: Brinda al cliente la libertad de elegir entre las opciones y deja constancia escrita en la ficha o acta de atención SAC.",
    relatedModuleIds: ["sac-no-01", "sac-no-02", "sac-no-07"],
    escalation: false,
  },
  {
    id: "bot-sandwich-empatia",
    intent: "Técnica sandwich para comunicar negativas",
    keywords: ["tecnica sandwich", "sandwich", "tres capas", "comunicar limite", "empatia y limite", "decir no suave"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Inicia reconociendo la situación: «Comprendo completamente su urgencia y lo valioso de su tiempo...».\n• [A] Analizar el riesgo: Analiza la inviabilidad técnica: forzar el proceso romperá el material o afectará la calidad de su visión.\n• [P] Protocolo SAC: Expresa el límite sin usar la palabra 'pero'; di «...y por seguridad de su armazón, no podemos aplicar calor en esta zona fatigada».\n• [A] Asegurar y Acordar: Cierra con la solución: «Lo que sí podemos hacer es proveerle una montura de cortesía o tramitar un trasvase seguro».",
    relatedModuleIds: ["sac-no-02", "sac-no-03", "sac-no-07"],
    escalation: false,
  },
  {
    id: "bot-cliente-hostil",
    intent: "Desescalamiento verbal ante clientes frustrados o agresivos",
    keywords: ["cliente enojado", "cliente furioso", "cliente hostil", "grita", "molesto", "reclamacion", "desescalar", "agresivo"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Guarda silencio receptivo durante los primeros 60 a 90 segundos; permite que el cliente desahogue su molestia sin interrupciones.\n• [A] Analizar el riesgo: Evalúa si la tensión es manejable en mostrador o si requiere trasladarse a un ambiente privado de asesoría para resguardar la calma.\n• [P] Protocolo SAC: Aplica reflejo inverso: modula tu voz a un volumen más bajo, habla pausado y jamás digas 'cálmese' o 'no grite'.\n• [A] Asegurar y Acordar: Ofrece alternativas de solución concretas o facilita con cortesía el libro de reclamaciones y la asistencia del supervisor.",
    relatedModuleIds: ["sac-no-06", "sac-no-07", "sac-no-08"],
    escalation: true,
  },
  {
    id: "bot-receta-vencida",
    intent: "Rechazo ético de recetas optométricas vencidas",
    keywords: ["receta vencida", "receta antigua", "hacer con receta vieja", "receta caducada", "graduacion antigua", "sin examen"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Explica con empatía que comprendes su deseo de avanzar con su fórmula anterior, pero tu prioridad es su salud visual.\n• [A] Analizar el riesgo: Prescripciones con más de 12 meses provocan fatiga ocular, cefaleas o inadaptación al haber cambiado la refracción del ojo.\n• [P] Protocolo SAC: Rehúsa respetuosamente fabricar con fórmula caducada y verifica en lensómetro los lentes actuales para comparar parámetros.\n• [A] Asegurar y Acordar: Canaliza de inmediato al paciente a gabinete para una refracción optométrica actualizada y confirma su nueva fórmula con total precisión.",
    relatedModuleIds: ["sac-no-04", "sac-luna-04", "sac-01"],
    escalation: false,
  },
  {
    id: "bot-alternativas-viables",
    intent: "Regla de oro: dos alternativas viables ante cada NO",
    keywords: ["alternativas viables", "regla de oro", "dar opciones", "menu de alternativas", "que ofrecer ante un no", "opciones al cliente"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Detecta la necesidad real detrás del reclamo del cliente (urgencia, estética, presupuesto o funcionalidad).\n• [A] Analizar el riesgo: Evita dejar al cliente en un callejón sin salida; un NO sin opciones destruye la relación comercial y la confianza.\n• [P] Protocolo SAC: Presenta la bandeja de dos opciones: Opción 1 inmediata/conservadora (trasvase o reparación con deslinde) y Opción 2 óptima (plan renueva con descuento).\n• [A] Asegurar y Acordar: Guía al usuario en la comparativa de costos y beneficios, respetando su autonomía y cerrando el acuerdo con total conformidad.",
    relatedModuleIds: ["sac-no-07", "sac-no-08", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-deslinde-riesgo",
    intent: "Acta de deslinde técnico informado y consentimiento",
    keywords: ["deslinde", "acta de deslinde", "responsabilidad del cliente", "firma de riesgo", "advertencia tecnica", "bajo su riesgo"],
    response: "SAC indica:\n• [C] Conectar / Clarificar: Muestra al cliente los hallazgos de fragilidad bajo lupa o cámara macro antes de cualquier intervención mecánica o térmica.\n• [A] Analizar el riesgo: Toda manipulación en materiales con fatiga estructural o reparaciones previas conlleva riesgo inminente de fractura.\n• [P] Protocolo SAC: Redacta la ficha de advertencia técnica detallando el estado inicial y la posible consecuencia; lee los puntos con el cliente con total transparencia.\n• [A] Asegurar y Acordar: Obtén la firma de consentimiento informado en el acta SAC, adjunta las fotos al ticket digital y entrega copia formal al usuario.",
    relatedModuleIds: ["sac-no-03", "sac-no-08", "sac-08"],
    escalation: true,
  },
];

export type CapaStep = {
  letter: "C" | "A" | "P" | "A2";
  badge: string;
  title: string;
  text: string;
};

export type ParsedCapa = {
  intro: string;
  steps: CapaStep[];
  isCapa: boolean;
};

export function parseCapa(text: string): ParsedCapa {
  const introMatch = text.match(/^([\s\S]*?)(?=•\s*\[[CAP]\])/);
  const intro = (introMatch ? introMatch[1] : text.startsWith("SAC indica:") ? "SAC indica:" : "").trim();

  const stepRegex = /•\s*\[([CAP])\]\s*([^:]+):\s*([\s\S]*?)(?=(?:•\s*\[[CAP]\]|$))/g;
  const steps: CapaStep[] = [];
  let match: RegExpExecArray | null;
  let hasA1 = false;

  while ((match = stepRegex.exec(text)) !== null) {
    const rawLetter = match[1] as "C" | "A" | "P";
    const title = match[2].trim();
    const content = match[3].trim();
    let letter: "C" | "A" | "P" | "A2" = rawLetter;
    let badge: string = rawLetter;
    if (rawLetter === "A") {
      if (!hasA1) {
        hasA1 = true;
        badge = "A · Analizar";
      } else {
        letter = "A2";
        badge = "A · Asegurar";
      }
    } else if (rawLetter === "C") {
      badge = "C · Conectar";
    } else if (rawLetter === "P") {
      badge = "P · Protocolo";
    }
    steps.push({
      letter,
      badge,
      title,
      text: content,
    });
  }

  return {
    intro,
    steps,
    isCapa: steps.length >= 3,
  };
}

export function normalizeSpanish(text: string): string {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stemWord(word: string): string {
  if (word.length <= 3) return word;
  return word
    .replace(/(?:ando|iendo|aron|eron|aria|arian|aremos|eremos|aron|aban|iendo)$/, "")
    .replace(/(?:cion|siones|mente|dades|idad|miento|mientos|dor|dores|dora)$/, "")
    .replace(/(?:ados|adas|idos|idas|ado|ada|ido|ida)$/, "")
    .replace(/(?:es|as|os|is)$/, "")
    .replace(/(?:a|e|o)$/, "");
}

export function querySaciBrain(rawQuery: string): {
  response: string;
  item?: BotKnowledgeItem;
  confidence: number;
  relatedModuleIds: string[];
} {
  const query = rawQuery.trim();
  if (!query) {
    return {
      response: "SAC indica:\n• [C] Conectar / Clarificar: Cuéntame qué caso u observación tienes en el mostrador o taller.\n• [A] Analizar el riesgo: Describe el material, la antigüedad y el estado visible para determinar el nivel de riesgo.\n• [P] Protocolo SAC: Aplicaremos el paso a paso adecuado: inspección, serie fotográfica y técnica aprobada.\n• [A] Asegurar y Acordar: Te guiaré para obtener la aceptación del cliente o escalar con trazabilidad.",
      confidence: 0,
      relatedModuleIds: ["sac-01"],
    };
  }

  const normalized = normalizeSpanish(query);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);
  const stems = words.map(stemWord);

  // Critical risk intent overrides
  const isCrackOrFracture = /fisur|grieta|triz|rajad|quebrad|partid|fractur/.test(normalized);
  const isHeatMentioned = /calor|calient|temperatura|secador|pistola|arena/.test(normalized);
  const isOldMentioned = /ano|tiempo|antigu|viejo|mas de 2/.test(normalized);

  // Cross-topic synthesis: Heat on a crack or broken frame
  if (isCrackOrFracture && isHeatMentioned) {
    return {
      response: "SAC indica:\n• [C] Conectar / Clarificar: Advierto que consultas sobre aplicar calor en un armazón con fisura, grieta o daño estructural previo.\n• [A] Analizar el riesgo: Clasificación Riesgo Alto crítico: el calor debilita la resistencia del polímero y la tensión térmica provocará la fractura inmediata del componente.\n• [P] Protocolo SAC: ¡Prohibido aplicar calor! Pausa de inmediato la manipulación, coloca el armazón en la bandeja de protección y captura 1 foto general y 1 macro de la fisura.\n• [A] Asegurar y Acordar: Informa al cliente con transparencia que la pieza no admite ajuste térmico por riesgo de rotura inminente y escala antes de continuar con la supervisión técnica.",
      confidence: 0.98,
      relatedModuleIds: ["sac-03", "sac-04", "sac-08"],
    };
  }

  // Cross-topic synthesis: Old frame (>2 years) with heat or adjustment
  if (isOldMentioned && (isHeatMentioned || /ajust|doblar|enderez/.test(normalized))) {
    return {
      response: "SAC indica:\n• [C] Conectar / Clarificar: Identificas un armazón con más de dos años de uso que requiere manipulación o ajuste de asentamiento.\n• [A] Analizar el riesgo: Clasificación Riesgo Alto: los plastificantes del acetato se han evaporado y el material se torna cristalino; los metales presentan fatiga por sudor.\n• [P] Protocolo SAC: Realiza una inspección bajo lupa antes de manipular; si usas calor, hazlo a baja temperatura de forma muy progresiva sin forzar las bisagras.\n• [A] Asegurar y Acordar: Informa al cliente que los años de uso aumentan la fragilidad, documenta la antigüedad en la ficha y escala antes de continuar si notas resequedad extrema.",
      confidence: 0.95,
      relatedModuleIds: ["sac-02", "sac-03", "sac-04"],
    };
  }

  // Standard multi-factor ranking
  const scored = botKnowledge.map((item) => {
    let score = 0;
    const itemNormIntent = normalizeSpanish(item.intent);
    const itemNormKeywords = item.keywords.map(normalizeSpanish);
    const itemKeywordsStems = itemNormKeywords.flatMap((kw) => kw.split(/\s+/)).map(stemWord);

    // Exact keyword or intent match
    if (normalized.includes(itemNormIntent)) score += 15;
    for (const kw of itemNormKeywords) {
      if (normalized.includes(kw)) score += 10;
    }

    // Stem matches
    for (const stem of stems) {
      if (itemKeywordsStems.includes(stem)) score += 4;
      if (itemNormIntent.includes(stem)) score += 3;
    }

    // Risk boost
    if (isCrackOrFracture && item.escalation) score += 6;

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (best && best.score >= 6) {
    return {
      response: best.item.response,
      item: best.item,
      confidence: Math.min(0.99, best.score / 25),
      relatedModuleIds: best.item.relatedModuleIds,
    };
  }

  // Smart Contextual CAPA Fallback for unindexed edge cases
  const fallback = [
    "SAC indica:",
    `• [C] Conectar / Clarificar: Comprendo tu consulta técnica sobre «${query.slice(0, 70)}». Escucha y clarifica siempre el estado con el cliente sin asumir garantías previas.`,
    "• [A] Analizar el riesgo: Examina con lupa el material, las uniones y la antigüedad. Si hay fisuras, soldaduras o resequedad es Riesgo Alto; si solo es desgaste superficial es Riesgo Medio o Bajo.",
    "• [P] Protocolo SAC: 1. No apliques fuerza excesiva ni calor sobre zonas dudosas. 2. Toma la serie de 4 fotos (frontal, laterales y detalle). 3. Consulta la técnica aprobada para ese material.",
    "• [A] Asegurar y Acordar: Explica los hallazgos con transparencia, registra todo en la ficha digital y escala antes de continuar si surge cualquier incertidumbre estructural.",
  ].join("\n");

  return {
    response: fallback,
    confidence: 0.45,
    relatedModuleIds: ["sac-01", "sac-04", "sac-08"],
  };
}

