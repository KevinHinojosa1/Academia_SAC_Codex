INSERT INTO `collaborators`
  (`id`, `employee_code`, `full_name`, `email`, `role`, `store`, `pin_hash`, `active`)
VALUES
  ('pilot-asesor', 'SAC-1001', 'Andrea Torres', 'asesor@sac.local', 'asesor', 'Quito Norte', 'pbkdf2_sha256$100000$To5xtBGNRjgzZwgsO8gLHA$CMsij5KpNc8KszSdrZ99PqVv-XvixZnN0tynUXCpF2U', 1),
  ('pilot-optometra', 'SAC-2001', 'Mateo Vega', 'optometra@sac.local', 'optometra', 'Quito Norte', 'pbkdf2_sha256$100000$IKBrFRN9lMtGhpf5JfK43w$PKw6oGeoKblFGEc6p8Mtpag587Ry74IZyHJidtoneC0', 1),
  ('pilot-admin', 'SAC-ADMIN', 'Camila Ruiz', 'admin@sac.local', 'admin', 'Operaciones SAC', 'pbkdf2_sha256$100000$4veLVKg_ukgoNKnIyt-TkA$Lok8aqGPcyWW5OXDjIb9d3wkfSEA7y4dR7y-vXqY044', 1)
ON CONFLICT(`employee_code`) DO UPDATE SET
  `pin_hash` = excluded.`pin_hash`,
  `active` = 1,
  `failed_login_attempts` = 0,
  `locked_until` = NULL,
  `updated_at` = unixepoch();
