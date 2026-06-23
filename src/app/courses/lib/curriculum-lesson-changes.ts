import type { CourseLesson, CourseModule } from "@/app/courses/model/course.model";
import { resolveLessonType } from "@/app/courses/lib/lesson-media";

type LessonSnapshot = {
  id: string;
  title: string;
  lessonType: "video" | "link";
  videoUrl: string;
  linkUrl: string;
};

function lessonSnapshot(lesson: CourseLesson, fallbackId: string): LessonSnapshot {
  return {
    id: String(lesson.id ?? fallbackId).trim() || fallbackId,
    title: String(lesson.title ?? "").trim() || "Untitled lesson",
    lessonType: resolveLessonType(lesson),
    videoUrl: String(lesson.videoUrl ?? "").trim(),
    linkUrl: String(lesson.linkUrl ?? "").trim(),
  };
}

export function snapshotCurriculum(curriculum: CourseModule[]): LessonSnapshot[] {
  const rows: LessonSnapshot[] = [];
  curriculum.forEach((mod, mi) => {
    (mod.lessons ?? []).forEach((lesson, li) => {
      rows.push(lessonSnapshot(lesson, `${mi}-${li}`));
    });
  });
  return rows;
}

export function describeLessonTypeSwitch(args: {
  lessonTitle: string;
  fromType: "video" | "link";
  toType: "video" | "link";
  videoUrl?: string;
  linkUrl?: string;
  pendingVideoName?: string;
}): string {
  const { lessonTitle, fromType, toType, videoUrl, linkUrl, pendingVideoName } = args;
  const lines = [
    `<strong>Lesson:</strong> ${lessonTitle}`,
    `<strong>Change:</strong> ${fromType === "video" ? "Uploaded video" : "Video link"} → ${toType === "video" ? "Uploaded video" : "Video link"}`,
  ];

  if (toType === "link") {
    if (pendingVideoName) {
      lines.push(`<strong>Will remove:</strong> New video file "${pendingVideoName}" (not saved yet)`);
    }
    if (videoUrl) {
      lines.push(
        `<strong>Will remove:</strong> Uploaded video file <code>${videoUrl.split("/").pop()}</code>`
      );
      lines.push("The uploaded MP4 will be deleted from the server when you save the curriculum.");
    }
    lines.push("After save, students will watch the external video link instead of the uploaded file.");
  } else {
    if (linkUrl) {
      lines.push(`<strong>Will remove:</strong> Video link <code>${linkUrl}</code>`);
    }
    lines.push("You will need to upload an MP4 video for this lesson.");
  }

  return lines.join("<br/>");
}

export function collectCurriculumSaveImpacts(
  initial: CourseModule[],
  current: CourseModule[]
): string[] {
  const initialById = new Map(snapshotCurriculum(initial).map((row) => [row.id, row]));
  const impacts: string[] = [];

  current.forEach((mod, mi) => {
    (mod.lessons ?? []).forEach((lesson, li) => {
      const row = lessonSnapshot(lesson, `${mi}-${li}`);
      const before = initialById.get(row.id);
      if (!before) return;

      const typeChanged = before.lessonType !== row.lessonType;
      const videoRemoved = Boolean(before.videoUrl) && !row.videoUrl && row.lessonType === "link";
      const linkRemoved = Boolean(before.linkUrl) && !row.linkUrl && row.lessonType === "video";

      if (!typeChanged && !videoRemoved && !linkRemoved) return;

      const parts: string[] = [`<strong>${row.title}</strong>`];

      if (typeChanged) {
        parts.push(
          `type: ${before.lessonType === "video" ? "uploaded video" : "video link"} → ${row.lessonType === "video" ? "uploaded video" : "video link"}`
        );
      }
      if (videoRemoved) {
        parts.push(
          `removes uploaded video <code>${before.videoUrl.split("/").pop()}</code> from server`
        );
      }
      if (linkRemoved) {
        parts.push(`removes video link <code>${before.linkUrl}</code>`);
      }
      if (row.lessonType === "link" && row.linkUrl) {
        parts.push(`new link: <code>${row.linkUrl}</code>`);
      }

      impacts.push(parts.join(" — "));
    });
  });

  return impacts;
}
