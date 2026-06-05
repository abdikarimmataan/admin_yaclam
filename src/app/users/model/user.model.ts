export type UserProfile = {
  full_name: string;
  avatar_url?: string;
  bio?: string;
};

export type ApiUser = {
  id: string;
  email: string;
  phone?: string;
  accountType: "admin" | "student";
  status: boolean;
  approve: boolean;
  profile: UserProfile;
  roleId?: { id: string; name: string } | string | null;
  created_at?: string;
  last_login?: string;
};

export type { PaginatedResponse } from "@/config/api";

export type DashboardStat = {
  label: string;
  value: string;
  color: "blue" | "green" | "orange" | "purple";
};

export type RegisterStudentPayload = {
  email: string;
  password: string;
  phone?: string;
  profile: UserProfile;
};

export type UpdateUserPayload = {
  email?: string;
  phone?: string;
  profile?: Partial<UserProfile>;
  status?: boolean;
  approve?: boolean;
  roleId?: string | null;
};

export type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: boolean;
  approve: boolean;
  created_at: string;
};

export function toStudentRow(user: ApiUser): StudentRow {
  return {
    id: user.id,
    full_name: user.profile?.full_name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    status: user.status,
    approve: user.approve,
    created_at: user.created_at ?? "",
  };
}
