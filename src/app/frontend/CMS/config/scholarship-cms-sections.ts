import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export const SCHOLARSHIP_CMS_API_PATH = "/scholarship_cms";

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the scholarships page"
);

export const SCHOLARSHIP_CMS_PANELS = helpers.panels;
export const ALL_SCHOLARSHIP_CMS_FIELDS = helpers.allFields;
export const getScholarshipCmsPanelFields = helpers.getPanelFields;
