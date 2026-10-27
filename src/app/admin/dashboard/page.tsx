"use client";

import React, { useEffect, useState, useMemo } from "react";
import DashHeader from "@/app/components/dash-header";
import DashSidebar from "@/app/components/dash-sidebar";
import { adminService, AdminStats, AdminUserItem } from "@/lib/services/admin.service";
import { profileService } from "@/lib/services/profile.service";
import type { Profile } from "@/lib/types/api.types";
import { institutionService } from "@/lib/services/institution.service";

const POPULAR_INSTITUTIONS = [
    { name: "National Institute of Technology Calicut", type: "university" },
    { name: "All India Institute of Medical Sciences (AIIMS)", type: "hospital" },
    { name: "Indian Institute of Technology Madras", type: "university" },
    { name: "Apollo Hospitals & Health Centers", type: "hospital" },
    { name: "Central Board of Secondary Education (CBSE)", type: "board" },
    { name: "Government Medical College Trivandrum", type: "hospital" },
];

export default function AdminDashboardPage() {
    const [myProfile, setMyProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUserItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "institution" | "citizen" | "admin">("all");

    // Modal state for role assignment
    const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
    const [newRole, setNewRole] = useState<"citizen" | "institution" | "admin">("institution");
    const [instName, setInstName] = useState("");
    const [instType, setInstType] = useState("university");
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const p = await profileService.getMyProfile();
            setMyProfile(p);

            // Fetch admin statistics and users
            const [s, u] = await Promise.all([
                adminService.getStats().catch(() => null),
                adminService.listUsers().catch(() => []),
            ]);

            setStats(s);
            setUsers(u);
        } catch (err: any) {
            console.error("Failed to load admin console data:", err);
        } finally {
            setIsLoading(false);
        }
    }

    // Filter users based on search & role filter
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesRole = roleFilter === "all" ? true : (u.role || "citizen") === roleFilter;
            const query = searchQuery.trim().toLowerCase();
            if (!query) return matchesRole;

            const nameMatch = (u.full_name || "").toLowerCase().includes(query);
            const userMatch = (u.username || "").toLowerCase().includes(query);
            const instMatch = (u.institution_name || "").toLowerCase().includes(query);

            return matchesRole && (nameMatch || userMatch || instMatch);
        });
    }, [users, roleFilter, searchQuery]);

    // Open role modal for a user
    function openRoleModal(user: AdminUserItem) {
        setSelectedUser(user);
        setNewRole(user.role || "citizen");
        setInstName(user.institution_name || "");
        setInstType(user.institution_type || "university");
        setFeedback(null);
    }

    // Submit role change
    async function handleSaveRole() {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            await adminService.assignRole(selectedUser.id, {
                role: newRole,
                institution_name: newRole === "institution" ? instName.trim() : undefined,
                institution_type: newRole === "institution" ? instType.trim() : undefined,
            });

            setFeedback({
                message: `Successfully updated ${selectedUser.full_name || selectedUser.username}'s role to ${newRole.toUpperCase()}.`,
                type: "success",
            });

            // Update local user list
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === selectedUser.id
                        ? {
                              ...u,
                              role: newRole,
                              institution_name: newRole === "institution" ? instName.trim() : null,
                              institution_type: newRole === "institution" ? instType.trim() : null,
                          }
                        : u
                )
            );

            // Refresh stats
            const updatedStats = await adminService.getStats().catch(() => null);
            if (updatedStats) setStats(updatedStats);

            setTimeout(() => {
                setSelectedUser(null);
                setFeedback(null);
            }, 1500);
        } catch (err: any) {
            setFeedback({
                message: err.message || "Failed to assign role. Make sure you have admin privileges.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    }

    // Promote self to admin (development/testing helper)
    async function handleSelfPromoteAdmin() {
        try {
            await institutionService.updateRole("admin");
            setFeedback({
                message: "Your current account is now granted SUPERADMIN authority.",
                type: "success",
            });
            await loadData();
        } catch (err: any) {
            setFeedback({ message: err.message || "Failed to elevate role", type: "error" });
        }
    }

    const isAdmin = myProfile?.role === "admin";

    return (
        <div className="flex h-screen bg-[#fafafa]">
            <DashSidebar page="admin" />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DashHeader />

                <main className="flex-1 overflow-y-auto px-6 py-8 max-w-7xl w-full mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-black text-[#1a172c] tracking-tight">
                                    Platform Admin Console
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                    Superadmin
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Authorize institutions, assign verifier credentials, and monitor platform authenticity.
                            </p>
                        </div>

                        {!isAdmin && (
                            <button
                                onClick={handleSelfPromoteAdmin}
                                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                            >
                                <span>⚡</span>
                                <span>Grant Superadmin to Current Account</span>
                            </button>
                        )}
                    </div>

                    {feedback && (
                        <div
                            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
                                feedback.type === "success"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                        >
                            <span>{feedback.message}</span>
                            <button
                                onClick={() => setFeedback(null)}
                                className="text-gray-400 hover:text-gray-700 ml-4"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Total Users
                            </span>
                            <div className="text-2xl font-black text-[#1a172c] mt-1.5">
                                {stats?.total_users ?? users.length}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                {stats?.total_citizens ?? 0} Citizens • {stats?.total_admins ?? 0} Admins
                            </div>
                        </div>

                        <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                                Registered Institutions
                            </span>
                            <div className="text-2xl font-black text-purple-900 mt-1.5">
                                {stats?.total_institutions ?? users.filter((u) => u.role === "institution").length}
                            </div>
                            <div className="text-[11px] text-purple-700/80 mt-1">
                                Universities, Hospitals, & Boards
                            </div>
                        </div>

                        <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                Verified Certificates
                            </span>
                            <div className="text-2xl font-black text-emerald-900 mt-1.5">
                                {stats?.verified_documents ?? 0}
                            </div>
                            <div className="text-[11px] text-emerald-700/80 mt-1">
                                Cryptographic seals issued
                            </div>
                        </div>

                        <div className="bg-white border border-rose-200/80 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                                Flagged Forgeries
                            </span>
                            <div className="text-2xl font-black text-rose-900 mt-1.5">
                                {stats?.flagged_forgeries ?? 0}
                            </div>
                            <div className="text-[11px] text-rose-700/80 mt-1">
                                Counterfeits blocked across platform
                            </div>
                        </div>
                    </div>

                    {/* Role Management Section */}
                    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
                        {/* Filters & Search Bar */}
                        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {(
                                    [
                                        { id: "all", label: "All Users" },
                                        { id: "institution", label: "Institutions Only" },
                                        { id: "citizen", label: "Citizens" },
                                        { id: "admin", label: "Admins" },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setRoleFilter(tab.id)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            roleFilter === tab.id
                                                ? "bg-[#1a172c] text-white shadow-xs"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative max-w-xs w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search name, username, or institution..."
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
                            </div>
                        </div>

                        {/* User Table */}
                        {isLoading ? (
                            <div className="p-12 text-center text-xs text-gray-400">Loading user accounts...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-xs text-gray-400">
                                No users match the current filter or search criteria.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50/60 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                                        <tr>
                                            <th className="px-5 py-3.5">User</th>
                                            <th className="px-5 py-3.5">Role</th>
                                            <th className="px-5 py-3.5">Authorized Institution</th>
                                            <th className="px-5 py-3.5">Type</th>
                                            <th className="px-5 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.map((user) => {
                                            const role = user.role || "citizen";
                                            return (
                                                <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                                                {(user.full_name || user.username || "U")[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-[#1a172c]">
                                                                    {user.full_name || "Unnamed User"}
                                                                </div>
                                                                <div className="text-[11px] text-gray-400">
                                                                    @{user.username || user.id.slice(0, 8)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-3.5">
                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                                role === "institution"
                                                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                                                    : role === "admin"
                                                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                                            }`}
                                                        >
                                                            {role}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-3.5">
                                                        {role === "institution" ? (
                                                            <span className="font-semibold text-gray-900">
                                                                🏛️ {user.institution_name || "Authorized Institution"}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3.5 capitalize text-gray-500">
                                                        {role === "institution"
                                                            ? user.institution_type || "General"
                                                            : "Standard"}
                                                    </td>

                                                    <td className="px-5 py-3.5 text-right">
                                                        <button
                                                            onClick={() => openRoleModal(user)}
                                                            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-purple-500 hover:text-purple-600 font-bold rounded-xl transition-all shadow-2xs text-[11px] cursor-pointer"
                                                        >
                                                            Manage Access
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Role Assignment Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-black text-[#1a172c]">
                                    Assign Access & Role
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Managing account: <strong>{selectedUser.full_name || selectedUser.username}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-gray-700 text-sm p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Select Role */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Account Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(
                                    [
                                        { id: "citizen", label: "Citizen", icon: "👤" },
                                        { id: "institution", label: "Institution", icon: "🏛️" },
                                        { id: "admin", label: "Admin", icon: "⚡" },
                                    ] as const
                                ).map((r) => (
                                    <button
                                        type="button"
                                        key={r.id}
                                        onClick={() => setNewRole(r.id)}
                                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                            newRole === r.id
                                                ? "border-purple-600 bg-purple-50/50 text-purple-900 font-bold shadow-xs"
                                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                                        }`}
                                    >
                                        <div className="text-lg">{r.icon}</div>
                                        <div className="text-xs mt-1">{r.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Institution Fields */}
                        {newRole === "institution" && (
                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">
                                        Institution Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={instName}
                                        onChange={(e) => setInstName(e.target.value)}
                                        placeholder="e.g. National Institute of Technology Calicut"
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-medium"
                                    />
                                    {/* Quick chips */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {POPULAR_INSTITUTIONS.map((inst) => (
                                            <button
                                                type="button"
                                                key={inst.name}
                                                onClick={() => {
                                                    setInstName(inst.name);
                                                    setInstType(inst.type);
                                                }}
                                                className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                                            >
                                                + {inst.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1">
                                        Institution Type
                                    </label>
                                    <select
                                        value={instType}
                                        onChange={(e) => setInstType(e.target.value)}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    >
                                        <option value="university">University / Higher Education</option>
                                        <option value="hospital">Hospital & Healthcare</option>
                                        <option value="board">Examination & Certification Board</option>
                                        <option value="government">State / Central Government Body</option>
                                        <option value="corporate">Authorized Corporate Issuer</option>
                                    </select>
                                </div>

                                <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 border border-purple-100">
                                    💡 <strong>Notice:</strong> This user will immediately receive access to the <strong>Institutional Verification Desk</strong> on Web and Mobile to inspect certificates and apply digital seals.
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveRole}
                                disabled={isSaving || (newRole === "institution" && !instName.trim())}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                                {isSaving ? "Saving…" : "Save Role & Access"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
