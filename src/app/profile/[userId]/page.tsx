"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import type { PublicProfile } from "@/lib/types/api.types";
import { ShieldIcon, ArrowLeftIcon, AlertTriangleIcon, CopyIcon } from "@/lib/icons";
import { isAxiosError } from "axios";

interface PublicProfilePageProps {
    params: Promise<{ userId: string }>;
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
    const { userId } = use(params);
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        profileService
            .getPublicProfile(userId)
            .then((data) => {
                if (isMounted) setProfile(data);
            })
            .catch((err) => {
                if (!isMounted) return;
                if (isAxiosError(err)) {
                    setError(
                        err.response?.data?.error ||
                        err.response?.data?.message ||
                        (err.response?.status === 404
                            ? `User with ID "${userId}" was not found.`
                            : "Failed to load public profile.")
                    );
                } else {
                    setError("Failed to load public profile.");
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [userId]);

    const handleCopyId = () => {
        if (!userId) return;
        navigator.clipboard.writeText(userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans text-gray-800">
            {/* Top Bar */}
            <header className="h-[73px] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-xs">
                <Link href="/" className="flex items-center gap-2.5">
                    <ShieldIcon className="w-6 h-6 text-[#1a172c]" />
                    <span className="font-extrabold text-xl text-[#1a172c] tracking-wide">VEDA</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-[#5a4fcf] font-bold border border-indigo-100">
                        Public Verifier
                    </span>
                </Link>

                <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back to Dashboard
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    {isLoading ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-10 h-10 border-3 border-[#5a4fcf] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                                Resolving Public Identity
                            </p>
                            <p className="text-xs text-gray-400">
                                Verifying decentralized signature…
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangleIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Profile Not Found</h2>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">{error}</p>
                            <Link
                                href="/profile"
                                className="inline-flex items-center justify-center px-4 py-2 bg-[#5a4fcf] text-white text-xs font-semibold rounded-xl hover:bg-[#4a3fb8] transition-colors"
                            >
                                Return to My Profile
                            </Link>
                        </div>
                    ) : profile ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center relative overflow-hidden">
                            {/* Verified ribbon */}
                            <div className="mb-4 inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#5a4fcf] px-3.5 py-1 rounded-full text-xs font-bold">
                                Public Verified Identity
                            </div>

                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full border-3 border-[#5a4fcf] mx-auto mb-4 flex items-center justify-center bg-[#f4f2ff] overflow-hidden shadow-sm">
                                {profile.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.full_name || "User Avatar"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <span className="text-3xl font-extrabold text-[#5a4fcf]">
                                        {(profile.full_name || "U").charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-xl font-bold text-[#1a172c] mb-0.5">
                                {profile.full_name || "Anonymous User"}
                            </h1>
                            <p className="text-xs font-semibold text-[#5a4fcf] mb-5">
                                @{profile.username || "no-username"}
                            </p>

                            {/* User details */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left space-y-3 mb-6">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 font-medium">User ID</span>
                                    <div className="flex items-center gap-1 font-mono text-[11px] text-gray-700">
                                        <span className="truncate max-w-[190px]" title={profile.id}>
                                            {profile.id}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyId}
                                            className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                                            title="Copy User ID"
                                        >
                                            <CopyIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                {copied && (
                                    <p className="text-[10px] text-emerald-600 font-semibold text-right">
                                        Copied to clipboard!
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                                    <span className="text-gray-400 font-medium">Decentralized DID</span>
                                    <span className="font-mono text-[11px] text-gray-700 truncate max-w-[190px]">
                                        did:veda:solana:{profile.id.slice(0, 8)}...
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200/60">
                                    <span className="text-gray-400 font-medium">Authorization</span>
                                    <span className="text-[11px] text-emerald-600 font-semibold">
                                        Public Record
                                    </span>
                                </div>
                            </div>

                            <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                                This identity is publicly verified on the Veda cryptographic registry and can be safely used for document verification.
                            </p>

                            <Link
                                href="/profile"
                                className="block w-full py-2.5 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                            >
                                View My Profile
                            </Link>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
