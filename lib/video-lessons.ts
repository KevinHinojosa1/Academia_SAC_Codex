import { sacModules, trainingExamples, type SacModule } from "./sac-content";

export function getVideoChapters(module: SacModule) {
  const examples = trainingExamples[module.id] ?? [];
  const ex0 = examples[0];
  const ex1 = examples[1] || ex0;
  const ex2 = examples[2] || ex0;

  const rawChapters = [
    ...module.sections.map((section, idx) => {
      let image = module.poster;
      if (idx === 1 && ex1?.image) image = ex1.image;
      else if (idx === 2 && ex2?.image) image = ex2.image;
      else if (idx === 3 && ex0?.image) image = ex0.image;
      return {
        title: section.title,
        body: section.body,
        tip: section.tip ?? "",
        image,
      };
    }),
    {
      title: "Ejemplo aplicado",
      body: ex0 ? `${ex0.context} ${ex0.action}` : module.summary,
      tip: ex0 ? `Evidencia: ${ex0.evidence}` : "",
      image: ex0?.image || module.poster,
    },
  ];

  let start = 0;
  return rawChapters.map((chapter) => {
    const words = `${chapter.title} ${chapter.body} ${chapter.tip}`.split(/\s+/).length;
    const duration = Math.max(14, Math.ceil(words / 2.4) + 2);
    const result = { ...chapter, start, duration };
    start += duration;
    return result;
  });
}

export const videoLessons = sacModules.map((module) => ({
  moduleId: module.id,
  title: module.title.replace("SAC | ", ""),
  video: module.video,
  captions: module.captions,
  poster: module.poster,
  chapters: getVideoChapters(module),
}));
