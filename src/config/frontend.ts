import { Footprints, Globe, Home, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FrontendPage = {
  slug: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const FRONTEND_PAGES: FrontendPage[] = [
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

export const FRONTEND_GROUP = {
  label: "Frontend Website",
  icon: Globe,
  pages: FRONTEND_PAGES,
};
