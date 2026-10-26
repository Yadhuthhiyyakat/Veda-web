"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { useSidebar } from "@/lib/context/sidebar-context";
import {
    LogoutIcon,
    CloseIcon,
    ShieldCheckIcon,
    FolderIcon,
    DocFileIcon,
    BellIcon,
    UserIcon,
} from "@/lib/icons";

export default function DashSidebar({ page }: { page: string }) {
    const router = useRouter();
    const { profile, logout } = useAuth();
    const { isOpen, close } = useSidebar();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
            router.push("/login");
        } catch {
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navContent = (
        <div className="flex flex-col h-full justify-between">
            {/* Top Navigation Items */}
            <div className="space-y-6">
                <div>
                    <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Overview
                    </div>
                    <div className="space-y-1">
                        <SidebarItem
                            href="/dashboard"
                            icon={<DashboardIcon />}
                            label="Dashboard"
                            active={page === "dashboard"}
                            onClick={close}
                        />
                        <SidebarItem
                            href="/document-details"
                            icon={<DocumentIcon />}
                            label="My Vault"
                            active={page === "document-details"}
                            onClick={close}
                        />
                        <SidebarItem
                            href="/document-categories"
                            icon={<FolderIcon />}
                            label="Categories"
                            active={page === "document-categories"}
                            onClick={close}
                        />
                        <SidebarItem
                            href="/document-share"
                            icon={<ShareIcon />}
                            label="Shared Links"
                            active={page === "document-share"}
                            onClick={close}
                        />
                    </div>
                </div>

                {profile?.role === "institution" && (
                    <div>
                        <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-indigo-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            <span>Institutional Authority</span>
                        </div>
                        <div className="space-y-1">
                            <SidebarItem
                                href="/institution/dashboard"
                                icon={<BuildingIcon />}
                                label="Verification Desk"
                                active={page === "institution"}
                                onClick={close}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Activity &amp; Management
                    </div>
                    <div className="space-y-1">
                        <SidebarItem
                            href="/profile-analytics"
                            icon={<ChartIcon />}
                            label="Vault Analytics"
                            active={page === "profile-analytics"}
                            onClick={close}
                        />
                        <SidebarItem
                            href="/profile"
                            icon={<UserIcon />}
                            label="Profile &amp; Credentials"
                            active={page === "profile"}
                            onClick={close}
                        />
                        <SidebarItem
                            href="/settings"
                            icon={<SettingsIcon />}
                            label="Settings"
                            active={page === "settings"}
                            onClick={close}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom User Card & Logout */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "V"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                            {profile?.full_name || "Active Vault"}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                            <ShieldCheckIcon className="w-3 h-3" />
                            <span>AES-256 Protected</span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-semibold group text-left disabled:opacity-50 cursor-pointer"
                >
                    <div className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors">
                        <LogoutIcon />
                    </div>
                    <span className="text-xs">{isLoggingOut ? "Signing out…" : "Sign Out"}</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/80 flex-col min-h-[calc(100vh-72px)] shrink-0 p-4 transition-all">
                {navContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={close}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl p-5 flex flex-col z-10 animate-in slide-in-from-left duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-lg text-[#131127]">VEDA</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5a4fcf]">
                                    Vault
                                </span>
                            </div>
                            <button
                                onClick={close}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {navContent}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function SidebarItem({
    href,
    icon,
    label,
    active,
    onClick,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                active
                    ? "bg-[#5a4fcf]/10 text-[#5a4fcf] font-bold shadow-2xs border border-[#5a4fcf]/15"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
            }`}
        >
            <div className={`w-4 h-4 transition-colors ${active ? "text-[#5a4fcf]" : "text-slate-400"}`}>
                {icon}
            </div>
            <span className="text-xs">{label}</span>
        </Link>
    );
}

// Icons
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
    );
}

function DocumentIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}

function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}
function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    );
}
