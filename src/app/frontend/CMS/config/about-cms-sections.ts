import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import {
  ABOUT_CMS_API_PATH,
  ABOUT_CMS_FORM_FIELDS,
} from "@/app/frontend/CMS/config/about-cms-fields";

export { ABOUT_CMS_API_PATH };

export type AboutCmsFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

function fieldsByKeys(all: FormField[], keys: string[]): FormField[] {
  const map = new Map(all.map((f) => [f.key, f]));
  return keys.map((k) => map.get(k)).filter((f): f is FormField => Boolean(f));
}

const aboutFields = ABOUT_CMS_FORM_FIELDS;

export const ABOUT_CMS_PANELS: AboutCmsFormPanel[] = [
  {
    id: "page-hero",
    title: "Page Hero",
    description: "Top banner title, subtitle, and visibility",
    fieldKeys: [
      "pageSection.title",
      "pageSection.subtitle",
      "pageSection.isVisible",
      "isVisible",
    ],
  },
  {
    id: "our-story",
    title: "Our Story",
    fieldKeys: [
      "ourStorySection.eyebrow",
      "ourStorySection.title",
      "ourStorySection.description",
      "ourStorySection.isVisible",
      "ourStorySection.button.name",
      "ourStorySection.button.url",
      "ourStorySection.button.isVisible",
    ],
  },
  {
    id: "mission",
    title: "Mission",
    fieldKeys: [
      "missionSection.icon",
      "missionSection.title",
      "missionSection.description",
      "missionSection.isVisible",
    ],
  },
  {
    id: "vision",
    title: "Vision",
    fieldKeys: [
      "visionSection.icon",
      "visionSection.title",
      "visionSection.description",
      "visionSection.isVisible",
    ],
  },
  {
    id: "values",
    title: "Values",
    fieldKeys: [
      "valuesSection.icon",
      "valuesSection.title",
      "valuesSection.description",
      "valuesSection.isVisible",
    ],
  },
  {
    id: "ecosystem",
    title: "Ecosystem",
    fieldKeys: [
      "ecosystemSection.icon",
      "ecosystemSection.title",
      "ecosystemSection.description",
      "ecosystemSection.isVisible",
    ],
  },
  {
    id: "verse",
    title: "Verse",
    description: "Arabic verse and translation shown at the bottom of the page",
    fieldKeys: [
      "verseSection.verseArabic",
      "verseSection.verseTranslation",
      "verseSection.isVisible",
    ],
  },
];

export const ALL_ABOUT_CMS_FIELDS = aboutFields;

export function getAboutCmsPanelFields(panel: AboutCmsFormPanel): FormField[] {
  return fieldsByKeys(aboutFields, panel.fieldKeys);
}
