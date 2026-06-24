import type { FormField } from "@/app/frontend/CMS/config/cms-field-types";
import { FOOTER_CMS_FORM_FIELDS } from "@/app/frontend/CMS/config/footer-cms-fields";

export type CmsFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

const allFields = FOOTER_CMS_FORM_FIELDS;

function fieldsByKeys(keys: string[]): FormField[] {
  const map = new Map(allFields.map((f) => [f.key, f]));
  return keys.map((k) => map.get(k)).filter((f): f is FormField => Boolean(f));
}

export const FOOTER_CMS_PANELS: CmsFormPanel[] = [
  {
    id: "logo",
    title: "Logo",
    fieldKeys: [
      "logo.isVisible",
      "logo.text.mark",
      "logo.text.name",
      "logo.text.highlight",
      "logo.text.isVisible",
    ],
  },
  {
    id: "socials",
    title: "Social links",
    description: "Profile URLs for social icons. For WhatsApp, enter a phone number with country code.",
    fieldKeys: [
      "socials.facebook",
      "socials.twitter",
      "socials.linkedin",
      "socials.youtube",
      "socials.instagram",
      "socials.whatsapp",
    ],
  },
  {
    id: "footer-copy",
    title: "Footer copy",
    fieldKeys: ["footer.description", "footer.copyright", "footer.tagline"],
  },
  {
    id: "footer-columns",
    title: "Link columns",
    fieldKeys: ["footer.columns"],
  },
];

export const ALL_FOOTER_CMS_FIELDS = allFields;

export function getFooterCmsPanelFields(panel: CmsFormPanel): FormField[] {
  return fieldsByKeys(panel.fieldKeys);
}
