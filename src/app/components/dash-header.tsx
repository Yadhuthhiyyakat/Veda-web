"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldIcon, UserIcon, MenuIcon, PlusIcon, LogoutIcon } from "@/lib/icons";
import { useAuth } from "@/lib/context/auth-context";
import { useSidebar } from "@/lib/context/sidebar-context";

/**
 * Modern sticky top navigation header used across all authenticated pages.
 * Shows brand, mobile toggle, quick upload CTA, notification bell, and user menu dropdown.
 */
export default function DashHeader() {
    const { user, profile, logout } = useAuth();
    const router = useRouter();
    const { toggle } = useSidebar();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close user dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            await logout();
            router.push("/login");
        } catch {
            router.push("/login");
        }
    };

    return (
        <header className="sticky top-0 z-30 h-18 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-all">
            {/* Left Brand & Mobile Menu */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggle}
                    className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Toggle Navigation Drawer"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>

                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#131127] to-[#252048] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                        <ShieldIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-lg text-[#131127] tracking-tight">VEDA</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-[#5a4fcf] border border-indigo-100">
                                Vault
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Right Quick Actions & Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Quick Upload CTA button */}
                <Link
                    href="/document-upload"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
                >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                </Link>



                {/* User Avatar & Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-expanded={menuOpen}
                    >
                        <div className="w-9 h-9 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center bg-indigo-50/50 shadow-2xs">
                            {profile?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name || "Avatar"}
                                    className="w-full h-full object-cover"
                                />
                            ) : profile?.full_name ? (
                                <span className="text-xs font-bold text-[#5a4fcf]">
                                    {profile.full_name.charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <UserIcon className="w-4 h-4 text-slate-500" />
                            )}
                        </div>
                        <div className="hidden lg:flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                                {profile?.full_name || "My Account"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">Verified User</span>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 text-xs font-semibold z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                <div className="font-bold text-slate-800 truncate">
                                    {profile?.full_name || "User"}
                                </div>
                                <div className="text-[11px] font-normal text-slate-400 truncate">
                                    {user?.email || "Encrypted Session"}
                                </div>
                            </div>

                            <Link
                                href="/profile"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <UserIcon className="w-4 h-4 text-slate-400" />
                                <span>Profile &amp; Credentials</span>
                            </Link>

                            <Link
                                href="/settings"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <ShieldIcon className="w-4 h-4 text-slate-400" />
                                <span>Security &amp; Preferences</span>
                            </Link>



                            <div className="pt-1 mt-1 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-semibold"
                                >
                                    <LogoutIcon className="w-4 h-4 text-rose-500" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
