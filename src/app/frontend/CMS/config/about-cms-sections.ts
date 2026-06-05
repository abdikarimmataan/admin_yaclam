import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export const ABOUT_CMS_API_PATH = "/about_cms";

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the about page"
);

export const ABOUT_CMS_PANELS = helpers.panels;
export const ALL_ABOUT_CMS_FIELDS = helpers.allFields;
export const getAboutCmsPanelFields = helpers.getPanelFields;
