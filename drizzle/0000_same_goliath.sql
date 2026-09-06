CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`collaborator_id` text NOT NULL,
	`activity_id` text NOT NULL,
	`module_id` text NOT NULL,
	`content_version` text NOT NULL,
	`score` integer NOT NULL,
	`max_score` integer NOT NULL,
	`passed` integer NOT NULL,
	`answers_json` text DEFAULT '[]' NOT NULL,
	`idempotency_key` text NOT NULL,
	`completed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "attempts_scores_check" CHECK("attempts"."score" >= 0 and "attempts"."max_score" > 0 and "attempts"."score" <= "attempts"."max_score"),
	CONSTRAINT "attempts_passed_check" CHECK("attempts"."passed" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempts_idempotency_uidx` ON `attempts` (`collaborator_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `attempts_collaborator_idx` ON `attempts` (`collaborator_id`);--> statement-breakpoint
CREATE INDEX `attempts_activity_idx` ON `attempts` (`activity_id`);--> statement-breakpoint
CREATE TABLE `collaborators` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_code` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text,
	`role` text NOT NULL,
	`store` text NOT NULL,
	`pin_hash` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`failed_login_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` integer,
	`last_login_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "collaborators_role_check" CHECK("collaborators"."role" in ('asesor', 'optometra', 'admin')),
	CONSTRAINT "collaborators_active_check" CHECK("collaborators"."active" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collaborators_employee_code_uidx` ON `collaborators` (`employee_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `collaborators_email_uidx` ON `collaborators` (`email`);--> statement-breakpoint
CREATE INDEX `collaborators_store_idx` ON `collaborators` (`store`);--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`reception_id` text NOT NULL,
	`kind` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`object_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`bytes` integer NOT NULL,
	`sha256` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "evidence_kind_check" CHECK("evidence"."kind" in ('photo', 'signature')),
	CONSTRAINT "evidence_bytes_check" CHECK("evidence"."bytes" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_object_key_uidx` ON `evidence` (`object_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_reception_position_uidx` ON `evidence` (`reception_id`,`kind`,`position`);--> statement-breakpoint
CREATE INDEX `evidence_reception_idx` ON `evidence` (`reception_id`);--> statement-breakpoint
CREATE TABLE `progress` (
	`collaborator_id` text NOT NULL,
	`module_id` text NOT NULL,
	`content_version` text DEFAULT '2026.1' NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`best_score` integer DEFAULT 0 NOT NULL,
	`max_score` integer DEFAULT 1 NOT NULL,
	`attempts_count` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`collaborator_id`, `module_id`),
	FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "progress_status_check" CHECK("progress"."status" in ('in_progress', 'completed')),
	CONSTRAINT "progress_scores_check" CHECK("progress"."best_score" >= 0 and "progress"."max_score" > 0)
);
--> statement-breakpoint
CREATE INDEX `progress_status_idx` ON `progress` (`status`);--> statement-breakpoint
CREATE TABLE `receptions` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_number` text NOT NULL,
	`created_by` text NOT NULL,
	`received_on` text NOT NULL,
	`store` text NOT NULL,
	`work_order` text NOT NULL,
	`advisor_name` text NOT NULL,
	`optometrist_name` text,
	`client_name` text NOT NULL,
	`client_document` text NOT NULL,
	`client_phone` text,
	`client_email` text,
	`risk` text NOT NULL,
	`risk_reasons_json` text DEFAULT '[]' NOT NULL,
	`escalation_reference` text,
	`status` text NOT NULL,
	`legal_text_version` text NOT NULL,
	`confirmations_json` text NOT NULL,
	`details_json` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `collaborators`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "receptions_risk_check" CHECK("receptions"."risk" in ('bajo', 'medio', 'alto')),
	CONSTRAINT "receptions_status_check" CHECK("receptions"."status" in ('completed', 'escalation_pending', 'cancelled')),
	CONSTRAINT "receptions_high_risk_check" CHECK("receptions"."risk" <> 'alto' or ("receptions"."status" = 'escalation_pending' and length(trim("receptions"."escalation_reference")) >= 3))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_receipt_number_uidx` ON `receptions` (`receipt_number`);--> statement-breakpoint
CREATE INDEX `receptions_created_by_idx` ON `receptions` (`created_by`);--> statement-breakpoint
CREATE INDEX `receptions_store_idx` ON `receptions` (`store`);--> statement-breakpoint
CREATE INDEX `receptions_received_on_idx` ON `receptions` (`received_on`);--> statement-breakpoint
CREATE INDEX `receptions_risk_status_idx` ON `receptions` (`risk`,`status`);--> statement-breakpoint
CREATE TABLE `reward_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`collaborator_id` text NOT NULL,
	`attempt_id` text,
	`reason` text NOT NULL,
	`xp_delta` integer NOT NULL,
	`coin_delta` integer NOT NULL,
	`idempotency_key` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reward_ledger_idempotency_uidx` ON `reward_ledger` (`collaborator_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `reward_ledger_collaborator_idx` ON `reward_ledger` (`collaborator_id`);--> statement-breakpoint
CREATE INDEX `reward_ledger_created_idx` ON `reward_ledger` (`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`collaborator_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_seen_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_collaborator_idx` ON `sessions` (`collaborator_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);