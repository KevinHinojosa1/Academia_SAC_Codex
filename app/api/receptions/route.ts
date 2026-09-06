import { getD1 } from "@/db";
import { ApiError, assertSameOrigin, errorResponse, noStoreHeaders } from "@/lib/server/errors";
import {
  calculateRisk,
  extensionForMime,
  isUploadedFile,
  receiptNumber,
  receptionPayloadSchema,
  validateImageUpload,
} from "@/lib/server/reception";
import { getEvidenceBucket } from "@/lib/server/runtime";
import { requireUser } from "@/lib/server/session";

const MAX_REQUEST_BYTES = 24_000_000;
const MAX_PHOTO_BYTES = 5_000_000;
const MAX_SIGNATURE_BYTES = 1_000_000;

export async function POST(request: Request) {
  const uploadedKeys: string[] = [];
  try {
    assertSameOrigin(request);
    const user = await requireUser(request, ["asesor", "optometra", "admin"]);
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      throw new ApiError(
        415,
        "MULTIPART_REQUIRED",
        "Envíe la ficha y sus evidencias como multipart/form-data.",
      );
    }
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "La ficha supera el tamaño permitido.");
    }

    const formData = await request.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string" || rawPayload.length > 100_000) {
      throw new ApiError(400, "INVALID_PAYLOAD", "El campo 'payload' es obligatorio.");
    }
    let json: unknown;
    try {
      json = JSON.parse(rawPayload);
    } catch {
      throw new ApiError(400, "INVALID_PAYLOAD", "El campo 'payload' no contiene JSON válido.");
    }
    const parsed = receptionPayloadSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(
        422,
        "INVALID_RECEPTION",
        parsed.error.issues[0]?.message ?? "La ficha contiene datos inválidos.",
      );
    }
    const payload = parsed.data;
    const calculatedRisk = calculateRisk(payload);
    if (calculatedRisk.level === "alto" && (!payload.escalation || payload.escalation.length < 3)) {
      throw new ApiError(
        422,
        "ESCALATION_REQUIRED",
        "Una recepción de riesgo alto requiere una referencia de escalamiento.",
      );
    }

    const rawPhotos = formData.getAll("photos");
    if (
      rawPhotos.length < 1 ||
      rawPhotos.length > 4 ||
      rawPhotos.some((entry) => !isUploadedFile(entry))
    ) {
      throw new ApiError(422, "INVALID_PHOTOS", "Adjunte entre una y cuatro fotografías válidas.");
    }
    const rawSignature = formData.get("signature");
    if (!isUploadedFile(rawSignature)) {
      throw new ApiError(422, "SIGNATURE_REQUIRED", "Adjunte la firma del cliente como imagen.");
    }

    const [photos, signature] = await Promise.all([
      Promise.all(
        rawPhotos.map((entry, index) =>
          validateImageUpload(entry as File, MAX_PHOTO_BYTES, `Fotografía ${index + 1}`),
        ),
      ),
      validateImageUpload(rawSignature, MAX_SIGNATURE_BYTES, "Firma"),
    ]);
    const receptionId = crypto.randomUUID();
    const number = receiptNumber(payload.date);
    const bucket = getEvidenceBucket();
    const uploads = [
      ...photos.map((photo, index) => ({
        id: crypto.randomUUID(),
        kind: "photo" as const,
        position: index,
        key: `receptions/${receptionId}/photo-${index + 1}-${photo.sha256.slice(0, 12)}.${extensionForMime(photo.mimeType)}`,
        file: photo,
      })),
      {
        id: crypto.randomUUID(),
        kind: "signature" as const,
        position: 0,
        key: `receptions/${receptionId}/signature-${signature.sha256.slice(0, 12)}.${extensionForMime(signature.mimeType)}`,
        file: signature,
      },
    ];
    uploadedKeys.push(...uploads.map((upload) => upload.key));
    const uploadResults = await Promise.allSettled(
      uploads.map((upload) =>
        bucket.put(upload.key, upload.file.buffer, {
          httpMetadata: { contentType: upload.file.mimeType },
          customMetadata: {
            receptionId,
            kind: upload.kind,
            sha256: upload.file.sha256,
          },
        }),
      ),
    );
    if (uploadResults.some((result) => result.status === "rejected")) {
      await bucket.delete(uploadedKeys).catch(() => undefined);
      throw new ApiError(503, "EVIDENCE_UPLOAD_FAILED", "No fue posible guardar todas las evidencias.");
    }

    const {
      date,
      store,
      ot,
      advisor,
      optometrist,
      client,
      id: clientDocument,
      phone,
      email,
      escalation,
      legalTextVersion,
      confirmations,
      ...details
    } = payload;
    const now = Math.floor(Date.now() / 1000);
    const status = calculatedRisk.level === "alto" ? "escalation_pending" : "completed";
    const d1 = getD1();
    const statements = [
      d1
        .prepare(
          `insert into receptions
           (id, receipt_number, created_by, received_on, store, work_order, advisor_name,
            optometrist_name, client_name, client_document, client_phone, client_email,
            risk, risk_reasons_json, escalation_reference, status, legal_text_version,
            confirmations_json, details_json, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          receptionId,
          number,
          user.id,
          date,
          store,
          ot,
          advisor,
          optometrist ?? null,
          client,
          clientDocument,
          phone ?? null,
          email ?? null,
          calculatedRisk.level,
          JSON.stringify(calculatedRisk.reasons),
          escalation ?? null,
          status,
          legalTextVersion,
          JSON.stringify(confirmations),
          JSON.stringify(details),
          now,
          now,
        ),
      ...uploads.map((upload) =>
        d1
          .prepare(
            `insert into evidence
             (id, reception_id, kind, position, object_key, mime_type, bytes, sha256, created_at)
             values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            upload.id,
            receptionId,
            upload.kind,
            upload.position,
            upload.key,
            upload.file.mimeType,
            upload.file.bytes,
            upload.file.sha256,
            now,
          ),
      ),
    ];
    try {
      await d1.batch(statements);
    } catch (error) {
      await bucket.delete(uploadedKeys).catch(() => undefined);
      throw error;
    }

    return Response.json(
      {
        reception: {
          id: receptionId,
          receiptNumber: number,
          risk: calculatedRisk.level,
          riskReasons: calculatedRisk.reasons,
          status,
          evidenceCount: uploads.length,
          createdAt: now,
        },
      },
      { status: 201, headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

// This export prevents accidental static optimization of a write-only, identity-bound route.
export const dynamic = "force-dynamic";
