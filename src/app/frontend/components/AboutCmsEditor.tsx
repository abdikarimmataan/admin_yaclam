"use client";

import {
  ALL_ABOUT_CMS_FIELDS,
  ABOUT_CMS_PANELS,
  getAboutCmsPanelFields,
} from "@/app/frontend/CMS/config/about-cms-sections";
import { ABOUT_CMS_API_PATH } from "@/app/frontend/CMS/config/about-cms-fields";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function AboutCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="About CMS"
      blockTitle="About page sections"
      apiPath={ABOUT_CMS_API_PATH}
      fields={ALL_ABOUT_CMS_FIELDS}
      panels={ABOUT_CMS_PANELS}
      getPanelFields={getAboutCmsPanelFields}
      saveButtonLabel="Save about page"
      loadMessage="Loading about page content…"
      createdMessage="About page content created."
      updatedMessage="About page content updated."
      accent="emerald"
    />
  );
}
