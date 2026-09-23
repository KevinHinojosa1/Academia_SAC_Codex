import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true, hmr: false, ws: false },
});

after(async () => vite.close());

test("publishes a complete and coherent SAC curriculum", async () => {
  const content = await vite.ssrLoadModule("/lib/sac-content.ts");
  assert.equal(content.sacModules.length, 24);
  assert.equal(content.questionBank.length, 144);
  assert.equal(content.finalQuizQuestions.length, 8);
  assert.equal(content.lunasQuizQuestions.length, 8);
  assert.equal(content.decirNoQuizQuestions.length, 8);
  assert.equal(content.trainingCapsules.length, 3);
  assert.equal(content.triviaQuestions.length, 10);
  assert.equal(content.riskCases.length, 9);
  assert.equal(content.conversationCases.length, 4);
  assert.equal(content.protocolOrder.length, 8);
  assert.equal(content.visualFindings.length, 6);
  assert.equal(content.checklistChallenge.filter((item) => item.required).length, 8);
  assert.equal(Object.keys(content.trainingExamples).length, 24);
  assert.ok(Object.values(content.trainingExamples).every((examples) => examples.length === 3));
  assert.equal(content.MODULE_EXPERIENCE_TOKENS.length, 3);
  assert.ok(content.botKnowledge.length >= 24);
  assert.ok(content.botKnowledge.every((item) => item.response.startsWith("SAC indica:")));
  assert.ok(content.botKnowledge.every((item) => {
    const parsed = content.parseCapa(item.response);
    return parsed.isCapa && parsed.steps.length === 4;
  }));
  const smartReply = content.querySaciBrain("veo una fisura en el aro y el cliente quiere calor");
  assert.match(smartReply.response, /Prohibido aplicar calor/i);
  assert.match(smartReply.response, /Riesgo Alto/i);
  assert.ok(content.parseCapa(smartReply.response).isCapa);

  const warrantyReply = content.querySaciBrain("el cliente reclama por garantía de lunas craqueladas");
  assert.match(warrantyReply.response, /craquelado|garantía|luz rasante/i);
  assert.ok(content.parseCapa(warrantyReply.response).isCapa);

  const decirNoReply = content.querySaciBrain("cómo le digo no al cliente cuando la montura está rota");
  assert.match(decirNoReply.response, /sandwich|límite|alternativa/i);
  assert.ok(content.parseCapa(decirNoReply.response).isCapa);

  const escalationAnswer = content.botKnowledge.find((item) => item.id === "bot-escalamiento");
  assert.ok(escalationAnswer?.keywords.includes("escalar"));
  assert.match(escalationAnswer.response, /escala antes de continuar/i);
  for (const learningModule of content.sacModules) {
    assert.equal(
      content.questionBank.filter((question) => question.moduleId === learningModule.id).length,
      6,
    );
  }
});

test("scores every activity on the server and enforces real pass thresholds", async () => {
  const content = await vite.ssrLoadModule("/lib/sac-content.ts");
  const { evaluateActivity } = await vite.ssrLoadModule("/lib/server/training.ts");
  const key = (activityId) => `${activityId}:test-key`;
  const evaluate = (activityId, answers) => evaluateActivity({ activityId, answers, idempotencyKey: key(activityId) });

  assert.equal(evaluate("module-1", [...content.MODULE_EXPERIENCE_TOKENS]).passed, true);
  assert.equal(evaluate("module-1", ["demo:seen", "examples:explored", "practice:incomplete"]).passed, false);
  assert.throws(() => evaluate("module-1", []), /demostración/i);

  const finalAnswers = content.finalQuizQuestions.map((q) => q.answer);
  assert.equal(evaluate("quiz-final", finalAnswers).score, 8);
  const twoWrong = [...finalAnswers];
  twoWrong[0] = (twoWrong[0] + 1) % 4;
  twoWrong[1] = (twoWrong[1] + 1) % 4;
  assert.equal(evaluate("quiz-final", twoWrong).passed, false);

  const lunasAnswers = content.lunasQuizQuestions.map((q) => q.answer);
  assert.equal(evaluate("quiz-lunas", lunasAnswers).score, 8);
  const twoWrongLunas = [...lunasAnswers];
  twoWrongLunas[0] = (twoWrongLunas[0] + 1) % 4;
  twoWrongLunas[1] = (twoWrongLunas[1] + 1) % 4;
  assert.equal(evaluate("quiz-lunas", twoWrongLunas).passed, false);

  const decirNoAnswers = content.decirNoQuizQuestions.map((q) => q.answer);
  assert.equal(evaluate("quiz-decir-no", decirNoAnswers).score, 8);
  const twoWrongNo = [...decirNoAnswers];
  twoWrongNo[0] = (twoWrongNo[0] + 1) % 4;
  twoWrongNo[1] = (twoWrongNo[1] + 1) % 4;
  assert.equal(evaluate("quiz-decir-no", twoWrongNo).passed, false);

  assert.equal(evaluate("risk-lab", content.riskCases.map((item) => item.answer)).score, 9);
  assert.equal(evaluate("trivia-sprint", content.triviaQuestions.map((item) => item.answer)).score, 10);
  assert.equal(evaluate("protocol-order", content.protocolOrder.map((item) => item.id)).score, 8);
  assert.equal(evaluate("visual-findings", content.visualFindings.map((item) => item.id)).score, 6);
  assert.equal(evaluate("conversation-sim", content.conversationCases.map((item) => item.answer)).score, 4);
  assert.equal(evaluate("checklist-timed", content.checklistChallenge.filter((item) => item.required).map((item) => item.id)).passed, true);
});

