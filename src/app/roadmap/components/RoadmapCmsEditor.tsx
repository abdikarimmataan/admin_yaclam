"use client";

import {
  ALL_ROADMAP_CMS_FIELDS,
  ROADMAP_CMS_API_PATH,
  ROADMAP_CMS_PANELS,
  getRoadmapCmsPanelFields,
} from "@/app/frontend/CMS/config/roadmap-cms-sections";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function RoadmapCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="Roadmap CMS"
      blockTitle="Roadmaps page content"
      apiPath={ROADMAP_CMS_API_PATH}
      fields={ALL_ROADMAP_CMS_FIELDS}
      panels={ROADMAP_CMS_PANELS}
      getPanelFields={getRoadmapCmsPanelFields}
      saveButtonLabel="Save roadmap page"
      loadMessage="Loading roadmap page content…"
      createdMessage="Roadmap page content created."
      updatedMessage="Roadmap page content updated."
      accent="violet"
    />
  );
}
