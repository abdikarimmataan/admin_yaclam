"use client";

import { SingletonCmsFormEditor } from "@/app/frontend/components/SingletonCmsFormEditor";
import {
  FOOTER_API_PATH,
  FOOTER_FORM_DEFAULTS,
} from "@/app/frontend/CMS/config/footer-cms-fields";
import {
  ALL_FOOTER_CMS_FIELDS,
  FOOTER_CMS_PANELS,
  getFooterCmsPanelFields,
} from "@/app/frontend/CMS/config/footer-cms-sections";

export function FooterCmsEditor() {
  return (
    <SingletonCmsFormEditor
      pageTitle="Footer"
      blockTitle="Footer content"
      apiPath={FOOTER_API_PATH}
      fields={ALL_FOOTER_CMS_FIELDS}
      panels={FOOTER_CMS_PANELS}
      getPanelFields={getFooterCmsPanelFields}
      formDefaults={FOOTER_FORM_DEFAULTS}
      preparePayload={(payload) => ({ ...payload, isVisible: true })}
      saveButtonLabel="Save footer"
      loadMessage="Loading footer content…"
      createdMessage="Footer content created."
      updatedMessage="Footer content updated."
      accent="slate"
    />
  );
}