test("ships playable videos, captions and downloadable operating files", async () => {
  const legacyNames = [
    "microclase-recepcion-segura",
    "microclase-detectar-riesgos",
    "microclase-conversacion-cliente",
  ];
  for (const name of legacyNames) {
    const video = await stat(path.join(root, "public", "media", `${name}.mp4`));
    assert.ok(video.size > 1_000_000);
    const captions = await readFile(path.join(root, "public", "media", `${name}.vtt`), "utf8");
    assert.match(captions, /^WEBVTT/);
  }

  for (let i = 1; i <= 8; i++) {
    const stem = `sac-modulo-${String(i).padStart(2, "0")}`;
    const video = await stat(path.join(root, "public", "media", `${stem}.mp4`));
    assert.ok(video.size > 1_000_000, `${stem}.mp4 must be greater than 1MB`);
    const captions = await readFile(path.join(root, "public", "media", `${stem}.vtt`), "utf8");
    assert.match(captions, /^WEBVTT/, `${stem}.vtt must be valid WebVTT`);
    const poster = await stat(path.join(root, "public", "media", `${stem}.png`));
    assert.ok(poster.size > 500_000, `${stem}.png must be greater than 500KB`);
  }

  for (let i = 1; i <= 8; i++) {
    const stem = `sac-luna-${String(i).padStart(2, "0")}`;
    const video = await stat(path.join(root, "public", "media", `${stem}.mp4`));
    assert.ok(video.size > 1_000_000, `${stem}.mp4 must be greater than 1MB`);
    const captions = await readFile(path.join(root, "public", "media", `${stem}.vtt`), "utf8");
    assert.match(captions, /^WEBVTT/, `${stem}.vtt must be valid WebVTT`);
    const poster = await stat(path.join(root, "public", "media", `${stem}.png`));
    assert.ok(poster.size > 500_000, `${stem}.png must be greater than 500KB`);
  }

  for (let i = 1; i <= 8; i++) {
    const stem = `sac-no-${String(i).padStart(2, "0")}`;
    const video = await stat(path.join(root, "public", "media", `${stem}.mp4`));
    assert.ok(video.size > 1_000_000, `${stem}.mp4 must be greater than 1MB`);
    const captions = await readFile(path.join(root, "public", "media", `${stem}.vtt`), "utf8");
    assert.match(captions, /^WEBVTT/, `${stem}.vtt must be valid WebVTT`);
    const poster = await stat(path.join(root, "public", "media", `${stem}.png`));
    assert.ok(poster.size > 500_000, `${stem}.png must be greater than 500KB`);
  }

  assert.ok((await stat(path.join(root, "public", "resources", "registro-sac.xlsx"))).size > 100_000);
  assert.ok((await stat(path.join(root, "public", "resources", "formato-recepcion-sac.pdf"))).size > 5_000);
  assert.ok((await stat(path.join(root, "public", "media", "saci-mascota.png"))).size > 2_000_000);
  assert.ok((await stat(path.join(root, "public", "media", "sac-casos-inspeccion.png"))).size > 1_000_000);
});

