import {
  FileText,
  Footprints,
  Globe,
  GraduationCap,
  Home,
  LayoutGrid,
  Mail,
  Map,
  Newspaper,
  School,
} from "lucide-react";
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
    slug: "roadmap-cms",
    label: "Roadmap CMS",
    href: "/frontend/roadmap-cms",
    icon: Map,
    description: "Roadmaps listing page copy and visibility",
  },
  {
    slug: "scholarship-cms",
    label: "Scholarship CMS",
    href: "/frontend/scholarship-cms",
    icon: GraduationCap,
    description: "Scholarships listing page copy and visibility",
  },
  {
    slug: "university-cms",
    label: "University CMS",
    href: "/frontend/university-cms",
    icon: School,
    description: "Universities listing page copy and visibility",
  },
  {
    slug: "blog-cms",
    label: "Blog CMS",
    href: "/frontend/blog-cms",
    icon: Newspaper,
    description: "Blog listing page copy and visibility",
  },
  {
    slug: "about-cms",
    label: "About CMS",
    href: "/frontend/about-cms",
    icon: FileText,
    description: "About page copy and visibility",
  },
  {
    slug: "contact-cms",
    label: "Contact Us CMS",
    href: "/frontend/contact-cms",
    icon: Mail,
    description: "Contact page copy and visibility",
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
