"use client";

import { CmsManagePage } from "@/components/cms/CmsManagePage";
import { getModuleBySlug } from "@/config/api-modules";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

const REDIRECT_TO_FRONTEND = new Set(["home", "home-sections"]);

export default function ManageModulePage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug ?? "");

  useLayoutEffect(() => {
    if (REDIRECT_TO_FRONTEND.has(slug)) {
      router.replace("/frontend/home");
    }
  }, [slug, router]);

  if (REDIRECT_TO_FRONTEND.has(slug)) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        Redirecting to Home Page…
      </div>
    );
  }

  const config = getModuleBySlug(slug);

  if (!config) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-gray-900">Module not found</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <CmsManagePage config={config} />;
}
