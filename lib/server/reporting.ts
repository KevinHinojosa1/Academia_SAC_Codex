import { ApiError } from "./errors";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export type ReceptionFilters = {
  from?: string;
  to?: string;
  store?: string;
  risk?: "bajo" | "medio" | "alto";
  status?: "completed" | "escalation_pending" | "cancelled";
};

export function receptionFilters(url: URL): ReceptionFilters {
  const from = url.searchParams.get("from")?.trim() || undefined;
  const to = url.searchParams.get("to")?.trim() || undefined;
  const store = url.searchParams.get("store")?.trim() || undefined;
  const risk = url.searchParams.get("risk")?.trim() || undefined;
  const status = url.searchParams.get("status")?.trim() || undefined;
  if (from && !datePattern.test(from)) {
    throw new ApiError(400, "INVALID_FILTER", "El filtro 'from' debe usar AAAA-MM-DD.");
  }
  if (to && !datePattern.test(to)) {
    throw new ApiError(400, "INVALID_FILTER", "El filtro 'to' debe usar AAAA-MM-DD.");
  }
  if (from && to && from > to) {
    throw new ApiError(400, "INVALID_FILTER", "La fecha inicial no puede superar la fecha final.");
  }
  if (store && store.length > 100) {
    throw new ApiError(400, "INVALID_FILTER", "El filtro de local es demasiado largo.");
  }
  if (risk && !["bajo", "medio", "alto"].includes(risk)) {
    throw new ApiError(400, "INVALID_FILTER", "El filtro de riesgo no es válido.");
  }
  if (status && !["completed", "escalation_pending", "cancelled"].includes(status)) {
    throw new ApiError(400, "INVALID_FILTER", "El filtro de estado no es válido.");
  }
  return {
    from,
    to,
    store,
    risk: risk as ReceptionFilters["risk"],
    status: status as ReceptionFilters["status"],
  };
}

export function receptionWhere(filters: ReceptionFilters): {
  clause: string;
  values: string[];
} {
  const clauses = ["1 = 1"];
  const values: string[] = [];
  if (filters.from) {
    clauses.push("r.received_on >= ?");
    values.push(filters.from);
  }
  if (filters.to) {
    clauses.push("r.received_on <= ?");
    values.push(filters.to);
  }
  if (filters.store) {
    clauses.push("r.store = ?");
    values.push(filters.store);
  }
  if (filters.risk) {
    clauses.push("r.risk = ?");
    values.push(filters.risk);
  }
  if (filters.status) {
    clauses.push("r.status = ?");
    values.push(filters.status);
  }
  return { clause: clauses.join(" and "), values };
}
