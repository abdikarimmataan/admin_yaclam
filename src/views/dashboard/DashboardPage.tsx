"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Mail,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { getDashboardStats } from "./dashboard.service";
import type { DashboardStat } from "@/model/user";

const statConfig: Record<
  DashboardStat["color"],
  { icon: typeof Users; gradient: string; iconBg: string }
> = {
  blue: {
    icon: Users,
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500",
  },
  green: {
    icon: UserCheck,
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500",
  },
  orange: {
    icon: Activity,
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-500",
  },
  purple: {
    icon: Shield,
    gradient: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-500",
  },
  teal: {
    icon: Mail,
    gradient: "from-teal-500 to-cyan-600",
    iconBg: "bg-teal-500",
  },
};

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStat[]>([
    { label: "Total Students", value: "0", color: "blue" },
    { label: "Active Students", value: "0", color: "green" },
    { label: "Total Admins", value: "0", color: "purple" },
    { label: "Newsletter", value: "0", color: "teal" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats([
          { label: "Total Students", value: String(data.totalStudents), color: "blue" },
          { label: "Active Students", value: String(data.activeStudents), color: "green" },
          { label: "Total Admins", value: String(data.totalAdmins), color: "purple" },
          {
            label: "Newsletter",
            value: String(data.newsletterSubscribers),
            color: "teal",
          },
        ]);
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-blue-100" />
            <div className="absolute left-0 top-0 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor your platform performance
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-sm text-white shadow md:flex">
          <Activity className="h-4 w-4" />
          <span className="font-medium">Live Monitoring</span>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const config = statConfig[stat.color];
          const Icon = config.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
              />
              <div className="relative p-4">
                <div className="mb-2.5 flex items-start justify-between">
                  <div
                    className={`${config.iconBg} rounded-lg p-2.5 shadow-sm transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {Number(stat.value).toLocaleString()}
                </p>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.gradient}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
