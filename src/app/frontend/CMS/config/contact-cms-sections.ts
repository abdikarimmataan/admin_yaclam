import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import {
  CONTACT_CMS_API_PATH,
  CONTACT_CMS_FORM_FIELDS,
} from "@/app/frontend/CMS/config/contact-cms-fields";

export { CONTACT_CMS_API_PATH };

export type ContactCmsFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

function fieldsByKeys(all: FormField[], keys: string[]): FormField[] {
  const map = new Map(all.map((f) => [f.key, f]));
  return keys.map((k) => map.get(k)).filter((f): f is FormField => Boolean(f));
}

const contactFields = CONTACT_CMS_FORM_FIELDS;

export const CONTACT_CMS_PANELS: ContactCmsFormPanel[] = [
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
    id: "email",
    title: "Email",
    description: "Email contact card shown on the contact page",
    fieldKeys: [
      "emailSection.icon",
      "emailSection.title",
      "emailSection.description",
      "emailSection.isVisible",
    ],
  },
  {
    id: "phone",
    title: "Phone",
    description: "Phone contact card shown on the contact page",
    fieldKeys: [
      "phoneSection.icon",
      "phoneSection.title",
      "phoneSection.description",
      "phoneSection.isVisible",
    ],
  },
  {
    id: "location",
    title: "Location",
    description: "Location contact card shown on the contact page",
    fieldKeys: [
      "locationSection.icon",
      "locationSection.title",
      "locationSection.description",
      "locationSection.isVisible",
    ],
  },
];

export const ALL_CONTACT_CMS_FIELDS = contactFields;

export function getContactCmsPanelFields(panel: ContactCmsFormPanel): FormField[] {
  return fieldsByKeys(contactFields, panel.fieldKeys);
}
