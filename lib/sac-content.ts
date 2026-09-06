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

export const CONTENT_VERSION = "SAC-2026.09.05-v1" as const;

const media = {
  reception: {
    video: "/media/microclase-recepcion-segura.mp4",
    captions: "/media/microclase-recepcion-segura.vtt",
    poster: "/media/sac-hero-recepcion.png",
  },
  risks: {
    video: "/media/microclase-detectar-riesgos.mp4",
    captions: "/media/microclase-detectar-riesgos.vtt",
    poster: "/media/sac-inspeccion-fisura.png",
  },
  conversation: {
    video: "/media/microclase-conversacion-cliente.mp4",
    captions: "/media/microclase-conversacion-cliente.vtt",
    poster: "/media/sac-conversacion-cliente.png",
  },
} as const;

export const sacModules: SacModule[] = [
  {
    id: "sac-01",
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
    ...media.reception,
  },
  {
    id: "sac-02",
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
    ...media.risks,
  },
  {
    id: "sac-03",
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
    ...media.risks,
  },
  {
    id: "sac-04",
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
    ...media.risks,
  },
  {
    id: "sac-05",
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
    ...media.conversation,
  },
  {
    id: "sac-06",
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
    ...media.risks,
  },
  {
    id: "sac-07",
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
    ...media.reception,
  },
  {
    id: "sac-08",
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
    ...media.risks,
  },
];

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
];

