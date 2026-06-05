import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Map,
  MessageSquare,
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
      { href: "/fields", label: "Fields", icon: Layers },
      { href: "/courses", label: "Courses", icon: BookOpen },
      { href: "/yaclam", label: "Yaclam", icon: Sparkles },
      { href: "/roadmap", label: "Roadmap", icon: Map },
      { href: "/scholarship", label: "Scholarship", icon: GraduationCap },
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
