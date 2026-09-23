import { z } from "zod";
import {
  CONTENT_VERSION as SAC_CONTENT_VERSION,
  checklistChallenge,
  conversationCases,
  finalQuizQuestions,
  lunasQuizQuestions,
  decirNoQuizQuestions,
  MODULE_EXPERIENCE_TOKENS,
  protocolOrder,
  riskCases,
  sacModules,
  triviaQuestions,
  visualFindings,
} from "../sac-content";
import { ApiError } from "./errors";

export const CONTENT_VERSION = SAC_CONTENT_VERSION;

export const completionRequestSchema = z.object({
  activityId: z.string().trim().min(1).max(64),
  idempotencyKey: z.string().trim().min(8).max(100).regex(/^[A-Za-z0-9._:-]+$/),
  answers: z
    .array(z.union([z.number().int().min(0).max(9), z.string().trim().max(32)]))
    .max(20)
    .optional(),
});

type Evaluation = {
  activityId: string;
  moduleId: string;
  contentVersion: string;
  score: number;
  maxScore: number;
  passed: boolean;
  xp: number;
  coins: number;
  reason: string;
  answers: Array<number | string>;
};

type Reward = {
  xp: number;
  coins: number;
};

const moduleRewards: Record<string, { moduleId: string; xp: number }> = {};
for (const sacMod of sacModules) {
  moduleRewards[sacMod.id] = { moduleId: sacMod.id, xp: sacMod.xp };
  if (sacMod.capsuleId === "capsule-lunas") {
    moduleRewards[`luna-${sacMod.order}`] = { moduleId: sacMod.id, xp: sacMod.xp };
    moduleRewards[`module-luna-${sacMod.order}`] = { moduleId: sacMod.id, xp: sacMod.xp };
  } else if (sacMod.capsuleId === "capsule-decir-no") {
    moduleRewards[`no-${sacMod.order}`] = { moduleId: sacMod.id, xp: sacMod.xp };
    moduleRewards[`module-no-${sacMod.order}`] = { moduleId: sacMod.id, xp: sacMod.xp };
  } else {
    moduleRewards[`module-${sacMod.order}`] = { moduleId: sacMod.id, xp: sacMod.xp };
  }
}

function requireNumberAnswers(
  input: z.infer<typeof completionRequestSchema>,
  count: number,
  message: string,
): number[] {
  const answers = input.answers ?? [];
  if (answers.length !== count || answers.some((answer) => typeof answer !== "number")) {
    throw new ApiError(422, "INVALID_ANSWERS", message);
  }
  return answers as number[];
}

function requireStringAnswers(
  input: z.infer<typeof completionRequestSchema>,
  count: number,
  message: string,
): string[] {
  const answers = input.answers ?? [];
  if (answers.length !== count || answers.some((answer) => typeof answer !== "string")) {
    throw new ApiError(422, "INVALID_ANSWERS", message);
  }
  return answers as string[];
}

function scoreOrdered<T>(answers: readonly T[], correct: readonly T[]): number {
  return correct.reduce(
    (score, expected, index) => score + (answers[index] === expected ? 1 : 0),
    0,
  );
}

function evaluation(
  activityId: string,
  moduleId: string,
  score: number,
  maxScore: number,
  passed: boolean,
  reward: Reward,
  successReason: string,
  answers: Array<number | string>,
): Evaluation {
  return {
    activityId,
    moduleId,
    contentVersion: CONTENT_VERSION,
    score,
    maxScore,
    passed,
    xp: passed ? reward.xp : 0,
    coins: passed ? reward.coins : 0,
    reason: passed ? successReason : `${successReason}: intento registrado`,
    answers,
  };
}

