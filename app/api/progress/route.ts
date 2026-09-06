import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { attempts, progress, rewardLedger } from "@/db/schema";
import { errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { requireUser } from "@/lib/server/session";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const db = getDb();
    const [modules, recentAttempts, balanceRows] = await Promise.all([
      db.select().from(progress).where(eq(progress.collaboratorId, user.id)),
      db
        .select({
          id: attempts.id,
          activityId: attempts.activityId,
          moduleId: attempts.moduleId,
          score: attempts.score,
          maxScore: attempts.maxScore,
          passed: attempts.passed,
          completedAt: attempts.completedAt,
        })
        .from(attempts)
        .where(eq(attempts.collaboratorId, user.id))
        .orderBy(desc(attempts.completedAt))
        .limit(20),
      db
        .select({
          xp: sql<number>`coalesce(sum(${rewardLedger.xpDelta}), 0)`.mapWith(Number),
          coins: sql<number>`coalesce(sum(${rewardLedger.coinDelta}), 0)`.mapWith(Number),
        })
        .from(rewardLedger)
        .where(eq(rewardLedger.collaboratorId, user.id)),
    ]);

    return Response.json(
      {
        user,
        balance: balanceRows[0] ?? { xp: 0, coins: 0 },
        modules,
        recentAttempts,
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
