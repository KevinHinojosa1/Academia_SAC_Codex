import { getD1 } from "@/db";
import { createCsv } from "@/lib/server/csv";
import { ApiError, errorResponse } from "@/lib/server/errors";
import { receptionFilters, receptionWhere } from "@/lib/server/reporting";
import { requireUser } from "@/lib/server/session";

type ExportRow = {
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
  status: string;
  escalationReference: string | null;
  legalTextVersion: string;
  createdByCode: string;
  createdByName: string;
  evidenceCount: number;
  createdAt: number;
};

const EXPORT_LIMIT = 10_000;

export async function GET(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    const url = new URL(request.url);
    const { clause, values } = receptionWhere(receptionFilters(url));
    const result = await getD1()
      .prepare(
        `select r.receipt_number as receiptNumber, r.received_on as receivedOn,
                r.store, r.work_order as workOrder, r.advisor_name as advisorName,
                r.optometrist_name as optometristName, r.client_name as clientName,
                r.client_document as clientDocument, r.client_phone as clientPhone,
                r.client_email as clientEmail, r.risk, r.status,
                r.escalation_reference as escalationReference,
                r.legal_text_version as legalTextVersion,
                c.employee_code as createdByCode, c.full_name as createdByName,
                (select count(*) from evidence e where e.reception_id = r.id) as evidenceCount,
                r.created_at as createdAt
         from receptions r
         inner join collaborators c on c.id = r.created_by
         where ${clause}
         order by r.created_at desc, r.id desc
         limit ?`,
      )
      .bind(...values, EXPORT_LIMIT + 1)
      .all<ExportRow>();
    const rows = result.results ?? [];
    if (rows.length > EXPORT_LIMIT) {
      throw new ApiError(
        413,
        "EXPORT_TOO_LARGE",
        "El reporte supera 10.000 filas. Aplique filtros de fecha o local.",
      );
    }

    const csv = createCsv(
      [
        "Número de recepción",
        "Fecha de recepción",
        "Local",
        "OT / arreglo",
        "Asesor",
        "Optómetra",
        "Cliente",
        "Cédula / RUC",
        "Teléfono",
        "Email",
        "Riesgo",
        "Estado",
        "Referencia de escalamiento",
        "Versión legal",
        "Código registrador",
        "Registrado por",
        "Número de evidencias",
        "Creado UTC",
      ],
      rows.map((row) => [
        row.receiptNumber,
        row.receivedOn,
        row.store,
        row.workOrder,
        row.advisorName,
        row.optometristName,
        row.clientName,
        row.clientDocument,
        row.clientPhone,
        row.clientEmail,
        row.risk,
        row.status,
        row.escalationReference,
        row.legalTextVersion,
        row.createdByCode,
        row.createdByName,
        row.evidenceCount,
        new Date(row.createdAt * 1_000).toISOString(),
      ]),
    );
    const today = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "cache-control": "no-store, private",
        "content-disposition": `attachment; filename="sac-recepciones-${today}.csv"`,
        "content-type": "text/csv; charset=utf-8",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const dynamic = "force-dynamic";
