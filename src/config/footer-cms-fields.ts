import type { FormField } from "@/config/cms-field-types";

export const FOOTER_API_PATH = "/footer";

export const FOOTER_CMS_FORM_FIELDS: FormField[] = [
  { key: "logo.isVisible", label: "Logo Block Visible", type: "boolean" },
  { key: "logo.text.mark", label: "Logo Mark", type: "text", rowGroup: "logo-text" },
  { key: "logo.text.name", label: "Logo Name", type: "text", rowGroup: "logo-text" },
  { key: "logo.text.highlight", label: "Logo Highlight", type: "text", rowGroup: "logo-text" },
  { key: "logo.text.isVisible", label: "Logo Text Visible", type: "boolean", rowGroup: "logo-text" },
  { key: "socials.facebook", label: "Facebook URL", type: "text" },
  { key: "socials.twitter", label: "Twitter URL", type: "text" },
  { key: "socials.linkedin", label: "LinkedIn URL", type: "text" },
  { key: "socials.youtube", label: "YouTube URL", type: "text" },
  { key: "socials.instagram", label: "Instagram URL", type: "text" },
  { key: "footer.description", label: "Description", type: "textarea" },
  { key: "footer.copyright", label: "Copyright", type: "text" },
  { key: "footer.tagline", label: "Tagline", type: "text" },
  { key: "footer.columns", label: "Footer Columns", type: "footerColumnsList" },
];

export const FOOTER_FORM_DEFAULTS: Record<string, unknown> = {
  "logo.isVisible": true,
  "logo.text.mark": "ي",
  "logo.text.name": "Yaclam",
  "logo.text.highlight": ".",
  "logo.text.isVisible": true,
  "socials.facebook": "",
  "socials.twitter": "",
  "socials.linkedin": "",
  "socials.youtube": "",
  "socials.instagram": "",
  "footer.description": "",
  "footer.copyright": "© 2026 Yaclam (يعلم). All rights reserved.",
  "footer.tagline": "",
  "footer.columns": [],
  isVisible: true,
};
