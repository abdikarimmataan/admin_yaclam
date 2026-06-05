import { getAdminUsers, getStudents } from "@/app/users/service/user.service";
import type { ApiUser } from "@/app/users/model/user.model";

export type DashboardStatsResponse = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalAdmins: number;
};

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const [studentsRes, adminsRes] = await Promise.all([
    getStudents({ page: 1, pageSize: 500 }),
    getAdminUsers({ page: 1, pageSize: 100 }),
  ]);

  const students = (studentsRes.data ?? []) as ApiUser[];
  const activeStudents = students.filter((u) => u.status).length;
  const totalStudents = studentsRes.rows ?? students.length;

  return {
    totalStudents,
    activeStudents,
    inactiveStudents: totalStudents - activeStudents,
    totalAdmins: adminsRes.rows ?? (adminsRes.data?.length ?? 0),
  };
}
