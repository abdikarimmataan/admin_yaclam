"use client";

import { COURSES_PAGE_MODULE } from "@/app/frontend/CMS/config/api-modules";
import {
  ALL_COURSE_CMS_FIELDS,
  COURSE_CMS_PANELS,
  getCourseCmsPanelFields,
} from "@/app/frontend/CMS/config/course-cms-sections";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function CourseCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="Course CMS"
      blockTitle="Courses page content"
      apiPath={COURSES_PAGE_MODULE.apiPath}
      fields={ALL_COURSE_CMS_FIELDS}
      panels={COURSE_CMS_PANELS}
      getPanelFields={getCourseCmsPanelFields}
      saveButtonLabel="Save course page"
      loadMessage="Loading course page content…"
      createdMessage="Course page content created."
      updatedMessage="Course page content updated."
      accent="emerald"
    />
  );
}
