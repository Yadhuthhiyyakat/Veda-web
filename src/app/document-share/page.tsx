import DashSidebar from "../components/dash-sidebar";
import DashHeader from "../components/dash-header";
import { SharePanel } from "./_components/share-panel";
import React from "react";

export default function DocumentSharePage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans">
            <DashHeader />
            <div className="flex flex-1 overflow-hidden">
                <DashSidebar page="document-share" />
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#1a172c] mb-1">Shared Documents</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage documents shared via secure links</p>
                    </div>
                    <React.Suspense fallback={<div className="animate-pulse h-64 bg-white rounded-2xl border border-gray-100" />}>
                        <SharePanel />
                    </React.Suspense>
                </main>
            </div>
        </div>
    );
}
