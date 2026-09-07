# SAC · Recepción segura

Plataforma de formación, práctica y trazabilidad para la recepción segura de armazones. Incluye ocho experiencias formativas con microvideos, 24 ejemplos visuales y práctica guiada sin cuestionarios, seis simuladores, trivias, evaluación final, certificación, asistente SACI, ficha digital con fotografías y firma, ranking y exportaciones.

## Puesta en marcha

Requiere Node.js 22.13 o posterior.

```bash
npm install
npm run dev
```

Para validar una entrega:

```bash
npm test
npm run lint
npx tsc --noEmit
```

## Accesos de prueba piloto

| Perfil | Código | PIN |
|---|---|---|
| Asesor | `SAC-1001` | `2468` |
| Optómetra | `SAC-2001` | `1357` |
| Administración | `SAC-ADMIN` | `2026` |

Estas cuentas se crean mediante la migración `0001_seed_pilot_collaborators.sql`. Antes de una apertura masiva, deben reemplazarse por cuentas nominativas y PIN únicos.

## Datos

- Cloudflare D1 guarda colaboradores, sesiones, progreso, intentos, recompensas y recepciones.
- Cloudflare R2 guarda fotografías y firmas; D1 conserva su metadato y huella SHA-256.
- El panel administrativo exporta las recepciones filtradas como CSV compatible con Excel y Google Sheets.
- `public/resources/registro-sac.xlsx` contiene el libro administrativo listo para usar o importar.
- `public/resources/formato-recepcion-sac.pdf` contiene el formato SAC imprimible y anonimizado.

No se publican claves secretas en el cliente. Las respuestas, puntuaciones, recompensas, clasificación final de riesgo y permisos administrativos se validan en el servidor.
Las exportaciones administrativas pueden contener datos personales y deben permanecer limitadas al equipo autorizado. Las fotografías y firmas no se incluyen en los archivos exportados.

## Contenido y medios

Los videos y subtítulos están en `public/media`. Los scripts reproducibles de generación y verificación se encuentran en `scripts/build-training-videos.m` y `scripts/verify-training-videos.m`. El banco editorial y la base de conocimiento de SACI viven en `lib/sac-content.ts`.
