"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { SearchIcon, PlusIcon, ShieldCheckIcon } from "@/lib/icons";

interface DashboardTopBarProps {
    userName?: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export function DashboardTopBar({
    userName = "User",
    searchQuery,
    onSearchChange,
}: DashboardTopBarProps) {
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 pb-6 border-b border-slate-200/70">
            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131127] tracking-tight">
                        {greeting}, {userName.split(" ")[0]}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Vault Active
                    </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5 text-[#5a4fcf]" />
                    <span>Your digital identity &amp; credentials are end-to-end encrypted.</span>
                </p>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 lg:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <SearchIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search title, category, or UUID..."
                        className="w-full bg-white border border-slate-200/90 rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all shadow-2xs"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Upload Button */}
                <Link
                    href="/document-upload"
                    className="shrink-0 px-4 py-2.5 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-indigo-100 cursor-pointer active:scale-98"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                </Link>
            </div>
        </div>
    );
}
