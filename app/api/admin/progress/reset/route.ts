import { getD1 } from "@/db";
import { ApiError, errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { requireUser } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    const body = (await request.json().catch(() => ({}))) as {
      target?: "all" | "collaborator" | "course";
      collaboratorId?: string;
      capsuleId?: string;
      moduleIds?: string[];
      resetRewards?: boolean;
    };

    const target = body.target || "all";
    const d1 = getD1();

    let progressDeleted = 0;
    let attemptsDeleted = 0;

    if (target === "all") {
      const progRes = await d1.prepare("delete from progress").run();
      const attRes = await d1.prepare("delete from attempts").run();
      progressDeleted = progRes.meta.changes ?? 0;
      attemptsDeleted = attRes.meta.changes ?? 0;

      if (body.resetRewards) {
        await d1.prepare("delete from reward_ledger").run();
      }
    } else if (target === "collaborator") {
      if (!body.collaboratorId) {
        throw new ApiError(400, "MISSING_COLLABORATOR", "Debe especificar el ID del colaborador.");
      }
      const progRes = await d1.prepare("delete from progress where collaborator_id = ?").bind(body.collaboratorId).run();
      const attRes = await d1.prepare("delete from attempts where collaborator_id = ?").bind(body.collaboratorId).run();
      progressDeleted = progRes.meta.changes ?? 0;
      attemptsDeleted = attRes.meta.changes ?? 0;

      if (body.resetRewards) {
        await d1.prepare("delete from reward_ledger where collaborator_id = ?").bind(body.collaboratorId).run();
      }
    } else if (target === "course") {
      const moduleIds = body.moduleIds ?? [];
      if (moduleIds.length > 0) {
        const placeholders = moduleIds.map(() => "?").join(", ");
        const progRes = await d1.prepare(`delete from progress where module_id in (${placeholders})`).bind(...moduleIds).run();
        const attRes = await d1.prepare(`delete from attempts where module_id in (${placeholders})`).bind(...moduleIds).run();
        progressDeleted = progRes.meta.changes ?? 0;
        attemptsDeleted = attRes.meta.changes ?? 0;
      }
    } else {
      throw new ApiError(400, "INVALID_TARGET", "Objetivo de reset no válido.");
    }

    return Response.json(
      {
        success: true,
        message: target === "all"
          ? "Se ha restaurado toda la plataforma en cero para todos los colaboradores."
          : target === "collaborator"
          ? "Se ha restaurado el progreso del colaborador en cero."
          : "Se ha restaurado el curso seleccionado en cero.",
        details: {
          target,
          progressDeleted,
          attemptsDeleted,
        },
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
