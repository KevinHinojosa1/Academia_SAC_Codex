import { errorResponse, noStoreHeaders } from "@/lib/server/errors";
import { requireUser } from "@/lib/server/session";
import { trainingCapsules, type TrainingCapsule } from "@/lib/sac-content";

// In-memory store for runtime course modifications
let coursesStore: {
  hiddenCapsuleIds: string[];
  customCapsules: TrainingCapsule[];
} = {
  hiddenCapsuleIds: [],
  customCapsules: [],
};

export async function GET(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    return Response.json(
      {
        baseCapsules: trainingCapsules,
        hiddenCapsuleIds: coursesStore.hiddenCapsuleIds,
        customCapsules: coursesStore.customCapsules,
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireUser(request, ["admin"]);
    const body = (await request.json().catch(() => ({}))) as {
      action: "toggle_visibility" | "add_course" | "delete_course" | "sync";
      capsuleId?: string;
      hidden?: boolean;
      newCourse?: TrainingCapsule;
      state?: { hiddenCapsuleIds: string[]; customCapsules: TrainingCapsule[] };
    };

    if (body.action === "toggle_visibility" && body.capsuleId) {
      if (body.hidden) {
        if (!coursesStore.hiddenCapsuleIds.includes(body.capsuleId)) {
          coursesStore.hiddenCapsuleIds.push(body.capsuleId);
        }
      } else {
        coursesStore.hiddenCapsuleIds = coursesStore.hiddenCapsuleIds.filter(
          (id) => id !== body.capsuleId,
        );
      }
    } else if (body.action === "add_course" && body.newCourse) {
      // Add custom course
      const existing = coursesStore.customCapsules.findIndex(
        (c) => c.id === body.newCourse?.id,
      );
      if (existing >= 0) {
        coursesStore.customCapsules[existing] = body.newCourse;
      } else {
        coursesStore.customCapsules.push(body.newCourse);
      }
    } else if (body.action === "delete_course" && body.capsuleId) {
      coursesStore.customCapsules = coursesStore.customCapsules.filter(
        (c) => c.id !== body.capsuleId,
      );
      coursesStore.hiddenCapsuleIds = coursesStore.hiddenCapsuleIds.filter(
        (id) => id !== body.capsuleId,
      );
    } else if (body.action === "sync" && body.state) {
      coursesStore = body.state;
    }

    return Response.json(
      {
        success: true,
        hiddenCapsuleIds: coursesStore.hiddenCapsuleIds,
        customCapsules: coursesStore.customCapsules,
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
