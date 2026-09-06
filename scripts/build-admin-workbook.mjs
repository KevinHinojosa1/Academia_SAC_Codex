import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = fileURLToPath(new URL("../", import.meta.url));
const outputDir = path.join(rootDir, "output", "spreadsheets");
const workbook = Workbook.create();

const palette = {
  navy: "#092B3D",
  ink: "#173846",
  teal: "#08A991",
  mint: "#DDF7F0",
  sky: "#E9F5FA",
  line: "#C8DCE4",
  muted: "#5C7480",
  amber: "#F2B33D",
  coral: "#EF6A5B",
  white: "#FFFFFF",
};

// Create every worksheet before adding cross-sheet formulas.
const summary = workbook.worksheets.add("Resumen");
const receptions = workbook.worksheets.add("Recepciones");
const training = workbook.worksheets.add("Formación");
const collaborators = workbook.worksheets.add("Colaboradores");
const escalations = workbook.worksheets.add("Escalamientos");
const rewards = workbook.worksheets.add("Recompensas");
const dictionary = workbook.worksheets.add("Diccionario");

function setupSheet(sheet, title, subtitle, lastColumn) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${lastColumn}1`).format.rowHeight = 28;
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format.font = { name: "Arial", size: 18, bold: true, color: palette.navy };
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${lastColumn}2`).format.font = { name: "Arial", size: 10, italic: true, color: palette.muted };
  sheet.getRange(`A3:${lastColumn}3`).format.borders = { bottom: { style: "thin", color: palette.line } };
  sheet.freezePanes.freezeRows(4);
}

function styleTable(sheet, range, headerRange) {
  sheet.getRange(range).format.font = { name: "Arial", size: 10, color: palette.ink };
  sheet.getRange(range).format.verticalAlignment = "center";
  sheet.getRange(headerRange).format = {
    fill: palette.navy,
    font: { name: "Arial", size: 9, bold: true, color: palette.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: "#507080" },
  };
  sheet.getRange(headerRange).format.rowHeight = 32;
}

summary.tabColor = palette.teal;
summary.showGridLines = false;
summary.getRange("A1").values = [["SAC - Registro operativo"]];
summary.getRange("A1").format.font = { name: "Arial", size: 20, bold: true, color: palette.navy };
summary.getRange("1:1").format.rowHeight = 36;
summary.getRange("A2").values = [["Plantilla compatible con Excel y lista para importar en Google Sheets · Versión de datos 2026.1"]];
summary.getRange("A2:F2").format.font = { name: "Arial", size: 10, italic: true, color: palette.muted };
summary.getRange("A3:F3").format.borders = { bottom: { style: "thin", color: palette.line } };
summary.getRange("A5:A8").values = [["Recepciones"], ["Riesgo alto"], ["Colaboradores activos"], ["Promedio de formación"]];
summary.getRange("B5").formulas = [["=COUNTA(Recepciones!$A$5:$A$5000)"]];
summary.getRange("B6").formulas = [["=COUNTIF(Recepciones!$Q$5:$Q$5000,\"Alto\")"]];
summary.getRange("B7").formulas = [["=COUNTIF(Colaboradores!$E$5:$E$5000,\"Activo\")"]];
summary.getRange("B8").formulas = [["=IFERROR(AVERAGE('Formación'!$I$5:$I$5000),0)"]];
summary.getRange("A5:B8").format = {
  fill: palette.sky,
  font: { name: "Arial", size: 11, color: palette.ink },
  borders: { preset: "outside", style: "thin", color: palette.line },
};
summary.getRange("A5:A8").format.font = { name: "Arial", size: 10, bold: true, color: palette.ink };
summary.getRange("B5:B8").format.font = { name: "Arial", size: 16, bold: true, color: palette.teal };
summary.getRange("B8").format.numberFormat = "0%";
summary.getRange("D5:F5").values = [["Uso recomendado", null, null]];
summary.getRange("D5:F5").format = { fill: palette.navy, font: { name: "Arial", size: 10, bold: true, color: palette.white } };
summary.getRange("D6:F10").values = [
  ["1. Descargue los datos desde el panel SAC.", null, null],
  ["2. Abra el archivo en Excel o impórtelo en Google Sheets.", null, null],
  ["3. No inserte fotografías ni firmas en este libro.", null, null],
  ["4. Mantenga el acceso limitado al equipo autorizado.", null, null],
  ["5. Consulte Diccionario antes de cambiar columnas.", null, null],
];
summary.getRange("D6:F10").format = { fill: "#F7FAFB", font: { name: "Arial", size: 10, color: palette.ink }, wrapText: true };
summary.getRange("A12:F12").values = [["Nota de privacidad: las exportaciones administrativas pueden contener datos personales. Limite el acceso al equipo autorizado; no incluyen fotografías ni firmas.", null, null, null, null, null]];
summary.mergeCells("A12:F12");
summary.getRange("A12:F12").format = { fill: palette.mint, font: { name: "Arial", size: 10, bold: true, color: palette.ink }, wrapText: true };
summary.getRange("A:A").format.columnWidth = 28;
summary.getRange("B:B").format.columnWidth = 18;
summary.getRange("C:C").format.columnWidth = 4;
summary.getRange("D:F").format.columnWidth = 22;
summary.getRange("6:12").format.rowHeight = 24;
summary.getRange("12:12").format.rowHeight = 32;

