INSERT INTO `collaborators`
  (`id`, `employee_code`, `full_name`, `email`, `role`, `store`, `pin_hash`, `active`)
VALUES
  ('pilot-asesor', 'SAC-1001', 'Andrea Torres', 'asesor@sac.local', 'asesor', 'Quito Norte', 'pbkdf2_sha256$210000$To5xtBGNRjgzZwgsO8gLHA$TouQHvWZSagR6Zmg6_ZZ3P8YVwkJkVVw5rxDmP29Gn0', 1),
  ('pilot-optometra', 'SAC-2001', 'Mateo Vega', 'optometra@sac.local', 'optometra', 'Quito Norte', 'pbkdf2_sha256$210000$IKBrFRN9lMtGhpf5JfK43w$CBTzX058zT4HizfqKFtY4fYJSCodaUGkZT57s_t0fcc', 1),
  ('pilot-admin', 'SAC-ADMIN', 'Camila Ruiz', 'admin@sac.local', 'admin', 'Operaciones SAC', 'pbkdf2_sha256$210000$4veLVKg_ukgoNKnIyt-TkA$ojFbxXGPIXP3DsSGtQdZ60axizHRktyS6zljceTb9kE', 1)
ON CONFLICT(`employee_code`) DO UPDATE SET
  `full_name` = excluded.`full_name`,
  `email` = excluded.`email`,
  `role` = excluded.`role`,
  `store` = excluded.`store`,
  `pin_hash` = excluded.`pin_hash`,
  `active` = 1,
  `updated_at` = unixepoch();
