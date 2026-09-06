"use client";

import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Eraser,
  FileCheck2,
  ImagePlus,
  Loader2,
  PenLine,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

const CONSENT_TEXT =
  "Confirmo que el personal me mostró el estado observado del armazón, me explicó el procedimiento solicitado y los riesgos posibles antes de continuar. Tuve la oportunidad de hacer preguntas y recibí respuestas. Este registro documenta la información entregada; no sustituye las validaciones internas ni determina por sí solo la responsabilidad de las partes.";

// Keeps the complete multipart request comfortably below the hosting limit while
// reserving space for the JSON payload, the PNG signature and multipart headers.
const PHOTO_BUDGET_BYTES = 3 * 1024 * 1024;
const MAX_SOURCE_BYTES = 20_000_000;
const INITIAL_MAX_DIMENSION = 1600;
const MIN_MAX_DIMENSION = 560;

const STEPS = [
  { label: "Identificación", icon: UserRound },
  { label: "Inspección", icon: Camera },
  { label: "Consentimiento", icon: PenLine },
  { label: "Revisión", icon: ClipboardCheck },
] as const;

const FRAME_FINDINGS = [
  "Sin hallazgos relevantes",
  "Rayones o desgaste",
  "Deformación visible",
  "Tornillo flojo o bisagra floja",
  "Oxidación",
  "Fisura o grieta",
  "Trizado o rotura",
  "Soldadura o reparación previa",
] as const;

const LENS_FINDINGS = [
  "Sin novedades visibles",
  "Rayones superficiales",
  "Rayones profundos",
  "Desportillado",
  "Tratamiento deteriorado",
  "Lente flojo",
] as const;

const CONFIRMATIONS = [
  { key: "reviewed", label: "Revisé junto al cliente el armazón y los lentes." },
  { key: "shown", label: "Mostré y señalé al cliente cada hallazgo registrado." },
  { key: "manipulation", label: "Expliqué que la manipulación puede revelar daños no visibles." },
  { key: "heat", label: "Expliqué los riesgos del calor, ajuste o montaje aplicable." },
  { key: "age", label: "Confirmé y registré la antigüedad declarada del armazón." },
  { key: "risks", label: "Comuniqué el nivel de riesgo y los motivos de la evaluación." },
  { key: "questions", label: "El cliente pudo preguntar y recibió respuestas claras." },
] as const;

type ConfirmationKey = (typeof CONFIRMATIONS)[number]["key"];
type Confirmations = Record<ConfirmationKey, boolean>;

type User = {
  fullName: string;
  store: string;
  role: string;
};

type FormState = {
  date: string;
  store: string;
  ot: string;
  advisor: string;
  optometrist: string;
  client: string;
  id: string;
  phone: string;
  email: string;
  frameMaterial: string;
  frameType: string;
  brand: string;
  age: string;
  frameNotes: string;
  lensNotes: string;
  repairs: string;
  observations: string;
  escalation: string;
  signerName: string;
};

type PhotoEvidence = {
  id: string;
  source: File;
  file: File;
  url: string;
};

type RiskAssessment = {
  level: "bajo" | "medio" | "alto";
  reasons: string[];
};

type SavedReception = {
  receiptNumber: string;
  risk: RiskAssessment["level"];
  status: string;
  evidenceCount: number;
};

const emptyConfirmations = (): Confirmations => ({
  reviewed: false,
  shown: false,
  manipulation: false,
  heat: false,
  age: false,
  risks: false,
  questions: false,
});

function localToday(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function initialForm(user: User): FormState {
  return {
    date: localToday(),
    store: user.store,
    ot: "",
    advisor: user.fullName,
    optometrist: "",
    client: "",
    id: "",
    phone: "",
    email: "",
    frameMaterial: "",
    frameType: "",
    brand: "",
    age: "",
    frameNotes: "",
    lensNotes: "",
    repairs: "",
    observations: "",
    escalation: "",
    signerName: "",
  };
}

function joinDetails(items: string[], notes: string, fallback: string): string {
  const parts = items.filter(Boolean);
  if (notes.trim()) parts.push(`Detalle: ${notes.trim()}`);
  return parts.length ? parts.join(". ") : fallback;
}

function calculatePreviewRisk(
  age: string,
  frameFindings: string[],
  lensFindings: string[],
  frameNotes: string,
  repairs: string,
): RiskAssessment {
  const searchable = [...frameFindings, ...lensFindings, frameNotes, repairs]
    .join(" ")
    .toLocaleLowerCase("es");
  const high: string[] = [];
  const medium: string[] = [];

  if (/fisur|grieta|triz|rotur|quebrad|soldadur/.test(searchable)) {
    high.push("Se registró una condición estructural crítica o una reparación previa.");
  }
  if (age === "Más de 2 años") {
    high.push("El armazón tiene más de dos años de uso declarado.");
  }
  if (/ray|desgast|flojo|deform|oxid/.test(searchable)) {
    medium.push("Hay desgaste, deformación o daño visible que debe quedar documentado.");
  }
  if (age === "1 a 2 años") {
    medium.push("El armazón tiene entre uno y dos años de uso declarado.");
  }

  if (high.length) return { level: "alto", reasons: high };
  if (medium.length) return { level: "medio", reasons: medium };
  return {
    level: "bajo",
    reasons: ["No se registraron señales de riesgo medio o alto."],
  };
}

function fieldId(name: string): string {
  return `sac-reception-${name}`;
}

function formatKiB(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KiB`;
}

function jpegName(sourceName: string, index: number): string {
  const stem = sourceName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${stem || `evidencia-${index + 1}`}.jpg`;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== "function") {
      reject(new Error("Este navegador no permite comprimir imágenes con canvas."));
      return;
    }
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("El navegador no pudo convertir una fotografía a JPEG.")),
      "image/jpeg",
      quality,
    );
  });
}

