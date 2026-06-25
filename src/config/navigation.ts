import {
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Map,
  MessageSquare,
  Presentation,
  Sparkles,
  UserCircle,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FRONTEND_GROUP } from "@/config/frontend";

export type NavChild = { href: string; label: string };
export type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: NavChild[];
};
export type NavGroup = { label: string; items: NavItem[] };

export const NAVIGATION: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        label: FRONTEND_GROUP.label,
        icon: FRONTEND_GROUP.icon,
        children: FRONTEND_GROUP.pages.map((p) => ({
          href: p.href,
          label: p.label,
        })),
      },
      { href: "/users", label: "Students", icon: Users },
      { href: "/admins", label: "Admins", icon: UserCog },
      {
        label: "Instructor",
        icon: Presentation,
        children: [
          { href: "/instructor-roles", label: "Role" },
          { href: "/instructors", label: "Manage" },
        ],
      },
      { href: "/fields", label: "Fields", icon: Layers },
      {
        label: "Courses",
        icon: BookOpen,
        children: [
          { href: "/course-category", label: "Category" },
          { href: "/courses", label: "Manage course" },
        ],
      },
      { href: "/yaclam", label: "Yaclam", icon: Sparkles },
      { href: "/roadmap", label: "Roadmap", icon: Map },
      { href: "/scholarship", label: "Scholarship", icon: GraduationCap },
      {
        label: "Universities",
        icon: Building2,
        children: [
          { href: "/degree-level", label: "Degree Level" },
          { href: "/discipline", label: "Discipline" },
          { href: "/program", label: "Study Area" },
          { href: "/university-language", label: "Language" },
          { href: "/university-location", label: "Location" },
          { href: "/university", label: "Universities" },
          { href: "/manageuniversity", label: "Manage University" },
        ],
      },
      { href: "/practitioners", label: "Practitioners", icon: UserCircle },
      { href: "/testimonials", label: "Testimonials", icon: MessageSquare },
      {
        label: "Blog",
        icon: FileText,
        children: [
          { href: "/blog-category", label: "Blog Category" },
          { href: "/blog", label: "Blog" },
        ],
      },
    ],
  },
];
