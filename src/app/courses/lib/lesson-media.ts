export type LessonType = "video" | "link";

export function resolveLessonType(
  lesson: { lessonType?: string; linkUrl?: string; videoUrl?: string } | null | undefined
): LessonType {
  if (lesson?.lessonType === "link") return "link";
  if (lesson?.lessonType === "video") return "video";

  const linkUrl = String(lesson?.linkUrl ?? "").trim();
  const videoUrl = String(lesson?.videoUrl ?? "").trim();
  if (linkUrl && !videoUrl) return "link";
  return "video";
}

export function isValidExternalLessonUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
