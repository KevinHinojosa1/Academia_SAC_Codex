import { getD1 } from "@/db";
import { errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { requireUser } from "@/lib/server/session";

export type AdminCollaboratorRow = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  role: string;
  store: string;
  active: boolean;
  lastLoginAt: number | null;
  xp: number;
  coins: number;
  completedModules: number;
};

export async function GET(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    const d1 = getD1();

    const query = `
      select 
        c.id,
        c.employee_code as employeeCode,
        c.full_name as fullName,
        c.email,
        c.role,
        c.store,
        case when c.active = 1 then 1 else 0 end as active,
        c.last_login_at as lastLoginAt,
        coalesce(sum(r.xp_delta), 0) as xp,
        coalesce(sum(r.coin_delta), 0) as coins,
        (select count(*) from progress p where p.collaborator_id = c.id and p.status = 'completed') as completedModules
      from collaborators c
      left join reward_ledger r on r.collaborator_id = c.id
      group by c.id
      order by c.created_at asc
    `;

    const result = await d1.prepare(query).all<AdminCollaboratorRow>();
    const collaborators = (result.results ?? []).map((row) => ({
      ...row,
      active: Boolean(row.active),
    }));

    return Response.json(
      { collaborators, total: collaborators.length },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    const body = (await request.json().catch(() => ({}))) as {
      collaboratorId?: string;
      active?: boolean;
    };

    if (!body.collaboratorId) {
      return Response.json({ error: { message: "ID de colaborador requerido." } }, { status: 400 });
    }

    const d1 = getD1();
    if (typeof body.active === "boolean") {
      await d1
        .prepare("update collaborators set active = ?, updated_at = unixepoch() where id = ?")
        .bind(body.active ? 1 : 0, body.collaboratorId)
        .run();
    }

    return Response.json({ success: true }, { headers: noStoreHeaders() });
  } catch (error) {
    return errorResponse(error);
  }
}
