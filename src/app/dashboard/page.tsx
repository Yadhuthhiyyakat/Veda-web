"use client";

import DashSidebar from "../components/dash-sidebar";
import DashHeader from "../components/dash-header";
import { DashboardTopBar } from "./_components/dashboard-top-bar";
import { DashboardStatCards } from "./_components/stat-cards";
import { RecentDocumentsTable } from "./_components/recent-documents-table";
import { LinkedDevicesCard } from "./_components/linked-devices-card";
import { useDashboard } from "./_hooks/use-dashboard";
import React from "react";

export default function Dashboard() {
    const { profile, searchQuery, setSearchQuery, documents, stats, isLoading, error } =
        useDashboard();

    return (
        <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans">
            <DashHeader />

            <div className="flex flex-1 overflow-hidden">
                <DashSidebar page="dashboard" />

                <main className="flex-1 p-8 overflow-y-auto">
                    {error && (
                        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <DashboardTopBar
                        userName={profile?.full_name || "User"}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    <DashboardStatCards
                        totalDocuments={stats.totalDocuments}
                        sharedToday={stats.sharedToday}
                        expiringSoon={stats.expiringSoon}
                        recentActivity={stats.recentActivity}
                        isLoading={isLoading}
                    />

                    <LinkedDevicesCard documents={documents} />

                    <RecentDocumentsTable documents={documents} isLoading={isLoading} />
                </main>
            </div>
        </div>
    );
}
