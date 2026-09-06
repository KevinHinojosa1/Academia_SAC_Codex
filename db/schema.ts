import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const collaborators = sqliteTable(
  "collaborators",
  {
    id: text("id").primaryKey(),
    employeeCode: text("employee_code").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email"),
    role: text("role", { enum: ["asesor", "optometra", "admin"] }).notNull(),
    store: text("store").notNull(),
    pinHash: text("pin_hash").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: integer("locked_until"),
    lastLoginAt: integer("last_login_at"),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("collaborators_employee_code_uidx").on(table.employeeCode),
    uniqueIndex("collaborators_email_uidx").on(table.email),
    index("collaborators_store_idx").on(table.store),
    check(
      "collaborators_role_check",
      sql`${table.role} in ('asesor', 'optometra', 'admin')`,
    ),
    check(
      "collaborators_active_check",
      sql`${table.active} in (0, 1)`,
    ),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    collaboratorId: text("collaborator_id")
      .notNull()
      .references(() => collaborators.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
    lastSeenAt: integer("last_seen_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("sessions_collaborator_idx").on(table.collaboratorId),
    index("sessions_expires_idx").on(table.expiresAt),
  ],
);

export const progress = sqliteTable(
  "progress",
  {
    collaboratorId: text("collaborator_id")
      .notNull()
      .references(() => collaborators.id, { onDelete: "cascade" }),
    moduleId: text("module_id").notNull(),
    contentVersion: text("content_version").notNull().default("2026.1"),
    status: text("status", { enum: ["in_progress", "completed"] })
      .notNull()
      .default("in_progress"),
    bestScore: integer("best_score").notNull().default(0),
    maxScore: integer("max_score").notNull().default(1),
    attemptsCount: integer("attempts_count").notNull().default(0),
    completedAt: integer("completed_at"),
    updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.collaboratorId, table.moduleId] }),
    index("progress_status_idx").on(table.status),
    check(
      "progress_status_check",
      sql`${table.status} in ('in_progress', 'completed')`,
    ),
    check("progress_scores_check", sql`${table.bestScore} >= 0 and ${table.maxScore} > 0`),
  ],
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    collaboratorId: text("collaborator_id")
      .notNull()
      .references(() => collaborators.id, { onDelete: "cascade" }),
    activityId: text("activity_id").notNull(),
    moduleId: text("module_id").notNull(),
    contentVersion: text("content_version").notNull(),
    score: integer("score").notNull(),
    maxScore: integer("max_score").notNull(),
    passed: integer("passed", { mode: "boolean" }).notNull(),
    answersJson: text("answers_json").notNull().default("[]"),
    idempotencyKey: text("idempotency_key").notNull(),
    completedAt: integer("completed_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("attempts_idempotency_uidx").on(
      table.collaboratorId,
      table.idempotencyKey,
    ),
    index("attempts_collaborator_idx").on(table.collaboratorId),
    index("attempts_activity_idx").on(table.activityId),
    check("attempts_scores_check", sql`${table.score} >= 0 and ${table.maxScore} > 0 and ${table.score} <= ${table.maxScore}`),
    check("attempts_passed_check", sql`${table.passed} in (0, 1)`),
  ],
);

export const rewardLedger = sqliteTable(
  "reward_ledger",
  {
    id: text("id").primaryKey(),
    collaboratorId: text("collaborator_id")
      .notNull()
      .references(() => collaborators.id, { onDelete: "cascade" }),
    attemptId: text("attempt_id").references(() => attempts.id, {
      onDelete: "set null",
    }),
    reason: text("reason").notNull(),
    xpDelta: integer("xp_delta").notNull(),
    coinDelta: integer("coin_delta").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("reward_ledger_idempotency_uidx").on(
      table.collaboratorId,
      table.idempotencyKey,
    ),
    index("reward_ledger_collaborator_idx").on(table.collaboratorId),
    index("reward_ledger_created_idx").on(table.createdAt),
  ],
);

export const receptions = sqliteTable(
  "receptions",
  {
    id: text("id").primaryKey(),
    receiptNumber: text("receipt_number").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => collaborators.id, { onDelete: "restrict" }),
    receivedOn: text("received_on").notNull(),
    store: text("store").notNull(),
    workOrder: text("work_order").notNull(),
    advisorName: text("advisor_name").notNull(),
    optometristName: text("optometrist_name"),
    clientName: text("client_name").notNull(),
    clientDocument: text("client_document").notNull(),
    clientPhone: text("client_phone"),
    clientEmail: text("client_email"),
    risk: text("risk", { enum: ["bajo", "medio", "alto"] }).notNull(),
    riskReasonsJson: text("risk_reasons_json").notNull().default("[]"),
    escalationReference: text("escalation_reference"),
    status: text("status", {
      enum: ["completed", "escalation_pending", "cancelled"],
    }).notNull(),
    legalTextVersion: text("legal_text_version").notNull(),
    confirmationsJson: text("confirmations_json").notNull(),
    detailsJson: text("details_json").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("receptions_receipt_number_uidx").on(table.receiptNumber),
    index("receptions_created_by_idx").on(table.createdBy),
    index("receptions_store_idx").on(table.store),
    index("receptions_received_on_idx").on(table.receivedOn),
    index("receptions_risk_status_idx").on(table.risk, table.status),
    check("receptions_risk_check", sql`${table.risk} in ('bajo', 'medio', 'alto')`),
    check(
      "receptions_status_check",
      sql`${table.status} in ('completed', 'escalation_pending', 'cancelled')`,
    ),
    check(
      "receptions_high_risk_check",
      sql`${table.risk} <> 'alto' or (${table.status} = 'escalation_pending' and length(trim(${table.escalationReference})) >= 3)`,
    ),
  ],
);

export const evidence = sqliteTable(
  "evidence",
  {
    id: text("id").primaryKey(),
    receptionId: text("reception_id")
      .notNull()
      .references(() => receptions.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["photo", "signature"] }).notNull(),
    position: integer("position").notNull().default(0),
    objectKey: text("object_key").notNull(),
    mimeType: text("mime_type").notNull(),
    bytes: integer("bytes").notNull(),
    sha256: text("sha256").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("evidence_object_key_uidx").on(table.objectKey),
    uniqueIndex("evidence_reception_position_uidx").on(
      table.receptionId,
      table.kind,
      table.position,
    ),
    index("evidence_reception_idx").on(table.receptionId),
    check("evidence_kind_check", sql`${table.kind} in ('photo', 'signature')`),
    check("evidence_bytes_check", sql`${table.bytes} > 0`),
  ],
);

export type Collaborator = typeof collaborators.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type Reception = typeof receptions.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
