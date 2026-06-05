import {
  PAGE_CMS_FORM_FIELDS,
  createPageCmsSectionHelpers,
} from "@/app/frontend/CMS/config/page-cms-fields";

export const BLOG_CMS_API_PATH = "/blog_cms";

const helpers = createPageCmsSectionHelpers(
  PAGE_CMS_FORM_FIELDS,
  "Title, subtitle, empty state message, and visibility for the blog page"
);

export const BLOG_CMS_PANELS = helpers.panels;
export const ALL_BLOG_CMS_FIELDS = helpers.allFields;
export const getBlogCmsPanelFields = helpers.getPanelFields;
