"use client";

import React from "react";
import { DocFileIcon, SendIcon, ClockIcon, BellIcon } from "@/lib/icons";

interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    count: string | number;
    label: string;
    sublabel: string;
    isLoading?: boolean;
}

export function StatCard({
    icon,
    iconBg,
    count,
    label,
    sublabel,
    isLoading = false,
}: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between gap-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    {label}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">
                    {isLoading ? (
                        <div className="w-12 h-7 bg-slate-100 rounded-md animate-pulse" />
                    ) : (
                        count
                    )}
                </div>
                <span className="text-[11px] font-medium text-slate-400 block">
                    {sublabel}
                </span>
            </div>

            <div
                className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
            >
                {icon}
            </div>
        </div>
    );
}

interface DashboardStatCardsProps {
    totalDocuments?: number;
    sharedToday?: number;
    expiringSoon?: number;
    recentActivity?: number;
    isLoading?: boolean;
}

export function DashboardStatCards({
    totalDocuments = 0,
    sharedToday = 0,
    expiringSoon = 0,
    recentActivity = 0,
    isLoading = false,
}: DashboardStatCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
                icon={<DocFileIcon className="text-indigo-600 w-5 h-5" />}
                iconBg="bg-indigo-50 text-indigo-600"
                count={totalDocuments}
                label="Total Vault Files"
                sublabel="Encrypted in vault"
                isLoading={isLoading}
            />
            <StatCard
                icon={<SendIcon className="text-emerald-600 w-5 h-5" />}
                iconBg="bg-emerald-50 text-emerald-600"
                count={sharedToday}
                label="Shared Active"
                sublabel="QR & secure links"
                isLoading={isLoading}
            />
            <StatCard
                icon={<ClockIcon className="text-amber-600 w-5 h-5" />}
                iconBg="bg-amber-50 text-amber-600"
                count={expiringSoon}
                label="Expiring Soon"
                sublabel="Next 30 days"
                isLoading={isLoading}
            />
            <StatCard
                icon={<BellIcon className="text-purple-600 w-5 h-5" />}
                iconBg="bg-purple-50 text-purple-600"
                count={recentActivity}
                label="Alerts &amp; Activity"
                sublabel="System notifications"
                isLoading={isLoading}
            />
        </div>
    );
}
