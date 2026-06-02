import { Footprints, Globe, Home, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Dynamic frontend website pages — add entries here to extend the sidebar. */
export type FrontendWebsitePage = {
  slug: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const FRONTEND_WEBSITE_PAGES: FrontendWebsitePage[] = [
  {
    slug: "home",
    label: "Home Page",
    href: "/frontend/home",
    icon: Home,
    description: "Home blocks and section headings",
  },
  {
    slug: "courses-cms",
    label: "Course CMS",
    href: "/frontend/courses-cms",
    icon: LayoutGrid,
    description: "Courses listing page copy and visibility",
  },
  {
    slug: "footer",
    label: "Footer",
    href: "/frontend/footer",
    icon: Footprints,
    description: "Site footer logo, socials, columns, and copyright",
  },
];

export const FRONTEND_WEBSITE_GROUP = {
  label: "Frontend Website",
  icon: Globe,
  pages: FRONTEND_WEBSITE_PAGES,
};
