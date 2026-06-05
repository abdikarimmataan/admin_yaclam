import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export type CmsFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

export const PAGE_CMS_FORM_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text" },
  { key: "subtitle", label: "Subtitle", type: "textarea" },
  { key: "emptyStateText", label: "Empty State Text", type: "text" },
  { key: "isVisible", label: "Visible", type: "boolean" },
];

export function createPageCmsSectionHelpers(
  fields: FormField[],
  pageCopyDescription: string
) {
  function fieldsByKeys(keys: string[]): FormField[] {
    const map = new Map(fields.map((f) => [f.key, f]));
    return keys.map((k) => map.get(k)).filter((f): f is FormField => Boolean(f));
  }

  const panels: CmsFormPanel[] = [
    {
      id: "page-content",
      title: "Page Content",
      description: pageCopyDescription,
      fieldKeys: ["title", "subtitle", "emptyStateText", "isVisible"],
    },
  ];

  return {
    panels,
    allFields: fields,
    getPanelFields: (panel: CmsFormPanel) => fieldsByKeys(panel.fieldKeys),
  };
}
