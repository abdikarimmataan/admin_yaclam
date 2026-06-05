"use client";

import {
  ALL_BLOG_CMS_FIELDS,
  BLOG_CMS_API_PATH,
  BLOG_CMS_PANELS,
  getBlogCmsPanelFields,
} from "@/app/frontend/CMS/config/blog-cms-sections";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function BlogCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="Blog CMS"
      blockTitle="Blog page content"
      apiPath={BLOG_CMS_API_PATH}
      fields={ALL_BLOG_CMS_FIELDS}
      panels={BLOG_CMS_PANELS}
      getPanelFields={getBlogCmsPanelFields}
      saveButtonLabel="Save blog page"
      loadMessage="Loading blog page content…"
      createdMessage="Blog page content created."
      updatedMessage="Blog page content updated."
      accent="slate"
    />
  );
}
