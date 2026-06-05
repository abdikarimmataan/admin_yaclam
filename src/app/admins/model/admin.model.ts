import type { ApiUser } from "@/app/users/model/user.model";

export type AdminRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: boolean;
  created_at: string;
};

export function toAdminRow(u: ApiUser): AdminRow {
  return {
    id: u.id,
    full_name: u.profile?.full_name ?? "",
    email: u.email,
    phone: u.phone ?? "",
    status: u.status,
    created_at: u.created_at ?? "",
  };
}
