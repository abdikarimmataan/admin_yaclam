"use client";

import { useParams, useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

const ALLOWED = new Set(["course"]);

export default function ManageModulePage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug ?? "");

  useLayoutEffect(() => {
    if (slug === "fields") {
      router.replace("/fields");
    } else if (slug === "why-yaclam") {
      router.replace("/yaclam");
    } else if (slug === "roadmap") {
      router.replace("/roadmap");
    } else if (slug === "scholarship") {
      router.replace("/scholarship");
    } else if (slug === "practitioners") {
      router.replace("/practitioners");
    } else if (slug === "testimonials") {
      router.replace("/testimonials");
    } else if (slug === "course") {
      router.replace("/manage/course");
    } else if (!ALLOWED.has(slug)) {
      router.replace("/dashboard");
    }
  }, [slug, router]);

  return (
    <div className="flex items-center justify-center py-12 text-sm text-gray-500">
      Redirecting…
    </div>
  );
}