test("uses SAC consistently and keeps the informed-consent text aligned", async () => {
  const files = [
    "app/layout.tsx",
    "app/sac-platform.tsx",
    "app/components/reception-workflow.tsx",
    "app/components/training-experience.tsx",
  ];
  const source = (await Promise.all(files.map((file) => readFile(path.join(root, file), "utf8")))).join("\n");
  assert.doesNotMatch(source, /Academia SAC/i);
  assert.match(source, /no sustituye las validaciones internas ni determina por sí solo la responsabilidad de las partes/);

  const mascotSource = (
    await Promise.all(
      ["app/sac-platform.tsx", "app/components/sac-coach.tsx", "app/components/saci-avatar.tsx"].map(
        (file) => readFile(path.join(root, file), "utf8"),
      ),
    )
  ).join("\n");
  assert.match(mascotSource, /SACI, mascota del Área de SAC/);
  assert.match(mascotSource, /Coach de Servicio al Cliente/);
  assert.match(mascotSource, /\/media\/saci-mascota\.png/);

  const trainingSource = await readFile(path.join(root, "app/components/training-experience.tsx"), "utf8");
  assert.doesNotMatch(trainingSource, /MINIEVALUACIÓN · 5\/6/);
  assert.doesNotMatch(trainingSource, /questionBank/);
  assert.match(trainingSource, /Aquí no hay preguntas/);
  assert.match(trainingSource, /Explorar ejemplos/);
  assert.match(trainingSource, /Práctica guiada/i);
});

test("keeps PIN hashing within the Cloudflare Workers PBKDF2 limit", async () => {
  const { hashPin, verifyPin } = await vite.ssrLoadModule("/lib/server/crypto.ts");
  const encoded = await hashPin("2468");
  const [, iterations] = encoded.split("$");

  assert.equal(Number(iterations), 100_000);
  assert.equal(await verifyPin("2468", encoded), true);
  assert.equal(await verifyPin("0000", encoded), false);

  const repairMigration = await readFile(
    path.join(root, "drizzle", "0002_cloudflare_compatible_pin_hashes.sql"),
    "utf8",
  );
  assert.doesNotMatch(repairMigration, /pbkdf2_sha256\$210000/);
  assert.equal((repairMigration.match(/pbkdf2_sha256\$100000/g) ?? []).length, 3);
});

test("evaluates SACI interactive voice coach, roleplay scenarios and spoken text cleaner", async () => {
  const { ROLEPLAY_SCENARIOS, evaluateStudentResponse, cleanTextForSpeech } =
    await vite.ssrLoadModule("/lib/sac-coach-engine.ts");

  assert.equal(ROLEPLAY_SCENARIOS.length, 5);

  // Test Speech cleaner
  const sampleCapa = "SAC indica:\n• [C] Conectar / Clarificar: Hola.\n• [A] Analizar el riesgo: Cuidado.\n• [P] Protocolo SAC: Prohibido calor.\n• [A] Asegurar y Acordar: Acordamos.";
  const spoken = cleanTextForSpeech(sampleCapa);
  assert.match(spoken, /Paso 1, Conectar: Hola/);
  assert.match(spoken, /Paso 2, Analizar el riesgo: Cuidado/);
  assert.match(spoken, /Paso 3, Protocolo SAC: Prohibido calor/);
  assert.match(spoken, /Paso 4, Asegurar y Acordar: Acordamos/);
  assert.doesNotMatch(spoken, /•|\[C\]/);

  // Test Roleplay 1: Heat on cracked frame
  const sc1 = ROLEPLAY_SCENARIOS.find((s) => s.id === "rp-calor-fisura");
  assert.ok(sc1);

  // Excellent student answer with CAPA
  const goodAnswer =
    "Comprendo perfectamente su prisa y la importancia de su reunión, don Carlos. Sin embargo, al tener una fisura en el acetato, si aplicamos calor la temperatura provocará la fractura inmediata del armazón. Para cuidarlo y darle solución inmediata, le ofrezco dos alternativas: un ajuste suave en frío de plaquetas para hoy o evaluar opciones de cambio de montura. ¿Le parece si procedemos con el ajuste en frío para su reunión?";
  const goodEval = evaluateStudentResponse(goodAnswer, sc1, "Kevin Hinojosa");
  assert.ok(goodEval.score >= 85, `Score should be >= 85, got ${goodEval.score}`);
  assert.equal(goodEval.medal, "Oro");
  assert.equal(goodEval.capaBreakdown.conectar.passed, true);
  assert.equal(goodEval.capaBreakdown.analizar.passed, true);
  assert.equal(goodEval.capaBreakdown.protocolo.passed, true);
  assert.equal(goodEval.capaBreakdown.asegurar.passed, true);
  assert.match(goodEval.coachComment, /Kevin/);

  // Blaming answer with forbidden phrase
  const badAnswer = "Usted lo rompió y no es mi problema, no se puede y punto.";
  const badEval = evaluateStudentResponse(badAnswer, sc1, "Kevin");
  assert.ok(badEval.score <= 40, `Blaming answer score should be <= 40, got ${badEval.score}`);
  assert.ok(badEval.prohibitedUsed.length > 0);
});

