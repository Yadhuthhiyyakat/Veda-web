"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { tokenService } from "@/lib/services/token.service";
import { apiClient } from "@/lib/api-client";
import type { VerifyTokenResponse } from "@/lib/types/api.types";
import { ShieldIcon, LockIcon, ClockIcon, DocFileIcon, DownloadIcon, CheckIcon } from "@/lib/icons";
import { isAxiosError } from "axios";

export default function VerifyTokenPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [data, setData] = useState<VerifyTokenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Image / File state
    const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        async function fetchVerification() {
            setIsLoading(true);
            setErrorCode(null);
            setErrorMessage(null);
            try {
                const res = await tokenService.verifyToken(token);
                setData(res);

                // If document includes an attached file/photo, fetch securely via blob
                if (res.file_url) {
                    setIsLoadingImage(true);
                    try {
                        const fileRes = await apiClient.get(res.file_url, { responseType: "blob" });
                        const blobUrl = URL.createObjectURL(fileRes.data);
                        setImageBlobUrl(blobUrl);
                    } catch (fileErr) {
                        console.error("Failed to load attached file:", fileErr);
                    } finally {
                        setIsLoadingImage(false);
                    }
                }
            } catch (err) {
                if (isAxiosError(err)) {
                    setErrorCode(err.response?.data?.code || `${err.response?.status}`);
                    setErrorMessage(err.response?.data?.error || "This verification link is invalid or has expired.");
                } else {
                    setErrorMessage("Unable to verify credential at this time.");
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchVerification();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0b101b] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
            {/* Header / Brand */}
            <header className="w-full max-w-2xl flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-[#2563eb]/30">
                        <ShieldIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-base tracking-wider text-white">VEDA</span>
                        <span className="text-[10px] ml-1.5 px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold tracking-widest uppercase">
                            Verifier
                        </span>
                    </div>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                    Tamper-Evident Credential
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-2xl">
                {isLoading ? (
                    <div className="bg-[#121b2b] rounded-2xl border border-white/10 p-12 text-center">
                        <div className="w-10 h-10 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-semibold text-slate-300">Verifying Zero-Knowledge cryptographic token…</p>
                    </div>
                ) : errorMessage ? (
                    <div className="bg-[#121b2b] rounded-2xl border border-rose-500/30 p-8 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                            <LockIcon className="w-7 h-7" />
                        </div>
                        <h2 className="text-lg font-bold text-white">
                            {errorCode === "AUTH_REQUIRED"
                                ? "Restricted Verification (Sign-in Required)"
                                : errorCode === "RBAC_FORBIDDEN"
                                ? "Access Denied"
                                : "Verification Failed"}
                        </h2>
                        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                            {errorMessage}
                        </p>
                        {errorCode === "AUTH_REQUIRED" && (
                            <div className="pt-4">
                                <Link
                                    href={`/login?redirect=/verify/${token}`}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                                >
                                    <span>Sign in to VEDA</span>
                                </Link>
                            </div>
                        )}
                    </div>
                ) : data && (
                    <div className="bg-[#121b2b] rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
                        {/* Status Banner */}
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <CheckIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Credential Authenticated</h3>
                                    <p className="text-xs text-emerald-300">Cryptographic signature verified genuine</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Verified
                            </span>
                        </div>

                        {/* Document Overview */}
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold text-white">
                                {String(data.document.title || "Identity Credential")}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="capitalize">{String(data.document.category || "General")}</span>
                                <span>•</span>
                                <span className="capitalize">{String(data.document.subcategory || "Official")}</span>
                            </div>
                        </div>

                        {/* Disclosed Attributes */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Disclosed Attributes
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {Object.entries(data.document)
                                    .filter(([k]) => !["title", "category", "subcategory"].includes(k))
                                    .map(([key, value]) => (
                                        <div key={key} className="p-3 bg-[#0b101b] rounded-xl border border-white/5">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] mb-0.5">
                                                {key.replace(/_/g, " ")}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-200 break-words">
                                                {String(value)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Document Image / File Viewer */}
                        {data.file_url && (
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <DocFileIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
                                    <span>Verified Document File / Photo</span>
                                </h4>

                                {isLoadingImage ? (
                                    <div className="h-48 rounded-xl bg-white/5 animate-pulse flex items-center justify-center text-xs text-slate-400">
                                        Decrypting binary file buffer…
                                    </div>
                                ) : imageBlobUrl ? (
                                    <div className="space-y-3">
                                        <div
                                            onClick={() => setIsImageModalOpen(true)}
                                            className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0b101b] cursor-pointer max-h-80 flex items-center justify-center"
                                        >
                                            <img
                                                src={imageBlobUrl}
                                                alt="Verified Document Photo"
                                                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                                                Click to expand full size
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 truncate max-w-xs">{data.file_name || "document"}</span>
                                            <a
                                                href={imageBlobUrl}
                                                download={data.file_name || "verified_document"}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                                            >
                                                <DownloadIcon className="w-3.5 h-3.5" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
                                        Attached document file is present ({data.file_name || "document"}).
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Validity Footer */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span>Expires: {new Date(data.expires_at).toLocaleTimeString()}</span>
                            </span>
                            <span className="font-mono text-slate-400">Zero-Knowledge Verification</span>
                        </div>
                    </div>
                )}
            </main>

            {/* Full-screen Image Modal */}
            {isImageModalOpen && imageBlobUrl && (
                <div
                    onClick={() => setIsImageModalOpen(false)}
                    className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center cursor-zoom-out"
                >
                    <img
                        src={imageBlobUrl}
                        alt="Document Full View"
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
}
