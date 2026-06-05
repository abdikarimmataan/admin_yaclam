import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export const CONTACT_CMS_API_PATH = "/contact_cms";

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the contact page"
);

export const CONTACT_CMS_PANELS = helpers.panels;
export const ALL_CONTACT_CMS_FIELDS = helpers.allFields;
export const getContactCmsPanelFields = helpers.getPanelFields;
