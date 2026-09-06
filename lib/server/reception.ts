import { z } from "zod";
import { ApiError } from "./errors";
import { sha256 } from "./crypto";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maximum).optional(),
  );

const confirmationSchema = z
  .object({
    reviewed: z.literal(true),
    shown: z.literal(true),
    manipulation: z.literal(true),
    heat: z.literal(true),
    age: z.literal(true),
    risks: z.literal(true),
    questions: z.literal(true),
  })
  .strict();

export const receptionPayloadSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
    store: z.string().trim().min(2).max(100),
    ot: z.string().trim().min(1).max(60),
    advisor: z.string().trim().min(3).max(120),
    optometrist: optionalText(120),
    client: z.string().trim().min(3).max(160),
    id: z.string().trim().min(5).max(24),
    phone: optionalText(32),
    email: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().email().max(254).optional(),
    ),
    frameMaterial: optionalText(80),
    frameType: optionalText(80),
    brand: optionalText(120),
    frameState: z.string().trim().min(2).max(2_000),
    lensState: optionalText(2_000),
    repairs: optionalText(1_000),
    age: z.string().trim().min(1).max(80),
    observations: optionalText(3_000),
    escalation: optionalText(180),
    legalTextVersion: z.string().trim().min(3).max(80).default("SAC-2026-01"),
    confirmations: confirmationSchema,
  })
  .passthrough();

export type ReceptionPayload = z.infer<typeof receptionPayloadSchema>;
export type CalculatedRisk = {
  level: "bajo" | "medio" | "alto";
  reasons: string[];
};

export function calculateRisk(payload: ReceptionPayload): CalculatedRisk {
  const searchable = [payload.frameState, payload.lensState, payload.repairs]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("es");
  const highReasons: string[] = [];
  const mediumReasons: string[] = [];

  if (/fisur|triz|rotur|quebrad|soldadur|grieta/.test(searchable)) {
    highReasons.push("Se identificó una condición estructural crítica o reparación previa.");
  }
  if (payload.age.toLocaleLowerCase("es").includes("más de 2")) {
    highReasons.push("El armazón registra más de dos años de uso.");
  }
  if (/ray|desgast|flojo|deform|oxid/.test(searchable)) {
    mediumReasons.push("Se identificó desgaste o deformación que requiere documentación.");
  }
  if (/1 a 2|entre 1 y 2/.test(payload.age.toLocaleLowerCase("es"))) {
    mediumReasons.push("El armazón registra entre uno y dos años de uso.");
  }

  if (highReasons.length > 0) return { level: "alto", reasons: highReasons };
  if (mediumReasons.length > 0) return { level: "medio", reasons: mediumReasons };
  return {
    level: "bajo",
    reasons: ["No se registraron señales de riesgo medio o alto."],
  };
}

export type ValidatedUpload = {
  buffer: ArrayBuffer;
  bytes: number;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  sha256: string;
};

function detectedImageType(bytes: Uint8Array): ValidatedUpload["mimeType"] | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    value !== null &&
    typeof value !== "string" &&
    typeof value.arrayBuffer === "function" &&
    typeof value.size === "number"
  );
}

export async function validateImageUpload(
  file: File,
  maximumBytes: number,
  label: string,
): Promise<ValidatedUpload> {
  if (file.size < 1 || file.size > maximumBytes) {
    throw new ApiError(
      422,
      "INVALID_FILE_SIZE",
      `${label} debe pesar entre 1 byte y ${Math.floor(maximumBytes / 1_000_000)} MB.`,
    );
  }
  const buffer = await file.arrayBuffer();
  const detected = detectedImageType(new Uint8Array(buffer));
  if (!detected || detected !== file.type.toLowerCase()) {
    throw new ApiError(
      422,
      "INVALID_FILE_TYPE",
      `${label} debe ser una imagen JPG, PNG o WebP válida.`,
    );
  }
  return {
    buffer,
    bytes: file.size,
    mimeType: detected,
    sha256: await sha256(buffer),
  };
}

export function receiptNumber(receivedOn: string): string {
  const compactDate = receivedOn.replace(/-/g, "");
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `SAC-${compactDate}-${suffix}`;
}

export function extensionForMime(mimeType: ValidatedUpload["mimeType"]): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  return "webp";
}
