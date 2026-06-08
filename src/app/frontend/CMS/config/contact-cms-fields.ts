import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export const CONTACT_CMS_API_PATH = "/contact_cms";

function contactInfoFields(prefix: string, rowGroup: string): FormField[] {
  return [
    { key: `${prefix}.icon`, label: "Icon", type: "icon", rowGroup, rowColumns: 3 },
    { key: `${prefix}.title`, label: "Title", type: "text", rowGroup, rowColumns: 3 },
    { key: `${prefix}.isVisible`, label: "Visible", type: "boolean", rowGroup, rowColumns: 3 },
    { key: `${prefix}.description`, label: "Description", type: "textarea" },
  ];
}

export const CONTACT_CMS_FORM_FIELDS: FormField[] = [
  {
    key: "pageSection.title",
    label: "Title",
    type: "text",
    rowGroup: "page-hero-header",
    rowColumns: 2,
  },
  {
    key: "pageSection.isVisible",
    label: "Hero Visible",
    type: "boolean",
    rowGroup: "page-hero-header",
  },
  {
    key: "pageSection.subtitle",
    label: "Subtitle",
    type: "textarea",
  },
  { key: "isVisible", label: "Page Visible", type: "boolean" },
  ...contactInfoFields("emailSection", "email-header"),
  ...contactInfoFields("phoneSection", "phone-header"),
  ...contactInfoFields("locationSection", "location-header"),
];