setupSheet(receptions, "Recepciones", "Una fila por recepción guardada en SAC. Contiene datos personales: mantenga el acceso restringido.", "V");
const receptionHeaders = ["reception_id", "receipt_number", "created_at_utc", "local", "employee_code", "collaborator_name", "role", "client_name", "client_id_masked", "phone_masked", "email_masked", "ot", "frame_material", "frame_type", "frame_age", "findings", "risk", "status", "escalation_reference", "consent_version", "evidence_count", "updated_at_utc"];
const receptionDemo = ["DEMO-0001", "SAC-2026-DEMO", new Date("2026-09-05T14:00:00Z"), "Local de ejemplo", "DEMO-1001", "Ana Torres", "Asesor", "Cliente de ejemplo", "••••5678", "••••0123", "c••••@example.com", "OT-DEMO", "Acetato", "Completo", "1 a 2 años", "Bisagra con juego leve", "Medio", "Registrado", "", "SAC-2026-01", 3, new Date("2026-09-05T14:05:00Z")];
receptions.getRange("A4:V5").values = [receptionHeaders, receptionDemo];
styleTable(receptions, "A4:V5", "A4:V4");
receptions.tables.add("A4:V5", true, "RecepcionesTable").style = "TableStyleMedium2";
receptions.getRange("C5:C5000").format.numberFormat = "yyyy-mm-dd hh:mm";
receptions.getRange("V5:V5000").format.numberFormat = "yyyy-mm-dd hh:mm";
receptions.getRange("U5:U5000").format.numberFormat = "0";
receptions.getRange("Q5:Q5000").dataValidation = { rule: { type: "list", values: ["Bajo", "Medio", "Alto"] } };
receptions.getRange("Q5:Q5000").conditionalFormats.add("containsText", { text: "Alto", format: { fill: "#FDE8E5", font: { color: palette.coral, bold: true } } });
receptions.getRange("Q5:Q5000").conditionalFormats.add("containsText", { text: "Medio", format: { fill: "#FFF5D8", font: { color: "#9A6811", bold: true } } });
receptions.getRange("Q5:Q5000").conditionalFormats.add("containsText", { text: "Bajo", format: { fill: palette.mint, font: { color: "#087A68", bold: true } } });
receptions.getRange("A:B").format.columnWidth = 21;
receptions.getRange("C:C").format.columnWidth = 20;
receptions.getRange("D:P").format.columnWidth = 18;
receptions.getRange("P:P").format.columnWidth = 34;
receptions.getRange("Q:V").format.columnWidth = 20;

setupSheet(training, "Formación", "Intentos, resultados y versión del contenido utilizado en cada actividad.", "L");
training.getRange("A4:L5").values = [["attempt_id", "employee_code", "collaborator_name", "module_id", "module_title", "activity_type", "score", "max_score", "percentage", "passed", "completed_at_utc", "content_version"], ["ATT-DEMO-01", "DEMO-1001", "Ana Torres", "module-1", "Recepción segura", "Módulo", 5, 6, 5 / 6, true, new Date("2026-09-05T13:30:00Z"), "2026.1"]];
styleTable(training, "A4:L5", "A4:L4");
training.tables.add("A4:L5", true, "FormacionTable").style = "TableStyleMedium2";
training.getRange("G5:H5000").format.numberFormat = "0";
training.getRange("I5:I5000").format.numberFormat = "0%";
training.getRange("K5:K5000").format.numberFormat = "yyyy-mm-dd hh:mm";
training.getRange("A:L").format.columnWidth = 19;
training.getRange("E:E").format.columnWidth = 28;

setupSheet(collaborators, "Colaboradores", "Nómina autorizada y estado formativo. No incluya PIN ni credenciales en exportaciones.", "J");
collaborators.getRange("A4:J7").values = [["employee_code", "full_name", "role", "store", "status", "xp", "coins", "completed_modules", "certification_status", "last_activity_utc"], ["DEMO-1001", "Ana Torres", "Asesor", "Local de ejemplo", "Activo", 80, 20, 1, "En curso", new Date("2026-09-05T13:30:00Z")], ["DEMO-2001", "Diego Vega", "Optómetra", "Local de ejemplo", "Activo", 0, 0, 0, "Pendiente", null], ["DEMO-ADMIN", "Administrador de ejemplo", "Administrador", "Local de ejemplo", "Activo", 0, 0, 0, "No aplica", null]];
styleTable(collaborators, "A4:J7", "A4:J4");
collaborators.tables.add("A4:J7", true, "ColaboradoresTable").style = "TableStyleMedium2";
collaborators.getRange("F5:H5000").format.numberFormat = "0";
collaborators.getRange("J5:J5000").format.numberFormat = "yyyy-mm-dd hh:mm";
collaborators.getRange("E5:E5000").dataValidation = { rule: { type: "list", values: ["Activo", "Inactivo", "Bloqueado"] } };
collaborators.getRange("A:J").format.columnWidth = 21;
collaborators.getRange("B:B").format.columnWidth = 28;

