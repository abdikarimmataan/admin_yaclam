import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export const ROADMAP_CMS_API_PATH = "/roadmap_cms";

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the roadmaps page"
);

export const ROADMAP_CMS_PANELS = helpers.panels;
export const ALL_ROADMAP_CMS_FIELDS = helpers.allFields;
export const getRoadmapCmsPanelFields = helpers.getPanelFields;
