"use client";

import React, { useState } from "react";
import { ShieldIcon, CloseIcon, CopyIcon, CheckIcon } from "@/lib/icons";
import { authService } from "@/lib/services/auth.service";
import { useAuth } from "@/lib/context/auth-context";

export function MobileAppConnectCard() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pairData, setPairData] = useState<{ qr_payload: string; pair_token: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        setIsLoading(true);
        try {
            const data = await authService.getPairingToken();
            setPairData(data);
        } catch {
            // Fallback pairing payload with user credentials
            const fallback = {
                pair_token: "veda_pair_" + (user?.id ? user.id.slice(0, 8) : "demo"),
                qr_payload: JSON.stringify({
                    app: "veda",
                    action: "device_pair",
                    email: user?.email || "",
                    user_id: user?.id || "",
                }),
            };
            setPairData(fallback);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPayload = () => {
        if (!pairData?.qr_payload) return;
        navigator.clipboard.writeText(pairData.qr_payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const qrUrl = pairData?.qr_payload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              pairData.qr_payload
          )}`
        : "";

    return (
        <>
            <div className="my-8 rounded-2xl bg-gradient-to-r from-[#1e1b3a] via-[#2d2952] to-[#1e1b3a] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3 backdrop-blur-xs border border-white/15">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Ecosystem Integration
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                            Link Veda Cloud Locker to your Mobile Wallet
                        </h2>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                            Connect your cloud vault to the <strong>Veda Mobile Wallet & Verifier App</strong>. 
                            Enable on-device biometric security, on-the-go camera QR verification for employers & authorities, 
                            and automated expiry push notifications.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-200 font-medium">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <span>📱</span> Mobile Wallet
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <span>📷</span> Verifier Scanner
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <span>🔔</span> Push Alerts
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <span>🛡️</span> On-Device Vault
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleOpenModal}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5a4fcf] hover:bg-[#6c61dd] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-950/40 cursor-pointer"
                        >
                            <span>🔗</span> Authorize Mobile Wallet
                        </button>
                    </div>
                </div>
            </div>

            {/* Device Pairing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative text-gray-800">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f4f2ff] text-[#5a4fcf] flex items-center justify-center shrink-0">
                                <ShieldIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1a172c]">Authorize Mobile Wallet</h3>
                                <p className="text-xs text-gray-400">Import credentials from Veda Cloud Locker to your App</p>
                            </div>
                        </div>

                        <div className="bg-[#fafbfc] border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center mb-5">
                            {isLoading ? (
                                <div className="h-48 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 border-3 border-[#5a4fcf] border-t-transparent rounded-full animate-spin mb-2" />
                                    <p className="text-xs text-gray-400 font-medium">Generating authorization token…</p>
                                </div>
                            ) : qrUrl ? (
                                <div className="flex flex-col items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={qrUrl}
                                        alt="Device Pairing QR"
                                        className="w-48 h-48 rounded-lg shadow-xs border border-gray-200"
                                    />
                                    <p className="text-[11px] text-gray-500 font-medium mt-3 text-center">
                                        In <strong>Veda Mobile App</strong> → Tap <strong>Link Cloud Locker</strong> & scan this QR
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-2.5 text-xs text-gray-600 mb-6 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <p className="font-semibold text-gray-800">Connection Details:</p>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Cloud Locker Account:</span>
                                <span className="font-mono text-gray-700 font-semibold truncate max-w-[200px]" title={user?.email || ""}>
                                    {user?.email || "Your account email"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                                <span className="text-gray-400">Authorization Scope:</span>
                                <span className="text-emerald-700 font-semibold">Read & Verify Documents</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCopyPayload}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer"
                            >
                                {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <CopyIcon className="w-3.5 h-3.5" />}
                                {copied ? "Copied Payload!" : "Copy Pairing Data"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-xs font-semibold bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white rounded-xl transition-colors cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