setupSheet(escalations, "Escalamientos", "Casos detenidos por riesgo alto o duda técnica. Toda decisión debe quedar trazable.", "K");
escalations.getRange("A4:K5").values = [["escalation_id", "reception_id", "receipt_number", "requested_at_utc", "requested_by", "store", "reason", "reference", "status", "decided_by", "decided_at_utc"], ["ESC-DEMO-01", "DEMO-0002", "SAC-2026-DEMO-2", new Date("2026-09-05T15:00:00Z"), "DEMO-2001", "Local de ejemplo", "Fisura junto a bisagra", "LLAMADA-DEMO", "Pendiente", "", null]];
styleTable(escalations, "A4:K5", "A4:K4");
escalations.tables.add("A4:K5", true, "EscalamientosTable").style = "TableStyleMedium2";
escalations.getRange("D5:D5000").format.numberFormat = "yyyy-mm-dd hh:mm";
escalations.getRange("K5:K5000").format.numberFormat = "yyyy-mm-dd hh:mm";
escalations.getRange("I5:I5000").dataValidation = { rule: { type: "list", values: ["Pendiente", "Aprobado", "Rechazado"] } };
escalations.getRange("A:K").format.columnWidth = 21;
escalations.getRange("G:G").format.columnWidth = 34;

setupSheet(rewards, "Recompensas", "Libro mayor de XP y SAC Coins. Los saldos se derivan de estos movimientos.", "I");
rewards.getRange("A4:I5").values = [["ledger_id", "employee_code", "collaborator_name", "source_type", "source_id", "xp_delta", "coin_delta", "created_at_utc", "idempotency_key"], ["LED-DEMO-01", "DEMO-1001", "Ana Torres", "module_complete", "module-1", 80, 20, new Date("2026-09-05T13:30:00Z"), "demo-key-01"]];
styleTable(rewards, "A4:I5", "A4:I4");
rewards.tables.add("A4:I5", true, "RecompensasTable").style = "TableStyleMedium2";
rewards.getRange("F5:G5000").format.numberFormat = "+0;-0;0";
rewards.getRange("H5:H5000").format.numberFormat = "yyyy-mm-dd hh:mm";
rewards.getRange("A:I").format.columnWidth = 22;

setupSheet(dictionary, "Diccionario", "Definiciones del archivo. Conserve los nombres técnicos para permitir futuras importaciones.", "E");
const dictionaryRows = [
  ["Hoja", "Campo", "Tipo", "Descripción", "Ejemplo / regla"],
  ["Recepciones", "receipt_number", "Texto", "Número visible y único de la recepción", "SAC-2026-000001"],
  ["Recepciones", "risk", "Categoría", "Nivel calculado por SAC", "Bajo / Medio / Alto"],
  ["Recepciones", "status", "Categoría", "Estado del flujo", "Registrado / escalation_pending"],
  ["Recepciones", "consent_version", "Texto", "Versión exacta del texto confirmado", "SAC-2026-01"],
  ["Formación", "percentage", "Porcentaje", "Puntaje dividido para el máximo posible", "0% a 100%"],
  ["Formación", "content_version", "Texto", "Versión del banco de contenido", "2026.1"],
  ["Colaboradores", "status", "Categoría", "Habilitación de acceso", "Activo / Inactivo / Bloqueado"],
  ["Escalamientos", "reference", "Texto", "Referencia verificable de la consulta", "Código, ticket o registro de llamada"],
  ["Recompensas", "idempotency_key", "Texto", "Clave que evita duplicar una recompensa", "Única por logro"],
  ["Todas", "*_at_utc", "Fecha y hora", "Marca temporal almacenada en UTC", "yyyy-mm-dd hh:mm"],
];
dictionary.getRange(`A4:E${3 + dictionaryRows.length}`).values = dictionaryRows;
styleTable(dictionary, `A4:E${3 + dictionaryRows.length}`, "A4:E4");
dictionary.tables.add(`A4:E${3 + dictionaryRows.length}`, true, "DiccionarioTable").style = "TableStyleMedium2";
dictionary.getRange("A:C").format.columnWidth = 22;
dictionary.getRange("D:D").format.columnWidth = 48;
dictionary.getRange("E:E").format.columnWidth = 35;
dictionary.getRange(`A5:E${3 + dictionaryRows.length}`).format.wrapText = true;

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outputDir, "registro-sac.xlsx"));

const summaryCheck = await workbook.inspect({
  kind: "table",
  range: "Resumen!A1:F12",
  include: "values,formulas",
  tableMaxRows: 14,
  tableMaxCols: 8,
});
console.log(summaryCheck.ndjson);
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const sheetName of ["Resumen", "Recepciones", "Formación", "Colaboradores", "Escalamientos", "Recompensas", "Diccionario"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(path.join(rootDir, "tmp", `spreadsheet-${sheetName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}.png`), bytes);
}
