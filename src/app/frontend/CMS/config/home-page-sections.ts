import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import {
  HOME_CMS_FORM_FIELDS,
  HOME_SECTIONS_FORM_FIELDS,
} from "@/app/frontend/CMS/config/home-cms-fields";

export type HomeFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

function fieldsByKeys(all: FormField[], keys: string[]): FormField[] {
  const map = new Map(all.map((f) => [f.key, f]));
  return keys.map((k) => map.get(k)).filter((f): f is FormField => Boolean(f));
}

const homeFields = HOME_CMS_FORM_FIELDS;
const sectionsFields = HOME_SECTIONS_FORM_FIELDS;

export const HOME_CMS_PANELS: HomeFormPanel[] = [
  {
    id: "hero",
    title: "Hero",
    description: "Top banner, verse, CTA buttons, and learner count",
    fieldKeys: [
      "heroBadgeText",
      "heroTitle",
      "heroSubtitle",
      "heroBrandMark",
      "heroVerseArabic",
      "heroVerseTranslation",
      "heroPrimaryButton.label",
      "heroPrimaryButton.url",
      "heroPrimaryButton.style",
      "heroPrimaryButton.isVisible",
      "heroSecondaryButton.label",
      "heroSecondaryButton.url",
      "heroSecondaryButton.style",
      "heroSecondaryButton.isVisible",
      "heroLearnerCountText",
      "heroIsVisible",
    ],
  },
  {
    id: "stats",
    title: "Stats",
    description: "Homepage stat counters — value, label, and visibility per row",
    fieldKeys: ["stats", "statsIsVisible"],
  },
];

export const HOME_SECTIONS_PANELS: HomeFormPanel[] = [
  {
    id: "field-section",
    title: "Find Your Field",
    fieldKeys: [
      "fieldSection.eyebrow",
      "fieldSection.title",
      "fieldSection.subtitle",
      "fieldSection.isVisible",
    ],
  },
  {
    id: "featured-section",
    title: "Featured Courses Section",
    fieldKeys: [
      "featuredCoursesSection.eyebrow",
      "featuredCoursesSection.title",
      "featuredCoursesSection.subtitle",
      "featuredCoursesSection.isVisible",
      "featuredCoursesSection.viewAllButton.text",
      "featuredCoursesSection.viewAllButton.url",
      "featuredCoursesSection.viewAllButton.isVisible",
    ],
  },
  {
    id: "why-yaclam-section",
    title: "Why Yaclam Section",
    fieldKeys: [
      "whyYaclamSection.eyebrow",
      "whyYaclamSection.title",
      "whyYaclamSection.subtitle",
      "whyYaclamSection.isVisible",
    ],
  },
  {
    id: "roadmaps-section",
    title: "Roadmaps Section",
    fieldKeys: [
      "roadmapsSection.eyebrow",
      "roadmapsSection.title",
      "roadmapsSection.subtitle",
      "roadmapsSection.isVisible",
      "roadmapsSection.allRoadmapsButton.text",
      "roadmapsSection.allRoadmapsButton.url",
      "roadmapsSection.allRoadmapsButton.isVisible",
    ],
  },
  {
    id: "scholarships-section",
    title: "Scholarships Section",
    fieldKeys: [
      "scholarshipsSection.eyebrow",
      "scholarshipsSection.title",
      "scholarshipsSection.subtitle",
      "scholarshipsSection.isVisible",
      "scholarshipsSection.browseAllButton.text",
      "scholarshipsSection.browseAllButton.url",
      "scholarshipsSection.browseAllButton.isVisible",
    ],
  },
  {
    id: "practitioners-section",
    title: "Practitioners Section",
    fieldKeys: [
      "practitionersSection.eyebrow",
      "practitionersSection.title",
      "practitionersSection.subtitle",
      "practitionersSection.isVisible",
    ],
  },
  {
    id: "testimonials-section",
    title: "Testimonials Section",
    fieldKeys: [
      "testimonialsSection.eyebrow",
      "testimonialsSection.title",
      "testimonialsSection.subtitle",
      "testimonialsSection.isVisible",
    ],
  },
  {
    id: "cta-section",
    title: "Call To Action",
    fieldKeys: [
      "ctaSection.title",
      "ctaSection.subtitle",
      "ctaSection.primaryButton.text",
      "ctaSection.primaryButton.url",
      "ctaSection.primaryButton.isVisible",
      "ctaSection.secondaryButton.text",
      "ctaSection.secondaryButton.url",
      "ctaSection.secondaryButton.isVisible",
      "ctaSection.isVisible",
    ],
  },
];

export const ALL_HOME_CMS_FIELDS = homeFields;
export const ALL_HOME_SECTIONS_FIELDS = sectionsFields;

export function getHomeCmsPanelFields(panel: HomeFormPanel): FormField[] {
  return fieldsByKeys(homeFields, panel.fieldKeys);
}

export function getHomeSectionsPanelFields(panel: HomeFormPanel): FormField[] {
  return fieldsByKeys(sectionsFields, panel.fieldKeys);
}
