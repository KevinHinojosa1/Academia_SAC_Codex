import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

// Both the player and the rendered video consume the same authored module text.
const vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false, ws: false } });
try {
  const { videoLessons } = await vite.ssrLoadModule("/lib/video-lessons.ts");
  const root = process.cwd();
  const specs = videoLessons.map((lesson, index) => ({
    ...lesson,
    label: `MÓDULO ${String(index + 1).padStart(2, "0")} · ${lesson.title.toUpperCase()}`,
    image: path.join(root, "public", lesson.poster),
    chapters: lesson.chapters.map((ch) => ({
      ...ch,
      image: path.join(root, "public", ch.image || lesson.poster),
    })),
    output: path.join(root, "public", lesson.video),
  }));
  await mkdir(".sites-runtime/module-videos", { recursive: true });
  await writeFile(".sites-runtime/module-videos/specs.json", JSON.stringify(specs, null, 2));
  const stamp = (seconds) => `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}.000`;
  for (const lesson of videoLessons) {
    const cues = lesson.chapters.flatMap((chapter) => {
      const split = Math.max(5, Math.floor(chapter.duration / 2));
      return [
        `${stamp(chapter.start)} --> ${stamp(chapter.start + split)}\n${chapter.title}. ${chapter.body}`,
        `${stamp(chapter.start + split)} --> ${stamp(chapter.start + chapter.duration)}\n${chapter.tip || chapter.body}`,
      ];
    });
    await writeFile(path.join("public", lesson.captions), `WEBVTT\n\n${cues.join("\n\n")}\n`);
  }
  console.log(`Prepared ${specs.length} distinct module scripts with matching captions.`);
} finally { await vite.close(); }
