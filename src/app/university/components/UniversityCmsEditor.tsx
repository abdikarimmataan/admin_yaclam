"use client";

import {
  ALL_UNIVERSITY_CMS_FIELDS,
  UNIVERSITY_CMS_API_PATH,
  UNIVERSITY_CMS_PANELS,
  getUniversityCmsPanelFields,
} from "@/app/frontend/CMS/config/university-cms-sections";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function UniversityCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="University CMS"
      blockTitle="Universities page content"
      apiPath={UNIVERSITY_CMS_API_PATH}
      fields={ALL_UNIVERSITY_CMS_FIELDS}
      panels={UNIVERSITY_CMS_PANELS}
      getPanelFields={getUniversityCmsPanelFields}
      saveButtonLabel="Save universities page"
      loadMessage="Loading universities page content…"
      createdMessage="Universities page content created."
      updatedMessage="Universities page content updated."
      accent="blue"
    />
  );
}
