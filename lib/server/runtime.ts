import { env } from "cloudflare:workers";

export interface EvidenceBucket {
  put(
    key: string,
    value: ArrayBuffer,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
}

export function getEvidenceBucket(): EvidenceBucket {
  const bucket = (env as unknown as { EVIDENCE?: EvidenceBucket }).EVIDENCE;
  if (!bucket) {
    throw new Error(
      "Cloudflare R2 binding `EVIDENCE` is unavailable. Configure the EVIDENCE binding before accepting files.",
    );
  }
  return bucket;
}
