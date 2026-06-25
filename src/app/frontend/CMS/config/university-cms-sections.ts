import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export const UNIVERSITY_CMS_API_PATH = "/university_cms";

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the universities page"
);

export const UNIVERSITY_CMS_PANELS = helpers.panels;
export const ALL_UNIVERSITY_CMS_FIELDS = helpers.allFields;
export const getUniversityCmsPanelFields = helpers.getPanelFields;
