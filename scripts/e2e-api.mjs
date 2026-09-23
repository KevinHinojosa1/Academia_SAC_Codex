import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  checklistChallenge,
  conversationCases,
  finalQuizQuestions,
  MODULE_EXPERIENCE_TOKENS,
  protocolOrder,
  riskCases,
  sacModules,
  triviaQuestions,
  visualFindings,
} from "../lib/sac-content.ts";

const base = process.argv[2] ?? "http://127.0.0.1:8791";
const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function json(path, { cookie, expected = 200, ...init } = {}) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      origin: base,
      ...(cookie ? { cookie } : {}),
      ...(!(init.body instanceof FormData) ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const raw = await response.text();
  let body = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { raw }; }
  assert.equal(response.status, expected, `${path}: ${JSON.stringify(body)}`);
  return { body, response };
}

async function login(employeeCode, pin) {
  const { body, response } = await json("/api/session", {
    method: "POST",
    body: JSON.stringify({ employeeCode, pin }),
    expected: 200,
  });
  assert.equal(body.authenticated, true);
  const cookie = response.headers.get("set-cookie")?.split(";", 1)[0];
  assert.ok(cookie?.startsWith("sac_session="));
  return { cookie, user: body.user };
}

async function complete(cookie, activityId, answers, idempotencyKey = `${activityId}:e2e-${crypto.randomUUID()}`) {
  return json("/api/progress/complete", {
    cookie,
    method: "POST",
    body: JSON.stringify({ activityId, answers, idempotencyKey }),
    expected: 201,
  });
}

const home = await fetch(base);
assert.equal(home.status, 200);
assert.equal(home.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.headers.get("x-frame-options"), "DENY");
assert.match(home.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
assert.match(await home.text(), /SAC/);

const adviser = await login("SAC-1001", "2468");
assert.equal(adviser.user.role, "asesor");
const adviserProgressBefore = await json("/api/progress", { cookie: adviser.cookie });
await json("/api/admin/receptions", { cookie: adviser.cookie, expected: 403 });

const optometrist = await login("SAC-2001", "1357");
assert.equal(optometrist.user.role, "optometra");
await json("/api/progress", { cookie: optometrist.cookie });

const completedTrainingBefore = adviserProgressBefore.body.modules.filter(
  (row) => row.status === "completed" && /^sac-\d{2}$/.test(row.moduleId),
).length;
if (completedTrainingBefore < sacModules.length) {
  await json("/api/progress/complete", {
    cookie: adviser.cookie,
    method: "POST",
    body: JSON.stringify({
      activityId: "quiz-final",
      answers: finalQuizQuestions.map((question) => question.answer),
      idempotencyKey: `quiz-final:blocked-${crypto.randomUUID()}`,
    }),
    expected: 409,
  });
}

for (const learningModule of sacModules) {
  const result = await complete(adviser.cookie, `module-${learningModule.order}`, [...MODULE_EXPERIENCE_TOKENS]);
  assert.equal(result.body.attempt.passed, true);
}

const firstModuleAnswers = [...MODULE_EXPERIENCE_TOKENS];
const repeatKey = `module-1:repeat-${crypto.randomUUID()}`;
const firstAttempt = await complete(adviser.cookie, "module-1", firstModuleAnswers, repeatKey);
const repeatedAttempt = await json("/api/progress/complete", {
  cookie: adviser.cookie,
  method: "POST",
  body: JSON.stringify({ activityId: "module-1", answers: firstModuleAnswers, idempotencyKey: repeatKey }),
  expected: 200,
});
assert.equal(repeatedAttempt.body.idempotent, true);
assert.deepEqual(repeatedAttempt.body.balance, firstAttempt.body.balance);

const certification = await complete(
  adviser.cookie,
  "quiz-final",
  finalQuizQuestions.map((question) => question.answer),
);
assert.equal(certification.body.attempt.score, finalQuizQuestions.length);

const gameInputs = [
  ["risk-lab", riskCases.map((item) => item.answer)],
  ["trivia-sprint", triviaQuestions.map((item) => item.answer)],
  ["protocol-order", protocolOrder.map((item) => item.id)],
  ["visual-findings", visualFindings.map((item) => item.id)],
  ["conversation-sim", conversationCases.map((item) => item.answer)],
  ["checklist-timed", checklistChallenge.filter((item) => item.required).map((item) => item.id)],
];
for (const [activityId, answers] of gameInputs) {
  const result = await complete(adviser.cookie, activityId, answers);
  assert.equal(result.body.attempt.passed, true, activityId);
}

const progress = await json("/api/progress", { cookie: adviser.cookie });
assert.equal(progress.body.modules.filter((row) => row.status === "completed").length, 15);
assert.ok(progress.body.balance.xp > 1_000);
await json("/api/ranking?limit=10", { cookie: adviser.cookie });

const highRisk = new FormData();
highRisk.append("payload", JSON.stringify({
  date: "2026-09-05",
  store: adviser.user.store,
  ot: "OT-HIGH-BLOCKED",
  advisor: adviser.user.fullName,
  client: "Cliente de Prueba",
  id: "0000000000",
  frameState: "Fisura visible en la bisagra",
  age: "Menos de 1 año",
  legalTextVersion: "SAC-2026-01",
  confirmations: { reviewed: true, shown: true, manipulation: true, heat: true, age: true, risks: true, questions: true },
}));
await json("/api/receptions", { cookie: adviser.cookie, method: "POST", body: highRisk, expected: 422 });

const reception = new FormData();
reception.append("payload", JSON.stringify({
  date: "2026-09-05",
  store: adviser.user.store,
  ot: "OT-E2E-001",
  advisor: adviser.user.fullName,
  client: "Cliente de Prueba",
  id: "0000000000",
  phone: "0990000000",
  frameMaterial: "Acetato",
  frameType: "Aro completo",
  frameState: "Sin hallazgos relevantes",
  lensState: "Sin novedades visibles",
  age: "Menos de 1 año",
  observations: "Registro automatizado de validación; no corresponde a una atención real.",
  legalTextVersion: "SAC-2026-01",
  confirmations: { reviewed: true, shown: true, manipulation: true, heat: true, age: true, risks: true, questions: true },
}));
const photo = await readFile(new URL("../public/media/sac-inspeccion-fisura.png", import.meta.url));
reception.append("photos", new Blob([photo], { type: "image/png" }), "inspeccion.png");
reception.append("signature", new Blob([onePixelPng], { type: "image/png" }), "firma.png");
const saved = await json("/api/receptions", { cookie: adviser.cookie, method: "POST", body: reception, expected: 201 });
assert.match(saved.body.reception.receiptNumber, /^SAC-20260905-/);
assert.equal(saved.body.reception.risk, "bajo");

const admin = await login("SAC-ADMIN", "2026");
const list = await json("/api/admin/receptions?limit=100", { cookie: admin.cookie });
assert.ok(list.body.receptions.some((row) => row.receiptNumber === saved.body.reception.receiptNumber));
const csv = await fetch(`${base}/api/admin/receptions/export`, { headers: { origin: base, cookie: admin.cookie } });
assert.equal(csv.status, 200);
assert.match(csv.headers.get("content-type") ?? "", /text\/csv/);
assert.match(await csv.text(), /OT-E2E-001/);

console.log("E2E SAC: sesión, progreso, 8 módulos, certificación, 6 juegos, R2/D1 y CSV verificados.");