async function decodeOrientedImage(source: File): Promise<ImageBitmap> {
  if (typeof window.createImageBitmap !== "function") {
    throw new Error(
      "Este navegador no puede corregir la orientación de las fotos. Actualízalo o usa Chrome, Edge, Firefox o Safari reciente.",
    );
  }
  try {
    return await window.createImageBitmap(source, { imageOrientation: "from-image" });
  } catch (error) {
    try {
      // `from-image` is the standards default. This fallback supports engines
      // that implement createImageBitmap but reject the explicit option.
      return await window.createImageBitmap(source);
    } catch {
      throw new Error(
        `No se pudo leer “${source.name}”. Comprueba que sea una imagen JPG, PNG o WebP válida.`,
        { cause: error },
      );
    }
  }
}

async function constrainDecodedImage(bitmap: ImageBitmap): Promise<ImageBitmap> {
  const longestSide = Math.max(bitmap.width, bitmap.height);
  if (!longestSide || !Number.isFinite(longestSide)) {
    bitmap.close();
    throw new Error("Una fotografía no contiene dimensiones válidas.");
  }
  if (longestSide <= INITIAL_MAX_DIMENSION) return bitmap;

  const scale = INITIAL_MAX_DIMENSION / longestSide;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  try {
    const resized = await window.createImageBitmap(bitmap, {
      imageOrientation: "none",
      resizeHeight: height,
      resizeQuality: "high",
      resizeWidth: width,
    });
    bitmap.close();
    return resized;
  } catch {
    // A few older engines support orientation decoding but not bitmap resize.
    // Keeping the decoded image is safe: renderJpeg still limits its output.
    return bitmap;
  }
}

async function renderJpeg(
  bitmap: ImageBitmap,
  maximumDimension: number,
  quality: number,
): Promise<Blob> {
  const longestSide = Math.max(bitmap.width, bitmap.height);
  if (!longestSide || !Number.isFinite(longestSide)) {
    throw new Error("Una fotografía no contiene dimensiones válidas.");
  }
  const scale = Math.min(1, maximumDimension / longestSide);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error(
      "Este navegador no ofrece el canvas necesario para preparar las fotografías.",
    );
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  // Drawing the EXIF-oriented ImageBitmap into a fresh canvas flattens that
  // orientation, so the JPEG looks the same in previews, storage and exports.
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await canvasToJpeg(canvas, quality);
  canvas.width = 1;
  canvas.height = 1;
  return blob;
}

async function preparePhotoBatch(sources: File[]): Promise<File[]> {
  if (typeof document === "undefined") {
    throw new Error("La preparación de fotos solo está disponible en el navegador.");
  }
  const probe = document.createElement("canvas");
  if (!probe.getContext("2d") || typeof probe.toBlob !== "function") {
    throw new Error(
      "Este navegador no admite el procesamiento seguro de fotografías. Actualízalo para continuar.",
    );
  }

  const bitmaps: ImageBitmap[] = [];
  try {
    // Decode one source at a time and retain only a bounded bitmap. This avoids
    // holding four full-resolution phone photographs in memory simultaneously.
    for (const source of sources) {
      bitmaps.push(await constrainDecodedImage(await decodeOrientedImage(source)));
    }

    let maximumDimension = INITIAL_MAX_DIMENSION;
    let quality = 0.82;
    let latest: Blob[] = [];

    for (let attempt = 0; attempt < 18; attempt += 1) {
      latest = [];
      for (const bitmap of bitmaps) {
        latest.push(await renderJpeg(bitmap, maximumDimension, quality));
      }
      const total = latest.reduce((sum, blob) => sum + blob.size, 0);
      if (total <= PHOTO_BUDGET_BYTES) {
        return latest.map(
          (blob, index) =>
            new File([blob], jpegName(sources[index].name, index), {
              type: "image/jpeg",
              lastModified: sources[index].lastModified,
            }),
        );
      }

      if (quality > 0.46) {
        quality = Math.max(0.42, quality - 0.1);
        continue;
      }

      if (maximumDimension > MIN_MAX_DIMENSION) {
        const ratio = PHOTO_BUDGET_BYTES / total;
        maximumDimension = Math.max(
          MIN_MAX_DIMENSION,
          Math.floor(maximumDimension * Math.max(0.68, Math.sqrt(ratio) * 0.94)),
        );
        quality = 0.7;
        continue;
      }

      quality = Math.max(0.26, quality - 0.06);
    }

    const finalTotal = latest.reduce((sum, blob) => sum + blob.size, 0);
    throw new Error(
      `No fue posible reducir el lote por debajo de ${formatKiB(PHOTO_BUDGET_BYTES)} (resultado: ${formatKiB(finalTotal)}). Prueba con otras fotos.`,
    );
  } finally {
    bitmaps.forEach((bitmap) => bitmap.close());
  }
}

