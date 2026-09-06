import { getD1 } from "@/db";
import { ApiError, errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { receptionFilters, receptionWhere } from "@/lib/server/reporting";
import { requireUser } from "@/lib/server/session";

type ReceptionListRow = {
  id: string;
  receiptNumber: string;
  receivedOn: string;
  store: string;
  workOrder: string;
  advisorName: string;
  optometristName: string | null;
  clientName: string;
  clientDocument: string;
  clientPhone: string | null;
  clientEmail: string | null;
  risk: string;
  escalationReference: string | null;
  status: string;
  legalTextVersion: string;
  createdAt: number;
  createdByCode: string;
  createdByName: string;
  evidenceCount: number;
};

export async function GET(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    const url = new URL(request.url);
    const filters = receptionFilters(url);
    const { clause, values } = receptionWhere(filters);
    const pageValue = Number(url.searchParams.get("page") ?? "1");
    const limitValue = Number(url.searchParams.get("limit") ?? "50");
    if (!Number.isInteger(pageValue) || pageValue < 1) {
      throw new ApiError(400, "INVALID_PAGE", "La página solicitada no es válida.");
    }
    if (!Number.isInteger(limitValue) || limitValue < 1 || limitValue > 100) {
      throw new ApiError(400, "INVALID_LIMIT", "El límite debe estar entre 1 y 100.");
    }
    const offset = (pageValue - 1) * limitValue;
    const d1 = getD1();
    const listStatement = d1
      .prepare(
        `select r.id, r.receipt_number as receiptNumber, r.received_on as receivedOn,
                r.store, r.work_order as workOrder, r.advisor_name as advisorName,
                r.optometrist_name as optometristName, r.client_name as clientName,
                r.client_document as clientDocument, r.client_phone as clientPhone,
                r.client_email as clientEmail, r.risk,
                r.escalation_reference as escalationReference, r.status,
                r.legal_text_version as legalTextVersion, r.created_at as createdAt,
                c.employee_code as createdByCode, c.full_name as createdByName,
                (select count(*) from evidence e where e.reception_id = r.id) as evidenceCount
         from receptions r
         inner join collaborators c on c.id = r.created_by
         where ${clause}
         order by r.created_at desc, r.id desc
         limit ? offset ?`,
      )
      .bind(...values, limitValue, offset);
    const countStatement = d1
      .prepare(`select count(*) as total from receptions r where ${clause}`)
      .bind(...values);
    const [listResult, countResult] = await Promise.all([
      listStatement.all<ReceptionListRow>(),
      countStatement.first<{ total: number }>(),
    ]);
    const total = Number(countResult?.total ?? 0);
    return Response.json(
      {
        page: pageValue,
        limit: limitValue,
        total,
        pages: Math.ceil(total / limitValue),
        receptions: listResult.results ?? [],
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export const dynamic = "force-dynamic";
