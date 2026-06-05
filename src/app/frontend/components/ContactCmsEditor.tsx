"use client";

import {
  ALL_CONTACT_CMS_FIELDS,
  CONTACT_CMS_API_PATH,
  CONTACT_CMS_PANELS,
  getContactCmsPanelFields,
} from "@/app/frontend/CMS/config/contact-cms-sections";
import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";

export function ContactCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="Contact Us CMS"
      blockTitle="Contact page content"
      apiPath={CONTACT_CMS_API_PATH}
      fields={ALL_CONTACT_CMS_FIELDS}
      panels={CONTACT_CMS_PANELS}
      getPanelFields={getContactCmsPanelFields}
      saveButtonLabel="Save contact page"
      loadMessage="Loading contact page content…"
      createdMessage="Contact page content created."
      updatedMessage="Contact page content updated."
      accent="blue"
    />
  );
}