export default function ReceptionWorkflow({
  user,
  onSaved,
}: {
  user: User;
  onSaved?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => initialForm(user));
  const [frameFindings, setFrameFindings] = useState<string[]>([]);
  const [lensFindings, setLensFindings] = useState<string[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmations>(emptyConfirmations);
  const [photos, setPhotos] = useState<PhotoEvidence[]>([]);
  const [hasInk, setHasInk] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [preparingPhotos, setPreparingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedReception | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const strokeDrawnRef = useRef(false);
  const drawnSignatureRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const photoUrlsRef = useRef(new Set<string>());

  const risk = useMemo(
    () =>
      calculatePreviewRisk(
        form.age,
        frameFindings,
        lensFindings,
        form.frameNotes,
        form.repairs,
      ),
    [form.age, form.frameNotes, form.repairs, frameFindings, lensFindings],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "#12324a";
    context.lineCap = "round";
    context.lineJoin = "round";
    if (drawnSignatureRef.current) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = drawnSignatureRef.current;
    }
  }, [step]);

  useEffect(() => {
    const urls = photoUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const errorKey = key === "signerName" ? "signature" : key;
      if (!current[errorKey]) return current;
      const next = { ...current };
      delete next[errorKey];
      return next;
    });
  };

  const toggleFinding = (
    value: string,
    normalValue: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (value === normalValue) return [value];
      return [...current.filter((item) => item !== normalValue), value];
    });
    setErrors((current) => {
      if (!current.inspection) return current;
      const next = { ...current };
      delete next.inspection;
      return next;
    });
  };

  const validateStep = (targetStep: number, includeAll = false): boolean => {
    const next: Record<string, string> = includeAll ? {} : { ...errors };
    const setOrClear = (key: string, value?: string) => {
      if (value) next[key] = value;
      else delete next[key];
    };

    if (includeAll || targetStep === 0) {
      setOrClear("date", /^\d{4}-\d{2}-\d{2}$/.test(form.date) ? undefined : "Selecciona una fecha válida.");
      setOrClear("store", form.store.trim().length >= 2 ? undefined : "La tienda es obligatoria.");
      setOrClear("ot", form.ot.trim() ? undefined : "Ingresa el número de orden de trabajo.");
      setOrClear("advisor", form.advisor.trim().length >= 3 ? undefined : "Ingresa el nombre del asesor.");
      setOrClear("client", form.client.trim().length >= 3 ? undefined : "Ingresa el nombre completo del cliente.");
      setOrClear("id", form.id.trim().length >= 5 ? undefined : "Ingresa un documento válido de al menos 5 caracteres.");
      setOrClear(
        "email",
        !form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
          ? undefined
          : "Ingresa un correo válido o deja el campo vacío.",
      );
    }

    if (includeAll || targetStep === 1) {
      setOrClear("age", form.age ? undefined : "Selecciona la antigüedad del armazón.");
      setOrClear(
        "inspection",
        frameFindings.length ? undefined : "Selecciona al menos un hallazgo del armazón.",
      );
      setOrClear("photos", photos.length >= 1 ? undefined : "Adjunta al menos una fotografía.");
    }

    if (includeAll || targetStep === 2) {
      setOrClear(
        "confirmations",
        Object.values(confirmations).every(Boolean)
          ? undefined
          : "Debes completar las siete confirmaciones informadas.",
      );
      setOrClear(
        "signature",
        hasInk || form.signerName.trim().length >= 3
          ? undefined
          : "Solicita una firma dibujada o escribe el nombre del firmante.",
      );
    }

    if (includeAll || targetStep === 3) {
      setOrClear(
        "escalation",
        risk.level !== "alto" || form.escalation.trim().length >= 3
          ? undefined
          : "El riesgo alto exige una referencia de escalamiento.",
      );
    }

    setErrors(next);
    const relevantKeys =
      targetStep === 0
        ? ["date", "store", "ot", "advisor", "client", "id", "email"]
        : targetStep === 1
          ? ["age", "inspection", "photos"]
          : targetStep === 2
            ? ["confirmations", "signature"]
            : ["escalation"];
    const valid = includeAll ? Object.keys(next).length === 0 : relevantKeys.every((key) => !next[key]);
    if (!valid) setMessage("Revisa los campos marcados antes de continuar.");
    return valid;
  };

  const goNext = () => {
    if (preparingPhotos) {
      setMessage("Espera a que SAC termine de preparar las fotografías.");
      return;
    }
    if (!validateStep(step)) return;
    setMessage("");
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setMessage("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const addPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    event.target.value = "";
    const remaining = 4 - photos.length;
    const accepted = incoming
      .filter(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
          file.size > 0 &&
          file.size <= MAX_SOURCE_BYTES,
      )
      .slice(0, remaining);

    const rejected = incoming.length - accepted.length;
    if (!accepted.length) {
      setMessage(
        incoming.length
          ? "No se añadieron fotos. Usa archivos JPG, PNG o WebP de hasta 20 MB y un máximo de cuatro evidencias."
          : "Selecciona al menos una fotografía.",
      );
      return;
    }

    setPreparingPhotos(true);
    setMessage(
      `Preparando ${accepted.length === 1 ? "la fotografía" : "las fotografías"}: corrigiendo orientación y optimizando el envío…`,
    );

    try {
      const sources = [...photos.map((photo) => photo.source), ...accepted];
      const prepared = await preparePhotoBatch(sources);
      const newUrls: string[] = [];
      let nextPhotos: PhotoEvidence[];
      try {
        nextPhotos = prepared.map((file, index) => {
          const url = URL.createObjectURL(file);
          newUrls.push(url);
          return {
            id: photos[index]?.id ?? crypto.randomUUID(),
            source: sources[index],
            file,
            url,
          };
        });
      } catch (error) {
        newUrls.forEach((url) => URL.revokeObjectURL(url));
        throw error;
      }

      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.url);
        photoUrlsRef.current.delete(photo.url);
      });
      newUrls.forEach((url) => photoUrlsRef.current.add(url));
      setPhotos(nextPhotos);
      setErrors((current) => {
        const next = { ...current };
        delete next.photos;
        return next;
      });
      const total = prepared.reduce((sum, file) => sum + file.size, 0);
      setMessage(
        rejected > 0
          ? `${accepted.length} ${accepted.length === 1 ? "fotografía preparada" : "fotografías preparadas"} (${formatKiB(total)} en total). Otros archivos no cumplieron el formato, tamaño o límite.`
          : `${accepted.length} ${accepted.length === 1 ? "fotografía preparada" : "fotografías preparadas"}. Lote optimizado: ${formatKiB(total)}.`,
      );
    } catch (error) {
      const safeMessage =
        error instanceof Error
          ? error.message
          : "No fue posible preparar las fotografías en este navegador. Actualízalo o prueba con otras imágenes.";
      setMessage(safeMessage);
      if (!photos.length) {
        setErrors((current) => ({ ...current, photos: safeMessage }));
      }
    } finally {
      setPreparingPhotos(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        photoUrlsRef.current.delete(target.url);
      }
      return current.filter((photo) => photo.id !== id);
    });
  };

  const canvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineWidth = 5 * (canvas.width / canvas.getBoundingClientRect().width);
    drawingRef.current = true;
    strokeDrawnRef.current = false;
  };

  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = canvasPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    strokeDrawnRef.current = true;
    setHasInk(true);
    setErrors((current) => {
      if (!current.signature) return current;
      const next = { ...current };
      delete next.signature;
      return next;
    });
  };

  const stopDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    event.currentTarget.getContext("2d")?.closePath();
    if (strokeDrawnRef.current) {
      drawnSignatureRef.current = event.currentTarget.toDataURL("image/png");
      setHasInk(true);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#12324a";
      context.lineCap = "round";
      context.lineJoin = "round";
    }
    setHasInk(false);
    strokeDrawnRef.current = false;
    drawnSignatureRef.current = null;
    setMessage("Área de firma limpia.");
  };

  const canvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo crear la firma."))), "image/png");
    });

  const createSignature = async (): Promise<File> => {
    if (hasInk && drawnSignatureRef.current) {
      const blob = await fetch(drawnSignatureRef.current).then((response) => response.blob());
      return new File([blob], "firma-sac.png", { type: "image/png" });
    }

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 260;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la firma accesible.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#12324a";
    context.font = "italic 54px Georgia, serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(form.signerName.trim(), canvas.width / 2, 112, 760);
    context.strokeStyle = "#91a7b8";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(90, 184);
    context.lineTo(810, 184);
    context.stroke();
    context.fillStyle = "#60788b";
    context.font = "24px Arial, sans-serif";
    context.fillText("Confirmación escrita por el cliente", canvas.width / 2, 218);
    return new File([await canvasBlob(canvas)], "firma-escrita-sac.png", { type: "image/png" });
  };

  const payload = () => ({
    date: form.date,
    store: form.store.trim(),
    ot: form.ot.trim(),
    advisor: form.advisor.trim(),
    optometrist: form.optometrist.trim() || undefined,
    client: form.client.trim(),
    id: form.id.trim(),
    phone: form.phone.trim() || undefined,
    email: form.email.trim() || undefined,
    frameMaterial: form.frameMaterial.trim() || undefined,
    frameType: form.frameType.trim() || undefined,
    brand: form.brand.trim() || undefined,
    frameState: joinDetails(frameFindings, form.frameNotes, "Sin hallazgos relevantes"),
    lensState: joinDetails(lensFindings, form.lensNotes, "Sin novedades visibles"),
    repairs: form.repairs.trim() || undefined,
    age: form.age,
    observations: form.observations.trim() || undefined,
    escalation: form.escalation.trim() || undefined,
    legalTextVersion: "SAC-2026-01",
    confirmations: {
      reviewed: true as const,
      shown: true as const,
      manipulation: true as const,
      heat: true as const,
      age: true as const,
      risks: true as const,
      questions: true as const,
    },
  });

  const submit = async () => {
    if (preparingPhotos) {
      setMessage("Espera a que SAC termine de preparar las fotografías.");
      return;
    }
    if (!validateStep(3, true)) return;
    setSaving(true);
    setMessage("Guardando ficha y evidencias de forma segura…");
    try {
      const body = new FormData();
      body.append("payload", JSON.stringify(payload()));
      photos.forEach((photo) => body.append("photos", photo.file, photo.file.name));
      body.append("signature", await createSignature());

      const response = await fetch("/api/receptions", { method: "POST", body });
      const result = (await response.json().catch(() => null)) as
        | { reception?: SavedReception; error?: { message?: string } }
        | null;
      if (!response.ok || !result?.reception) {
        throw new Error(result?.error?.message ?? "No fue posible guardar la recepción.");
      }

      setSaved(result.reception);
      setMessage(`Recepción ${result.reception.receiptNumber} guardada correctamente.`);
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible guardar la recepción.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.url);
      photoUrlsRef.current.delete(photo.url);
    });
    setForm(initialForm(user));
    setFrameFindings([]);
    setLensFindings([]);
    setConfirmations(emptyConfirmations());
    setPhotos([]);
    setErrors({});
    setSaved(null);
    setStep(0);
    clearSignature();
    setMessage("Nueva ficha lista para completar.");
  };

  const errorFor = (key: string) =>
    errors[key] ? (
      <span className="sac-field-error" id={`${fieldId(key)}-error`} role="alert">
        <CircleAlert aria-hidden="true" />
        {errors[key]}
      </span>
    ) : null;

  if (saved) {
    return (
      <section className="sac-reception-success" aria-labelledby="sac-saved-title">
        <div className="sac-success-seal" aria-hidden="true">
          <FileCheck2 />
        </div>
        <p className="sac-eyebrow">Registro protegido</p>
        <h2 id="sac-saved-title">Recepción guardada</h2>
        <p>
          La ficha, {saved.evidenceCount - 1} {saved.evidenceCount - 1 === 1 ? "fotografía" : "fotografías"} y la firma
          quedaron asociadas al comprobante.
        </p>
        <dl className="sac-saved-summary">
          <div>
            <dt>Comprobante</dt>
            <dd>{saved.receiptNumber}</dd>
          </div>
          <div>
            <dt>Riesgo</dt>
            <dd className={`sac-risk-text sac-risk-${saved.risk}`}>{saved.risk}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{saved.status === "escalation_pending" ? "Escalamiento pendiente" : "Completada"}</dd>
          </div>
        </dl>
        <button className="sac-button sac-button-primary" type="button" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Registrar otra recepción
        </button>
      </section>
    );
  }

  return (
    <section className="sac-reception" aria-labelledby="sac-reception-title">
      <header className="sac-reception-header">
        <div>
          <p className="sac-eyebrow">Recepción segura · SAC</p>
          <h1 id="sac-reception-title">Nueva ficha de recepción</h1>
          <p>Documenta la condición del armazón, informa los riesgos y conserva evidencia verificable.</p>
        </div>
        <div className={`sac-live-risk sac-risk-${risk.level}`} aria-label={`Riesgo preliminar: ${risk.level}`}>
          {risk.level === "alto" ? <ShieldAlert aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
          <span>
            Riesgo preliminar
            <strong>{risk.level}</strong>
          </span>
        </div>
      </header>

      <ol className="sac-stepper" aria-label="Progreso de la ficha">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <li
              className={index === step ? "sac-step-active" : index < step ? "sac-step-complete" : ""}
              aria-current={index === step ? "step" : undefined}
              key={item.label}
            >
              <span className="sac-step-icon" aria-hidden="true">
                {index < step ? <Check /> : <Icon />}
              </span>
              <span>
                <small>Paso {index + 1}</small>
                <strong>{item.label}</strong>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="sac-status-message" aria-live="polite" aria-atomic="true">
        {message}
      </p>

      <div className="sac-reception-card">
        <h2 className="sac-sr-focus" ref={headingRef} tabIndex={-1}>
          {STEPS[step].label}
        </h2>

        {step === 0 && (
          <div className="sac-step-panel">
            <div className="sac-section-copy">
              <span>01</span>
              <div>
                <h3>Identifica la atención</h3>
                <p>Los campos con * son obligatorios. Verifica la información antes de continuar.</p>
              </div>
            </div>
            <div className="sac-form-grid">
              <label className="sac-field">
                <span>Fecha *</span>
                <input
                  aria-describedby={errors.date ? `${fieldId("date")}-error` : undefined}
                  aria-invalid={Boolean(errors.date)}
                  id={fieldId("date")}
                  max={localToday()}
                  onChange={(event) => update("date", event.target.value)}
                  type="date"
                  value={form.date}
                />
                {errorFor("date")}
              </label>
              <label className="sac-field">
                <span>Tienda *</span>
                <input
                  aria-describedby={errors.store ? `${fieldId("store")}-error` : undefined}
                  aria-invalid={Boolean(errors.store)}
                  id={fieldId("store")}
                  maxLength={100}
                  onChange={(event) => update("store", event.target.value)}
                  value={form.store}
                />
                {errorFor("store")}
              </label>
              <label className="sac-field">
                <span>Orden de trabajo (OT) *</span>
                <input
                  aria-describedby={errors.ot ? `${fieldId("ot")}-error` : undefined}
                  aria-invalid={Boolean(errors.ot)}
                  autoComplete="off"
                  id={fieldId("ot")}
                  maxLength={60}
                  onChange={(event) => update("ot", event.target.value)}
                  placeholder="Ej. OT-20458"
                  value={form.ot}
                />
                {errorFor("ot")}
              </label>
              <label className="sac-field">
                <span>Asesor responsable *</span>
                <input
                  aria-describedby={errors.advisor ? `${fieldId("advisor")}-error` : undefined}
                  aria-invalid={Boolean(errors.advisor)}
                  autoComplete="name"
                  id={fieldId("advisor")}
                  maxLength={120}
                  onChange={(event) => update("advisor", event.target.value)}
                  value={form.advisor}
                />
                <small>Sesión activa: {user.role}</small>
                {errorFor("advisor")}
              </label>
              <label className="sac-field">
                <span>Optómetra</span>
                <input
                  autoComplete="name"
                  id={fieldId("optometrist")}
                  maxLength={120}
                  onChange={(event) => update("optometrist", event.target.value)}
                  placeholder="Opcional"
                  value={form.optometrist}
                />
              </label>
              <label className="sac-field">
                <span>Cliente *</span>
                <input
                  aria-describedby={errors.client ? `${fieldId("client")}-error` : undefined}
                  aria-invalid={Boolean(errors.client)}
                  autoComplete="name"
                  id={fieldId("client")}
                  maxLength={160}
                  onChange={(event) => update("client", event.target.value)}
                  value={form.client}
                />
                {errorFor("client")}
              </label>
              <label className="sac-field">
                <span>Documento de identidad *</span>
                <input
                  aria-describedby={errors.id ? `${fieldId("id")}-error` : undefined}
                  aria-invalid={Boolean(errors.id)}
                  autoComplete="off"
                  id={fieldId("id")}
                  maxLength={24}
                  onChange={(event) => update("id", event.target.value)}
                  value={form.id}
                />
                {errorFor("id")}
              </label>
              <label className="sac-field">
                <span>Teléfono</span>
                <input
                  autoComplete="tel"
                  id={fieldId("phone")}
                  inputMode="tel"
                  maxLength={32}
                  onChange={(event) => update("phone", event.target.value)}
                  value={form.phone}
                />
              </label>
              <label className="sac-field sac-field-wide">
                <span>Correo electrónico</span>
                <input
                  aria-describedby={errors.email ? `${fieldId("email")}-error` : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  id={fieldId("email")}
                  maxLength={254}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="cliente@ejemplo.com"
                  type="email"
                  value={form.email}
                />
                {errorFor("email")}
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="sac-step-panel">
            <div className="sac-section-copy">
              <span>02</span>
              <div>
                <h3>Inspecciona y documenta</h3>
                <p>Selecciona los hallazgos reales y adjunta entre una y cuatro fotografías nítidas.</p>
              </div>
            </div>

            <div className="sac-form-grid sac-form-grid-four">
              <label className="sac-field">
                <span>Material</span>
                <select value={form.frameMaterial} onChange={(event) => update("frameMaterial", event.target.value)}>
                  <option value="">Selecciona</option>
                  <option>Acetato</option>
                  <option>Metal</option>
                  <option>Titanio</option>
                  <option>TR90 / Nylon</option>
                  <option>Mixto</option>
                  <option>Otro</option>
                </select>
              </label>
              <label className="sac-field">
                <span>Tipo de armazón</span>
                <select value={form.frameType} onChange={(event) => update("frameType", event.target.value)}>
                  <option value="">Selecciona</option>
                  <option>Aro completo</option>
                  <option>Semi al aire</option>
                  <option>Al aire</option>
                  <option>Deportivo</option>
                  <option>Solar</option>
                  <option>Otro</option>
                </select>
              </label>
              <label className="sac-field">
                <span>Marca</span>
                <input maxLength={120} onChange={(event) => update("brand", event.target.value)} value={form.brand} />
              </label>
              <label className="sac-field">
                <span>Antigüedad *</span>
                <select
                  aria-describedby={errors.age ? `${fieldId("age")}-error` : undefined}
                  aria-invalid={Boolean(errors.age)}
                  id={fieldId("age")}
                  onChange={(event) => update("age", event.target.value)}
                  value={form.age}
                >
                  <option value="">Selecciona</option>
                  <option>Menos de 1 año</option>
                  <option>1 a 2 años</option>
                  <option>Más de 2 años</option>
                  <option>No determinada</option>
                </select>
                {errorFor("age")}
              </label>
            </div>

            <fieldset className="sac-choice-fieldset" aria-describedby={errors.inspection ? `${fieldId("inspection")}-error` : undefined}>
              <legend>Estado del armazón *</legend>
              <div className="sac-choice-grid">
                {FRAME_FINDINGS.map((finding) => (
                  <label className={frameFindings.includes(finding) ? "sac-choice-selected" : ""} key={finding}>
                    <input
                      checked={frameFindings.includes(finding)}
                      onChange={() => toggleFinding(finding, FRAME_FINDINGS[0], setFrameFindings)}
                      type="checkbox"
                    />
                    <span aria-hidden="true"><Check /></span>
                    {finding}
                  </label>
                ))}
              </div>
              {errorFor("inspection")}
            </fieldset>

            <label className="sac-field">
              <span>Detalle del armazón</span>
              <textarea
                maxLength={2000}
                onChange={(event) => update("frameNotes", event.target.value)}
                placeholder="Ubicación, dimensión aproximada y cualquier detalle útil…"
                rows={3}
                value={form.frameNotes}
              />
            </label>

            <fieldset className="sac-choice-fieldset">
              <legend>Estado de los lentes</legend>
              <div className="sac-choice-grid">
                {LENS_FINDINGS.map((finding) => (
                  <label className={lensFindings.includes(finding) ? "sac-choice-selected" : ""} key={finding}>
                    <input
                      checked={lensFindings.includes(finding)}
                      onChange={() => toggleFinding(finding, LENS_FINDINGS[0], setLensFindings)}
                      type="checkbox"
                    />
                    <span aria-hidden="true"><Check /></span>
                    {finding}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sac-form-grid">
              <label className="sac-field">
                <span>Detalle de lentes</span>
                <textarea maxLength={2000} onChange={(event) => update("lensNotes", event.target.value)} rows={3} value={form.lensNotes} />
              </label>
              <label className="sac-field">
                <span>Reparaciones o intervenciones previas</span>
                <textarea
                  maxLength={1000}
                  onChange={(event) => update("repairs", event.target.value)}
                  placeholder="Describe soldaduras, pegamentos, cambios de pieza…"
                  rows={3}
                  value={form.repairs}
                />
              </label>
              <label className="sac-field sac-field-wide">
                <span>Observaciones adicionales</span>
                <textarea maxLength={3000} onChange={(event) => update("observations", event.target.value)} rows={3} value={form.observations} />
              </label>
            </div>

            <div className="sac-photo-uploader">
              <div>
                <ImagePlus aria-hidden="true" />
                <div>
                  <h4>Evidencia fotográfica *</h4>
                  <p>
                    JPG, PNG o WebP · máximo 20 MB de origen · {photos.length}/4 adjuntas
                  </p>
                  <small>
                    SAC corrige la orientación y optimiza el lote completo para un envío seguro sin perder legibilidad.
                  </small>
                </div>
              </div>
              <input
                accept="image/jpeg,image/png,image/webp"
                aria-describedby={errors.photos ? `${fieldId("photos")}-error` : undefined}
                aria-invalid={Boolean(errors.photos)}
                capture="environment"
                disabled={preparingPhotos}
                id={fieldId("photos")}
                multiple
                onChange={addPhotos}
                ref={inputRef}
                type="file"
              />
              <button
                className="sac-button sac-button-secondary"
                disabled={photos.length >= 4 || preparingPhotos}
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {preparingPhotos ? (
                  <Loader2 className="sac-spin" aria-hidden="true" />
                ) : (
                  <UploadCloud aria-hidden="true" />
                )}
                {preparingPhotos
                  ? "Optimizando…"
                  : photos.length
                    ? "Añadir otra foto"
                    : "Seleccionar fotos"}
              </button>
              {errorFor("photos")}
            </div>

            {photos.length > 0 && (
              <ul className="sac-photo-grid" aria-label="Fotografías adjuntas">
                {photos.map((photo, index) => (
                  <li key={photo.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={`Evidencia ${index + 1}: ${photo.file.name}`} src={photo.url} />
                    <span>Foto {index + 1}</span>
                    <button
                      aria-label={`Eliminar fotografía ${index + 1}`}
                      disabled={preparingPhotos}
                      onClick={() => removePhoto(photo.id)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="sac-step-panel">
            <div className="sac-section-copy">
              <span>03</span>
              <div>
                <h3>Confirma la información entregada</h3>
                <p>Lee cada punto con el cliente. Las siete confirmaciones son obligatorias.</p>
              </div>
            </div>

            <div className="sac-consent-box">
              <ShieldCheck aria-hidden="true" />
              <div>
                <h4>Consentimiento informado · versión SAC-2026-01</h4>
                <p>{CONSENT_TEXT}</p>
              </div>
            </div>

            <fieldset className="sac-confirmations" aria-describedby={errors.confirmations ? `${fieldId("confirmations")}-error` : undefined}>
              <legend>Siete verificaciones obligatorias</legend>
              {CONFIRMATIONS.map((confirmation, index) => (
                <label className={confirmations[confirmation.key] ? "sac-confirmed" : ""} key={confirmation.key}>
                  <input
                    checked={confirmations[confirmation.key]}
                    onChange={(event) => {
                      setConfirmations((current) => ({ ...current, [confirmation.key]: event.target.checked }));
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.confirmations;
                        return next;
                      });
                    }}
                    type="checkbox"
                  />
                  <span className="sac-confirm-number">{index + 1}</span>
                  <span>{confirmation.label}</span>
                  <Check aria-hidden="true" />
                </label>
              ))}
              {errorFor("confirmations")}
            </fieldset>

            <div className="sac-signature-block" aria-describedby={errors.signature ? `${fieldId("signature")}-error` : undefined}>
              <div className="sac-signature-heading">
                <div>
                  <h4>Firma del cliente *</h4>
                  <p>Puede firmar con el dedo, mouse o lápiz digital.</p>
                </div>
                <button className="sac-button sac-button-ghost" onClick={clearSignature} type="button">
                  <Eraser aria-hidden="true" />
                  Limpiar
                </button>
              </div>
              <canvas
                aria-label="Área para dibujar la firma del cliente"
                className="sac-signature-canvas"
                height={320}
                onPointerCancel={stopDrawing}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                ref={canvasRef}
                role="img"
                tabIndex={0}
                width={1200}
              />
              <div className="sac-signature-divider"><span>o usa la alternativa accesible</span></div>
              <label className="sac-field">
                <span>Nombre escrito por el firmante</span>
                <input
                  autoComplete="name"
                  maxLength={160}
                  onChange={(event) => update("signerName", event.target.value)}
                  placeholder="Nombre completo"
                  value={form.signerName}
                />
                <small>Escribir el nombre genera una constancia visual que se guarda como firma.</small>
              </label>
              {errorFor("signature")}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="sac-step-panel">
            <div className="sac-section-copy">
              <span>04</span>
              <div>
                <h3>Revisa antes de guardar</h3>
                <p>La evaluación del servidor será la definitiva y quedará registrada con las evidencias.</p>
              </div>
            </div>

            <div className={`sac-risk-review sac-risk-${risk.level}`}>
              <div className="sac-risk-review-icon" aria-hidden="true">
                {risk.level === "alto" ? <ShieldAlert /> : <ShieldCheck />}
              </div>
              <div>
                <span>Evaluación preliminar</span>
                <h3>Riesgo {risk.level}</h3>
                <ul>
                  {risk.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            </div>

            {risk.level === "alto" && (
              <label className="sac-field sac-escalation-field">
                <span>Referencia de escalamiento *</span>
                <input
                  aria-describedby={errors.escalation ? `${fieldId("escalation")}-error` : `${fieldId("escalation")}-hint`}
                  aria-invalid={Boolean(errors.escalation)}
                  id={fieldId("escalation")}
                  maxLength={180}
                  onChange={(event) => update("escalation", event.target.value)}
                  placeholder="Ej. ESC-2026-014 · responsable o ticket"
                  value={form.escalation}
                />
                <small id={`${fieldId("escalation")}-hint`}>El servidor no permitirá guardar un riesgo alto sin esta referencia.</small>
                {errorFor("escalation")}
              </label>
            )}

            <dl className="sac-review-grid">
              <div><dt>Cliente</dt><dd>{form.client}</dd></div>
              <div><dt>Documento</dt><dd>{form.id}</dd></div>
              <div><dt>OT</dt><dd>{form.ot}</dd></div>
              <div><dt>Tienda</dt><dd>{form.store}</dd></div>
              <div><dt>Asesor</dt><dd>{form.advisor}</dd></div>
              <div><dt>Antigüedad</dt><dd>{form.age}</dd></div>
              <div className="sac-review-wide"><dt>Estado del armazón</dt><dd>{joinDetails(frameFindings, form.frameNotes, "Sin hallazgos relevantes")}</dd></div>
              <div className="sac-review-wide"><dt>Estado de lentes</dt><dd>{joinDetails(lensFindings, form.lensNotes, "Sin novedades visibles")}</dd></div>
              <div><dt>Evidencias</dt><dd>{photos.length} {photos.length === 1 ? "fotografía" : "fotografías"} + firma</dd></div>
              <div><dt>Consentimiento</dt><dd>7 de 7 confirmaciones</dd></div>
            </dl>

            <div className="sac-final-notice">
              <FileCheck2 aria-hidden="true" />
              <p>
                Al guardar, SAC asociará esta ficha, las fotografías y la firma a un comprobante único. No cierres esta pantalla hasta ver la confirmación.
              </p>
            </div>
          </div>
        )}

        <footer className="sac-form-actions">
          <button
            className="sac-button sac-button-secondary"
            disabled={step === 0 || saving || preparingPhotos}
            onClick={goBack}
            type="button"
          >
            <ChevronLeft aria-hidden="true" />
            Anterior
          </button>
          <span>Paso {step + 1} de {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <button
              className="sac-button sac-button-primary"
              disabled={preparingPhotos}
              onClick={goNext}
              type="button"
            >
              Continuar
              <ChevronRight aria-hidden="true" />
            </button>
          ) : (
            <button
              className="sac-button sac-button-primary"
              disabled={saving || preparingPhotos}
              onClick={submit}
              type="button"
            >
              {saving ? <Loader2 className="sac-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
              {saving ? "Guardando…" : "Guardar recepción"}
            </button>
          )}
        </footer>
      </div>
    </section>
  );
}
