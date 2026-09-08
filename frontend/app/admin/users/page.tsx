"use client";

import React, { useState } from "react";
import { Users, Search, Shield, UserCheck, UserX, Plus } from "lucide-react";
import { useToast } from "@/components/common/Toast";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { success: toastSuccess } = useToast();

  const mockUsers = [
    {
      id: "u-1",
      full_name: "Dr. Vikram Sethi",
      email: "vikram.sethi@bis.gov.in",
      role: "ADMIN",
      department: "Electrotechnical Bureau",
      status: "ACTIVE",
      created_at: "12 Jan 2025"
    },
    {
      id: "u-2",
      full_name: "Rajesh Kumar",
      email: "rajesh@electrotech.co.in",
      role: "MANUFACTURER",
      department: "ElectroTech Industries Pvt Ltd",
      status: "ACTIVE",
      created_at: "03 Feb 2025"
    },
    {
      id: "u-3",
      full_name: "Pooja Sharma",
      email: "pooja@zenithpower.in",
      role: "MSME_USER",
      department: "Zenith Batteries India LLP",
      status: "ACTIVE",
      created_at: "15 Feb 2025"
    },
    {
      id: "u-4",
      full_name: "Amit Varma",
      email: "amit@varmajewellers.com",
      role: "RETAIL_JEWELLER",
      department: "Varma Jewellers Retail",
      status: "ACTIVE",
      created_at: "28 Feb 2025"
    },
    {
      id: "u-5",
      full_name: "Suresh Menon",
      email: "suresh.menon@testinglab.org",
      role: "LAB_AUDITOR",
      department: "National Conformity Testing Lab",
      status: "ACTIVE",
      created_at: "01 Mar 2025"
    }
  ];

  const filtered = mockUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Role & Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage BIS officers, verified manufacturing applicants, lab auditors, and RBAC permissions.
          </p>
        </div>

        <button
          onClick={() => toastSuccess("Invited new user to portal")}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user by name, email, or role..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Organization / Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {u.full_name}
                    </div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full font-semibold text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {u.department}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-500/10 text-emerald-600">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {u.created_at}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toastSuccess(`Updated permissions for ${u.full_name}`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
