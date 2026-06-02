import { getNewsletterSubscribers } from "@/services/newsletter.service";
import { getAdminUsers, getStudents } from "@/views/users/user.service";

export type DashboardStatsResponse = {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalAdmins: number;
  newsletterSubscribers: number;
};

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const [studentsRes, adminsRes, newsletterRes] = await Promise.all([
    getStudents({ page: 1, pageSize: 500 }),
    getAdminUsers({ page: 1, pageSize: 100 }),
    getNewsletterSubscribers({ page: 1, pageSize: 1 }).catch(() => ({
      rows: 0,
      data: [],
      page: 1,
      pages: 0,
      pageSize: 1,
    })),
  ]);

  const students = studentsRes.data ?? [];
  const activeStudents = students.filter((u) => u.status).length;
  const totalStudents = studentsRes.rows ?? students.length;

  return {
    totalStudents,
    activeStudents,
    inactiveStudents: totalStudents - activeStudents,
    totalAdmins: adminsRes.rows ?? (adminsRes.data?.length ?? 0),
    newsletterSubscribers: newsletterRes.rows ?? 0,
  };
}
