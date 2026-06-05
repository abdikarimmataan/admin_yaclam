"use client";

import { CmsManagePage } from "@/app/frontend/CMS/components/CmsManagePage";
import { getModuleBySlug } from "@/app/frontend/CMS/config/api-modules";
import Link from "next/link";

export function Coursepage() {
  const config = getModuleBySlug("course");

  if (!config) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-gray-900">Course module not found</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <CmsManagePage config={config} />;
}
