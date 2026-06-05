import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export type CmsFormPanel = {
  id: string;
  title: string;
  description?: string;
  fieldKeys: string[];
};

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the courses page"
);

export const COURSE_CMS_PANELS = helpers.panels;
export const ALL_COURSE_CMS_FIELDS = helpers.allFields;
export const getCourseCmsPanelFields = helpers.getPanelFields;