/** Ocho preguntas estables, una por módulo, usadas por la certificación. */
export const certificationQuestionIds = [
  "sac-q-003",
  "sac-q-009",
  "sac-q-015",
  "sac-q-021",
  "sac-q-027",
  "sac-q-033",
  "sac-q-039",
  "sac-q-045",
] as const;

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
    keywords: ["secuencia", "pasos", "como empiezo", "iniciar", "recepcion"],
    response: "SAC indica: confirme el servicio, inspeccione junto con el cliente, clasifique el riesgo, explique, registre evidencia, valide si corresponde y solo entonces solicite la aceptación.",
    relatedModuleIds: ["sac-01", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-inspeccion",
    intent: "Componentes de inspección",
    keywords: ["inspeccionar", "revisar", "componentes", "armazon", "bisagra"],
    response: "SAC indica: revise aro, puente, bisagras, tornillos, varillas, terminales, plaquetas, puntos de anclaje y la condición de las lunas, sin forzar ninguna pieza.",
    relatedModuleIds: ["sac-02"],
    escalation: false,
  },
  {
    id: "bot-bajo",
    intent: "Riesgo bajo",
    keywords: ["riesgo bajo", "bajo", "estable", "sin novedades"],
    response: "SAC indica: un riesgo bajo conserva todos los controles. Revise, explique, fotografíe cuando corresponda, registre y confirme comprensión antes de continuar.",
    relatedModuleIds: ["sac-04"],
    escalation: false,
  },
  {
    id: "bot-medio",
    intent: "Riesgo medio",
    keywords: ["riesgo medio", "medio", "holgura", "desgaste", "deformacion"],
    response: "SAC indica: documente con detalle el desgaste o la inestabilidad, aplique precaución adicional y siga la validación operativa definida para el caso.",
    relatedModuleIds: ["sac-04"],
    escalation: false,
  },
  {
    id: "bot-alto",
    intent: "Riesgo alto",
    keywords: ["riesgo alto", "alto", "critico", "pausar", "detener"],
    response: "SAC indica: detenga la manipulación, proteja el producto, reúna evidencia y obtenga una validación autorizada y trazable antes de continuar.",
    relatedModuleIds: ["sac-04", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-fisura",
    intent: "Fisura o microfisura",
    keywords: ["fisura", "microfisura", "grieta", "rajado", "linea"],
    response: "SAC indica: no pruebe la resistencia de una fisura mediante manipulación. Muéstrela, fotografíela con contexto y detalle, clasifique el caso como alto y escale.",
    relatedModuleIds: ["sac-02", "sac-04", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-calor",
    intent: "Uso de calor",
    keywords: ["calor", "calentar", "temperatura", "acetato", "ajuste"],
    response: "SAC indica: use calor solo si la técnica aprobada, el material y el estado lo permiten; aplíquelo de forma gradual y deténgase ante cualquier reacción inesperada.",
    relatedModuleIds: ["sac-03"],
    escalation: false,
  },
  {
    id: "bot-reparacion",
    intent: "Reparación previa",
    keywords: ["reparacion", "soldadura", "adhesivo", "pegamento", "arreglado"],
    response: "SAC indica: trate una soldadura o adhesivo en zona de carga como antecedente estructural, regístrelo y valide el procedimiento antes de aplicar fuerza o calor.",
    relatedModuleIds: ["sac-02", "sac-04"],
    escalation: true,
  },
  {
    id: "bot-fotos",
    intent: "Fotografías necesarias",
    keywords: ["foto", "fotografia", "evidencia", "imagen", "camara"],
    response: "SAC indica: capture vistas frontal, lateral derecha y lateral izquierda, más un detalle nítido de cada novedad, y relacione cada archivo con la recepción.",
    relatedModuleIds: ["sac-06"],
    escalation: false,
  },
  {
    id: "bot-foto-borrosa",
    intent: "Fotografía borrosa",
    keywords: ["borrosa", "desenfocada", "oscura", "reflejo", "repetir foto"],
    response: "SAC indica: repita la imagen antes de cerrar. Use fondo limpio, luz uniforme, enfoque nítido y una vista de contexto que permita ubicar el detalle.",
    relatedModuleIds: ["sac-06"],
    escalation: false,
  },
  {
    id: "bot-aceptacion",
    intent: "Aceptación informada",
    keywords: ["firma", "aceptacion", "consentimiento", "autoriza", "firmar"],
    response: "SAC indica: muestre el texto exacto, resuelva preguntas y compruebe comprensión antes de solicitar la aceptación. La firma no reemplaza los controles técnicos.",
    relatedModuleIds: ["sac-05", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-negativa",
    intent: "Cliente no acepta",
    keywords: ["no firma", "no acepta", "se niega", "rechaza", "negativa"],
    response: "SAC indica: respete la decisión, no ejerza presión, registre la negativa y cierre o escale el caso sin realizar una intervención no autorizada.",
    relatedModuleIds: ["sac-05", "sac-07"],
    escalation: true,
  },
  {
    id: "bot-desacuerdo",
    intent: "Desacuerdo sobre el estado",
    keywords: ["desacuerdo", "reclamo", "inconforme", "discute", "no esta de acuerdo"],
    response: "SAC indica: escuche, revise la evidencia junto con el cliente y pause la recepción si la diferencia persiste; no altere ni elimine el historial.",
    relatedModuleIds: ["sac-05", "sac-08"],
    escalation: true,
  },
  {
    id: "bot-privacidad",
    intent: "Privacidad de la evidencia",
    keywords: ["privacidad", "datos", "rostro", "documento", "compartir"],
    response: "SAC indica: capture solo la información necesaria del producto y guárdela en el sistema autorizado; no use cuentas, chats ni dispositivos personales como archivo.",
    relatedModuleIds: ["sac-06", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-correccion",
    intent: "Corrección de una ficha",
    keywords: ["corregir", "error", "editar", "enmienda", "equivocado"],
    response: "SAC indica: antes del cierre, corrija y vuelva a mostrar el dato. Después del cierre, conserve el original y agregue una enmienda con motivo, fecha y responsable.",
    relatedModuleIds: ["sac-07"],
    escalation: false,
  },
  {
    id: "bot-rotura",
    intent: "Cambio o rotura durante el proceso",
    keywords: ["se rompio", "rotura", "se separo", "pieza suelta", "durante el ajuste"],
    response: "SAC indica: deténgase, proteja el producto, conserve todas las piezas, documente el estado y la secuencia, informe al cliente y escale de inmediato.",
    relatedModuleIds: ["sac-08"],
    escalation: true,
  },
  {
    id: "bot-lenguaje",
    intent: "Lenguaje recomendado",
    keywords: ["que digo", "como explico", "frase", "lenguaje", "hablar"],
    response: "SAC indica: describa hechos con «se observa», «puede requerir» y «vamos a validar». Evite culpas, dramatizaciones y garantías absolutas.",
    relatedModuleIds: ["sac-01", "sac-05"],
    escalation: false,
  },
  {
    id: "bot-campos",
    intent: "Campos obligatorios",
    keywords: ["campos", "ficha", "datos obligatorios", "formulario", "registro"],
    response: "SAC indica: registre identificador, responsables, servicio, producto, hallazgos, riesgo, evidencias, validación cuando aplique y confirmación del cliente.",
    relatedModuleIds: ["sac-07"],
    escalation: false,
  },
  {
    id: "bot-certificacion",
    intent: "Certificación final",
    keywords: ["certificado", "certificacion", "evaluacion final", "aprobar", "nota"],
    response: "SAC indica: la certificación evalúa los ocho módulos y se aprueba con al menos siete respuestas correctas de ocho.",
    relatedModuleIds: ["sac-01", "sac-08"],
    escalation: false,
  },
  {
    id: "bot-juegos",
    intent: "Juegos y simuladores",
    keywords: ["juego", "simulador", "trivia", "laboratorio", "reto"],
    response: "SAC indica: practique clasificación, secuencia, hallazgos visuales, conversación y checklist. Cada resultado se valida en el servidor y queda asociado a su avance.",
    relatedModuleIds: ["sac-04", "sac-05", "sac-08"],
    escalation: false,
  },
  {
    id: "bot-garantia",
    intent: "Garantías sobre el resultado",
    keywords: ["garantia", "garantizar", "prometer", "seguro no pasa", "responsabilidad"],
    response: "SAC indica: no prometa resultados absolutos ni use la aceptación para trasladar responsabilidades; explique el estado, el procedimiento y los controles aplicables.",
    relatedModuleIds: ["sac-01", "sac-05", "sac-07"],
    escalation: false,
  },
  {
    id: "bot-ayuda",
    intent: "Ayuda o situación no prevista",
    keywords: ["ayuda", "no se", "duda", "caso raro", "soporte"],
    response: "SAC indica: si una condición no está clara, no improvise ni manipule para probarla. Pause, documente y consulte a la persona autorizada de su local.",
    relatedModuleIds: ["sac-01", "sac-08"],
    escalation: true,
  },
];
