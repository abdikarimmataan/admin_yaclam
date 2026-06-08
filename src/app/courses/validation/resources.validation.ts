import type { CourseResource, CourseResourceFormRow } from "@/app/courses/model/course.model";

export function sanitizeResourcesForApi(resources: CourseResource[]): CourseResource[] {
  return resources.map((resource, index) => ({
    id: String(resource.id ?? `resource-${index + 1}`).trim(),
    title: String(resource.title ?? "").trim(),
    description: String(resource.description ?? ""),
    fileUrl: String(resource.fileUrl ?? ""),
    fileName: String(resource.fileName ?? ""),
    fileSize: Number(resource.fileSize ?? 0),
    mimeType: String(resource.mimeType ?? ""),
    sortOrder: Number.isFinite(Number(resource.sortOrder)) ? Number(resource.sortOrder) : index,
    isVisible: resource.isVisible !== false,
  }));
}

export function validateResourcesForm(rows: CourseResourceFormRow[]): Record<string, string> {
  const errors: Record<string, string> = {};

  rows.forEach((row, index) => {
    if (!String(row.title ?? "").trim()) {
      errors[`resource-${index}-title`] = "Resource title is required";
    }
    const hasFile = Boolean(String(row.fileUrl ?? "").trim() || row.pendingFile);
    if (!hasFile) {
      errors[`resource-${index}-file`] = "Upload a document file for this resource";
    }
  });

  return errors;
}

export type ResourcesSavePayload = {
  resources: CourseResource[];
  resourceFileIndexes: number[];
  files: File[];
};

export function buildResourcesPayload(rows: CourseResourceFormRow[]): {
  payload: ResourcesSavePayload | null;
  errors: Record<string, string>;
} {
  const errors = validateResourcesForm(rows);
  if (Object.keys(errors).length) {
    return { payload: null, errors };
  }

  const resources = sanitizeResourcesForApi(
    rows.map(({ pendingFile: _pendingFile, ...rest }) => rest)
  );
  const resourceFileIndexes: number[] = [];
  const files: File[] = [];

  rows.forEach((row, index) => {
    if (!row.pendingFile) return;
    resourceFileIndexes.push(index);
    files.push(row.pendingFile);
    if (resources[index]) {
      resources[index] = {
        ...resources[index],
        fileName: row.pendingFile.name,
        fileSize: row.pendingFile.size,
        mimeType: row.pendingFile.type,
      };
    }
  });

  return {
    payload: { resources, resourceFileIndexes, files },
    errors: {},
  };
}
