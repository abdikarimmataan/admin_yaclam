import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";

export const ABOUT_CMS_API_PATH = "/about_cms";

function iconCardFields(prefix: string, rowGroup: string): FormField[] {
  return [
    { key: `${prefix}.icon`, label: "Icon", type: "icon", rowGroup, rowColumns: 3 },
    { key: `${prefix}.title`, label: "Title", type: "text", rowGroup, rowColumns: 3 },
    { key: `${prefix}.isVisible`, label: "Visible", type: "boolean", rowGroup, rowColumns: 3 },
    { key: `${prefix}.description`, label: "Description", type: "textarea" },
  ];
}

export const ABOUT_CMS_FORM_FIELDS: FormField[] = [
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
  {
    key: "ourStorySection.eyebrow",
    label: "Eyebrow",
    type: "text",
    rowGroup: "our-story-header",
    rowColumns: 2,
  },
  {
    key: "ourStorySection.title",
    label: "Title",
    type: "text",
    rowGroup: "our-story-header",
    rowColumns: 2,
  },
  {
    key: "ourStorySection.description",
    label: "Description",
    type: "textarea",
  },
  { key: "ourStorySection.isVisible", label: "Section Visible", type: "boolean" },
  {
    key: "ourStorySection.button.name",
    label: "Button Text",
    type: "text",
    rowGroup: "our-story-button",
  },
  {
    key: "ourStorySection.button.url",
    label: "Button URL",
    type: "text",
    rowGroup: "our-story-button",
  },
  {
    key: "ourStorySection.button.isVisible",
    label: "Button Visible",
    type: "boolean",
    rowGroup: "our-story-button",
  },
  ...iconCardFields("missionSection", "mission-header"),
  ...iconCardFields("visionSection", "vision-header"),
  ...iconCardFields("valuesSection", "values-header"),
  ...iconCardFields("ecosystemSection", "ecosystem-header"),
  {
    key: "verseSection.verseArabic",
    label: "Verse (Arabic)",
    type: "textarea",
  },
  {
    key: "verseSection.verseTranslation",
    label: "Verse Translation",
    type: "textarea",
  },
  { key: "verseSection.isVisible", label: "Section Visible", type: "boolean" },
];