export function evaluateActivity(input: z.infer<typeof completionRequestSchema>): Evaluation {
  const moduleReward = moduleRewards[input.activityId];
  if (moduleReward) {
    const answers = requireStringAnswers(
      input,
      MODULE_EXPERIENCE_TOKENS.length,
      "El módulo requiere revisar la demostración, explorar los ejemplos y completar la práctica guiada.",
    );
    const score = scoreOrdered(answers, MODULE_EXPERIENCE_TOKENS);
    const passed = score === MODULE_EXPERIENCE_TOKENS.length;
    return evaluation(
      input.activityId,
      moduleReward.moduleId,
      score,
      MODULE_EXPERIENCE_TOKENS.length,
      passed,
      { xp: moduleReward.xp, coins: Math.round(moduleReward.xp / 4) },
      `Módulo ${moduleReward.moduleId} completado`,
      answers,
    );
  }

  if (input.activityId === "quiz-final") {
    const passThreshold = Math.max(1, Math.ceil(finalQuizQuestions.length * 0.85));
    const answers = requireNumberAnswers(
      input,
      finalQuizQuestions.length,
      `La certificación requiere ${finalQuizQuestions.length} respuestas.`,
    );
    const correct = finalQuizQuestions.map((question) => question.answer);
    const score = scoreOrdered(answers, correct);
    const passed = score >= passThreshold;
    return evaluation(
      input.activityId,
      "certificacion",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 260, coins: 90 } : { xp: 200, coins: 60 },
      "Certificación aprobada",
      answers,
    );
  }

  if (input.activityId === "quiz-lunas") {
    const passThreshold = Math.max(1, Math.ceil(lunasQuizQuestions.length * 0.85));
    const answers = requireNumberAnswers(
      input,
      lunasQuizQuestions.length,
      `La certificación de lunas requiere ${lunasQuizQuestions.length} respuestas.`,
    );
    const correct = lunasQuizQuestions.map((question) => question.answer);
    const score = scoreOrdered(answers, correct);
    const passed = score >= passThreshold;
    return evaluation(
      input.activityId,
      "certificacion-lunas",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 260, coins: 90 } : { xp: 200, coins: 60 },
      "Certificación de Lunas aprobada",
      answers,
    );
  }

  if (input.activityId === "quiz-decir-no") {
    const passThreshold = Math.max(1, Math.ceil(decirNoQuizQuestions.length * 0.85));
    const answers = requireNumberAnswers(
      input,
      decirNoQuizQuestions.length,
      `La certificación de asertividad requiere ${decirNoQuizQuestions.length} respuestas.`,
    );
    const correct = decirNoQuizQuestions.map((question) => question.answer);
    const score = scoreOrdered(answers, correct);
    const passed = score >= passThreshold;
    return evaluation(
      input.activityId,
      "certificacion-decir-no",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 260, coins: 90 } : { xp: 200, coins: 60 },
      "Certificación de Asertividad y Límites Técnicos aprobada",
      answers,
    );
  }

  if (input.activityId === "risk-lab") {
    const answers = requireStringAnswers(
      input,
      riskCases.length,
      "El laboratorio de riesgo requiere nueve respuestas.",
    );
    const correct = riskCases.map((item) => item.answer);
    const score = scoreOrdered(answers, correct);
    const passed = score >= 7;
    return evaluation(
      input.activityId,
      "game:risk-lab",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 180, coins: 60 } : { xp: 130, coins: 40 },
      "Laboratorio de riesgo completado",
      answers,
    );
  }

  if (input.activityId === "trivia-sprint") {
    const answers = requireNumberAnswers(
      input,
      triviaQuestions.length,
      "Trivia Sprint requiere diez respuestas.",
    );
    const correct = triviaQuestions.map((question) => question.answer);
    const score = scoreOrdered(answers, correct);
    const passed = score >= 8;
    return evaluation(
      input.activityId,
      "game:trivia-sprint",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 160, coins: 55 } : { xp: 110, coins: 35 },
      "Trivia Sprint completada",
      answers,
    );
  }

  if (input.activityId === "protocol-order") {
    const answers = requireStringAnswers(
      input,
      protocolOrder.length,
      "El reto de protocolo requiere ordenar sus ocho pasos.",
    );
    const correct = protocolOrder.map((step) => step.id);
    const score = scoreOrdered(answers, correct);
    const passed = score >= 7;
    return evaluation(
      input.activityId,
      "game:protocol-order",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 160, coins: 55 } : { xp: 120, coins: 40 },
      "Secuencia del protocolo completada",
      answers,
    );
  }

  if (input.activityId === "visual-findings") {
    const answers = requireStringAnswers(
      input,
      visualFindings.length,
      "El reto visual requiere seis hallazgos.",
    );
    const expected = new Set(visualFindings.map((finding) => finding.id));
    const uniqueAnswers = new Set(answers);
    const score = [...uniqueAnswers].filter((answer) => expected.has(answer)).length;
    const passed = score >= 5;
    return evaluation(
      input.activityId,
      "game:visual-findings",
      score,
      expected.size,
      passed,
      score === expected.size ? { xp: 160, coins: 55 } : { xp: 120, coins: 40 },
      "Detección visual completada",
      answers,
    );
  }

  if (input.activityId === "conversation-sim") {
    const answers = requireNumberAnswers(
      input,
      conversationCases.length,
      "La simulación de conversación requiere cuatro respuestas.",
    );
    const correct = conversationCases.map((item) => item.answer);
    const score = scoreOrdered(answers, correct);
    const passed = score >= 3;
    return evaluation(
      input.activityId,
      "game:conversation-sim",
      score,
      correct.length,
      passed,
      score === correct.length ? { xp: 180, coins: 60 } : { xp: 130, coins: 40 },
      "Simulación de conversación completada",
      answers,
    );
  }

  if (input.activityId === "checklist-timed") {
    const answers = input.answers ?? [];
    if (answers.some((answer) => typeof answer !== "string")) {
      throw new ApiError(422, "INVALID_ANSWERS", "El checklist requiere identificadores válidos.");
    }
    const selected = new Set(answers as string[]);
    const required = checklistChallenge.filter((item) => item.required);
    const distractors = checklistChallenge.filter((item) => !item.required);
    const publishedIds = new Set(checklistChallenge.map((item) => item.id));
    const score = required.filter((item) => selected.has(item.id)).length;
    const selectedDistractors = distractors.filter((item) => selected.has(item.id)).length;
    const hasUnknownSelection = [...selected].some((id) => !publishedIds.has(id));
    const passed =
      score === required.length && selectedDistractors === 0 && !hasUnknownSelection;
    return evaluation(
      input.activityId,
      "game:checklist-timed",
      score,
      required.length,
      passed,
      { xp: 180, coins: 60 },
      "Checklist contrarreloj completado",
      answers as string[],
    );
  }

  throw new ApiError(404, "ACTIVITY_NOT_FOUND", "La actividad no existe o no está publicada.");
}
