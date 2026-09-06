import { getD1 } from "@/db";
import { ApiError, assertSameOrigin, errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { requireUser } from "@/lib/server/session";
import { completionRequestSchema, evaluateActivity } from "@/lib/server/training";

type StoredAttempt = {
  id: string;
  activity_id: string;
  module_id: string;
  content_version: string;
  score: number;
  max_score: number;
  passed: number;
  completed_at: number;
};

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const parsed = completionRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, "INVALID_COMPLETION", "Los datos de la actividad no son válidos.");
    }
    const d1 = getD1();
    if (parsed.data.activityId === "quiz-final") {
      const requiredModules = [
        "sac-01",
        "sac-02",
        "sac-03",
        "sac-04",
        "sac-05",
        "sac-06",
        "sac-07",
        "sac-08",
      ];
      const completed = await d1
        .prepare(
          `select count(distinct module_id) as total
           from progress
           where collaborator_id = ? and status = 'completed'
             and module_id in (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(user.id, ...requiredModules)
        .first<{ total: number }>();
      if (Number(completed?.total ?? 0) !== requiredModules.length) {
        throw new ApiError(
          409,
          "TRAINING_REQUIRED",
          "Complete los ocho módulos antes de presentar la certificación.",
        );
      }
    }
    const evaluation = evaluateActivity(parsed.data);
    const existing = await d1
      .prepare(
        `select id, activity_id, module_id, content_version, score, max_score, passed, completed_at
         from attempts where collaborator_id = ? and idempotency_key = ? limit 1`,
      )
      .bind(user.id, parsed.data.idempotencyKey)
      .first<StoredAttempt>();

    if (existing && existing.activity_id !== evaluation.activityId) {
      throw new ApiError(
        409,
        "IDEMPOTENCY_CONFLICT",
        "La clave de idempotencia ya pertenece a otra actividad.",
      );
    }

    let idempotent = Boolean(existing);
    if (!existing) {
      const attemptId = crypto.randomUUID();
      const rewardId = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);
      const rewardKey = `activity:${evaluation.activityId}:${evaluation.contentVersion}`;
      const status = evaluation.passed ? "completed" : "in_progress";
      const completedAt = evaluation.passed ? now : null;
      const statements = [
        d1
          .prepare(
            `insert into attempts
             (id, collaborator_id, activity_id, module_id, content_version, score, max_score, passed, answers_json, idempotency_key, completed_at)
             values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             on conflict(collaborator_id, idempotency_key) do nothing`,
          )
          .bind(
            attemptId,
            user.id,
            evaluation.activityId,
            evaluation.moduleId,
            evaluation.contentVersion,
            evaluation.score,
            evaluation.maxScore,
            evaluation.passed ? 1 : 0,
            JSON.stringify(evaluation.answers),
            parsed.data.idempotencyKey,
            now,
          ),
        d1
          .prepare(
            `insert into reward_ledger
             (id, collaborator_id, attempt_id, reason, xp_delta, coin_delta, idempotency_key, created_at)
             select ?, ?, ?, ?, ?, ?, ?, ?
             where ? = 1 and exists (select 1 from attempts where id = ?)
             on conflict(collaborator_id, idempotency_key) do nothing`,
          )
          .bind(
            rewardId,
            user.id,
            attemptId,
            evaluation.reason,
            evaluation.xp,
            evaluation.coins,
            rewardKey,
            now,
            evaluation.passed ? 1 : 0,
            attemptId,
          ),
        d1
          .prepare(
            `insert into progress
             (collaborator_id, module_id, content_version, status, best_score, max_score, attempts_count, completed_at, updated_at)
             select ?, ?, ?, ?, ?, ?, 1, ?, ? where exists (select 1 from attempts where id = ?)
             on conflict(collaborator_id, module_id) do update set
               content_version = excluded.content_version,
               status = case when progress.status = 'completed' or excluded.status = 'completed' then 'completed' else 'in_progress' end,
               best_score = max(progress.best_score, excluded.best_score),
               max_score = excluded.max_score,
               attempts_count = progress.attempts_count + 1,
               completed_at = coalesce(progress.completed_at, excluded.completed_at),
               updated_at = excluded.updated_at`,
          )
          .bind(
            user.id,
            evaluation.moduleId,
            evaluation.contentVersion,
            status,
            evaluation.score,
            evaluation.maxScore,
            completedAt,
            now,
            attemptId,
          ),
      ];
      await d1.batch(statements);
      const stored = await d1
        .prepare(
          `select id, activity_id, module_id, content_version, score, max_score, passed, completed_at
           from attempts where collaborator_id = ? and idempotency_key = ? limit 1`,
        )
        .bind(user.id, parsed.data.idempotencyKey)
        .first<StoredAttempt>();
      idempotent = stored?.id !== attemptId;
    }

    const [attempt, balance] = await Promise.all([
      d1
        .prepare(
          `select id, activity_id, module_id, content_version, score, max_score, passed, completed_at
           from attempts where collaborator_id = ? and idempotency_key = ? limit 1`,
        )
        .bind(user.id, parsed.data.idempotencyKey)
        .first<StoredAttempt>(),
      d1
        .prepare(
          `select coalesce(sum(xp_delta), 0) as xp, coalesce(sum(coin_delta), 0) as coins
           from reward_ledger where collaborator_id = ?`,
        )
        .bind(user.id)
        .first<{ xp: number; coins: number }>(),
    ]);

    if (!attempt) {
      throw new Error("Attempt insertion did not produce a stored row.");
    }
    return Response.json(
      {
        idempotent,
        attempt: {
          id: attempt.id,
          activityId: attempt.activity_id,
          moduleId: attempt.module_id,
          contentVersion: attempt.content_version,
          score: attempt.score,
          maxScore: attempt.max_score,
          passed: Boolean(attempt.passed),
          completedAt: attempt.completed_at,
        },
        balance: balance ?? { xp: 0, coins: 0 },
      },
      { status: idempotent ? 200 : 201, headers: noStoreHeaders() },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(new ApiError(400, "INVALID_JSON", "El cuerpo JSON no es válido."));
    }
    return errorResponse(error);
  }
}
