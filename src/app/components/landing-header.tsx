"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { ShieldCheckIcon, MenuIcon, CloseIcon } from "@/lib/icons";

export default function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-20">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Image
                                src="/vedalogo.svg"
                                alt="Veda Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-2xl tracking-tight text-[#131127]">VEDA</span>
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Vault v2
                                </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-400 hidden sm:block -mt-1 tracking-wide">
                                Encrypted Digital Identity
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <a
                        href="#features"
                        className="text-sm font-semibold text-slate-600 hover:text-[#5a4fcf] transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#how-it-works"
                        className="text-sm font-semibold text-slate-600 hover:text-[#5a4fcf] transition-colors"
                    >
                        How It Works
                    </a>
                    <a
                        href="#security"
                        className="text-sm font-semibold text-slate-600 hover:text-[#5a4fcf] transition-colors"
                    >
                        Security &amp; Encryption
                    </a>
                    <a
                        href="#faq"
                        className="text-sm font-semibold text-slate-600 hover:text-[#5a4fcf] transition-colors"
                    >
                        FAQ
                    </a>
                </nav>

                {/* Right Actions */}
                <div className="hidden sm:flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-slate-700 hover:text-[#5a4fcf] px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        Sign In
                    </Link>
                    <Link href="/signup">
                        <button className="relative group overflow-hidden bg-[#131127] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-950/20 hover:bg-[#252048] hover:shadow-indigo-900/30 transition-all active:scale-98">
                            <span className="relative z-10 flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
                                Get Started Free
                            </span>
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-2">
                    <Link href="/login" className="text-xs font-bold text-slate-700 px-3 py-2">
                        Sign In
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-6 py-5 shadow-lg">
                    <div className="flex flex-col gap-4">
                        <a
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm font-semibold text-slate-700 py-1"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm font-semibold text-slate-700 py-1"
                        >
                            How It Works
                        </a>
                        <a
                            href="#security"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm font-semibold text-slate-700 py-1"
                        >
                            Security &amp; Encryption
                        </a>
                        <a
                            href="#faq"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-sm font-semibold text-slate-700 py-1"
                        >
                            FAQ
                        </a>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                <button className="w-full bg-[#131127] text-white py-3 rounded-xl font-bold text-sm text-center shadow-md">
                                    Get Started Free
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
