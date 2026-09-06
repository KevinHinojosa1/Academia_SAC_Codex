import { getD1 } from "@/db";
import { errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { requireUser } from "@/lib/server/session";

type RankingRow = {
  position: number;
  collaboratorId: string;
  employeeCode: string;
  fullName: string;
  role: string;
  store: string;
  xp: number;
  coins: number;
  completedModules: number;
};

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? "20");
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(100, Math.max(1, requestedLimit))
      : 20;
    const result = await getD1()
      .prepare(
        `with totals as (
           select c.id as collaboratorId, c.employee_code as employeeCode,
                  c.full_name as fullName, c.role, c.store,
                  coalesce(sum(r.xp_delta), 0) as xp,
                  coalesce(sum(r.coin_delta), 0) as coins,
                  (select count(*) from progress p where p.collaborator_id = c.id and p.status = 'completed') as completedModules
           from collaborators c
           left join reward_ledger r on r.collaborator_id = c.id
           where c.active = 1 and c.role <> 'admin'
           group by c.id
         ), ranked as (
           select row_number() over (order by xp desc, fullName asc) as position, * from totals
         )
         select * from ranked order by position limit ?`,
      )
      .bind(limit)
      .all<RankingRow>();
    const rows = result.results ?? [];
    const self = rows.find((row) => row.collaboratorId === user.id) ?? null;
    return Response.json({ ranking: rows, self }, { headers: noStoreHeaders() });
  } catch (error) {
    return errorResponse(error);
  }
}
