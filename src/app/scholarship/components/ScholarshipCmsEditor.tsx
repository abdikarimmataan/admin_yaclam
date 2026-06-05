"use client";

import {
  ALL_SCHOLARSHIP_CMS_FIELDS,
  SCHOLARSHIP_CMS_API_PATH,
  SCHOLARSHIP_CMS_PANELS,
  getScholarshipCmsPanelFields,
} from "@/app/frontend/CMS/config/scholarship-cms-sections";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function ScholarshipCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="Scholarship CMS"
      blockTitle="Scholarships page content"
      apiPath={SCHOLARSHIP_CMS_API_PATH}
      fields={ALL_SCHOLARSHIP_CMS_FIELDS}
      panels={SCHOLARSHIP_CMS_PANELS}
      getPanelFields={getScholarshipCmsPanelFields}
      saveButtonLabel="Save scholarship page"
      loadMessage="Loading scholarship page content…"
      createdMessage="Scholarship page content created."
      updatedMessage="Scholarship page content updated."
      accent="blue"
    />
  );
}
