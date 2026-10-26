"use client";

import React, { useState, useEffect } from "react";
import { deviceService, LinkedDevice } from "@/lib/services/device.service";
import { consentService, ConsentRequest } from "@/lib/services/consent.service";
import { useAuth } from "@/lib/context/auth-context";
import { CloseIcon, CopyIcon, CheckIcon } from "@/lib/icons";

interface Props {
    documents?: Array<{ id: string; title: string }>;
}

export function LinkedDevicesCard({ documents = [] }: Props) {
    const { user } = useAuth();
    const [devices, setDevices] = useState<LinkedDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPairModalOpen, setIsPairModalOpen] = useState(false);
    const [pairData, setPairData] = useState<{ qr_payload: string; pair_token: string } | null>(null);
    const [isGeneratingPair, setIsGeneratingPair] = useState(false);
    const [copied, setCopied] = useState(false);

    // Revocation state
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);

    // UPI Collect Request Simulator state
    const [isSimulating, setIsSimulating] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string>("");
    const [activeConsentReq, setActiveConsentReq] = useState<ConsentRequest | null>(null);
    const [consentStatus, setConsentStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle");

    useEffect(() => {
        loadDevices();
    }, []);

    useEffect(() => {
        if (documents.length > 0 && !selectedDocId) {
            setSelectedDocId(documents[0].id);
        }
    }, [documents, selectedDocId]);

    const loadDevices = async () => {
        setIsLoading(true);
        try {
            const data = await deviceService.getLinkedDevices();
            setDevices(data.devices || []);
        } catch {
            // Handled in service fallback
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPairModal = async () => {
        setIsPairModalOpen(true);
        setIsGeneratingPair(true);
        try {
            const data = await deviceService.getPairingToken();
            setPairData(data);
        } catch {
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
            setIsGeneratingPair(false);
        }
    };

    const handleRevokeDevice = async (id: string) => {
        setRevokingId(id);
        try {
            await deviceService.revokeDevice(id);
            setDevices((prev) =>
                prev.map((d) => (d.id === id ? { ...d, status: "revoked" as const } : d))
            );
        } finally {
            setRevokingId(null);
            setRevokeConfirmId(null);
        }
    };

    const handleCopyPayload = () => {
        if (!pairData?.qr_payload) return;
        navigator.clipboard.writeText(pairData.qr_payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Trigger UPI-Style Consent Request
    const handleSendConsentRequest = async () => {
        if (!selectedDocId) return;
        setIsSimulating(true);
        setConsentStatus("pending");

        try {
            const req = await consentService.createRequest({
                document_id: selectedDocId,
                verifier_name: "Infosys Campus Verification",
                reason: "Employment Background Check",
                requested_fields: ["title", "category", "student_name", "degree", "status"],
            });
            setActiveConsentReq(req);

            // Poll for response
            const interval = setInterval(async () => {
                try {
                    const status = await consentService.getStatus(req.id);
                    if (status.status === "approved" || status.status === "rejected") {
                        setConsentStatus(status.status);
                        setActiveConsentReq(status);
                        clearInterval(interval);
                    }
                } catch {
                    // ignore polling errors
                }
            }, 3000);

            // Auto stop polling after 60s
            setTimeout(() => clearInterval(interval), 60000);
        } catch {
            setConsentStatus("idle");
        } finally {
            setIsSimulating(false);
        }
    };

    const qrUrl = pairData?.qr_payload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              pairData.qr_payload
          )}`
        : "";

    const activeDevices = devices.filter((d) => d.status === "active");

    return (
        <div className="my-8 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#17142b] via-[#241f45] to-[#17142b] p-6 text-white relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            UPI-Style Mobile Authorization
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Linked Mobile Wallets & Verifiers
                        </h2>
                        <p className="text-xs text-gray-300 mt-1 max-w-xl">
                            Like your bank account links to Google Pay or PhonePe, your VEDA Cloud Locker links to your mobile app for hardware-bound biometric credential presentation.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenPairModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5a4fcf] hover:bg-[#6c61dd] text-white font-semibold text-xs rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                    >
                        <span>📲</span> Link New Mobile Device
                    </button>
                </div>
            </div>

            {/* Devices List */}
            <div className="p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Authorized Devices ({activeDevices.length} Active)
                </h3>

                {isLoading ? (
                    <div className="py-8 text-center text-gray-400 text-xs animate-pulse">
                        Loading authorized devices...
                    </div>
                ) : devices.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6">
                        <span className="text-3xl mb-2 block">📱</span>
                        <p className="text-sm font-semibold text-gray-700">No Mobile Wallets Linked</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Link your Android or iOS phone to enable contactless biometric credential presentation and instant UPI-style verifications.
                        </p>
                        <button
                            type="button"
                            onClick={handleOpenPairModal}
                            className="mt-4 px-4 py-2 bg-[#5a4fcf] text-white text-xs font-semibold rounded-lg hover:bg-[#4a3fb8] transition-colors"
                        >
                            Pair Device Now
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {devices.map((device) => {
                            const isRevoked = device.status === "revoked";
                            return (
                                <div
                                    key={device.id}
                                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                        isRevoked
                                            ? "bg-gray-50 border-gray-200 opacity-60"
                                            : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-xs"
                                    }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                                                isRevoked
                                                    ? "bg-gray-200 text-gray-500"
                                                    : "bg-indigo-50 text-[#5a4fcf]"
                                            }`}
                                        >
                                            {device.platform === "ios" ? "🍏" : "🤖"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-gray-800">
                                                    {device.deviceName}
                                                </h4>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        isRevoked
                                                            ? "bg-rose-100 text-rose-700"
                                                            : "bg-emerald-100 text-emerald-700"
                                                    }`}
                                                >
                                                    {isRevoked ? "Revoked" : "Active • Biometric Bound"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                                Device ID: {device.deviceId} • Paired:{" "}
                                                {new Date(device.pairedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {!isRevoked && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            {revokeConfirmId === device.id ? (
                                                <div className="flex items-center gap-2 animate-fade-in">
                                                    <span className="text-xs text-rose-600 font-semibold">
                                                        Revoke wallet?
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRevokeDevice(device.id)}
                                                        disabled={revokingId === device.id}
                                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        {revokingId === device.id ? "Revoking..." : "Confirm"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRevokeConfirmId(null)}
                                                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setRevokeConfirmId(device.id)}
                                                    className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                                                >
                                                    Revoke Access
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* UPI-Style Collect Request Simulator */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span>⚡</span> UPI-Style Verification Request Simulator
                            </h4>
                            <p className="text-xs text-gray-500">
                                Simulate a third party (e.g. Infosys or Embassy) requesting verification of a document from your linked mobile wallet.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#fafbfc] rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="w-full md:w-auto flex-1">
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">
                                SELECT DOCUMENT TO REQUEST
                            </label>
                            <select
                                value={selectedDocId}
                                onChange={(e) => setSelectedDocId(e.target.value)}
                                className="w-full bg-white border border-gray-200 text-gray-800 text-xs rounded-lg p-2 font-medium"
                            >
                                {documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.title}
                                        </option>
                                    ))
                                ) : (
                                    <option value="demo-doc">B.Tech Degree Certificate (Sample)</option>
                                )}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleSendConsentRequest}
                            disabled={isSimulating || consentStatus === "pending"}
                            className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
                        >
                            {isSimulating || consentStatus === "pending"
                                ? "Waiting for Mobile Approval..."
                                : "Send Verification Request to Phone"}
                        </button>
                    </div>

                    {/* Live status alert */}
                    {consentStatus === "pending" && (
                        <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                <span className="text-xs font-bold text-amber-900">
                                    Request sent! Please open your VEDA Mobile App and tap "Approve with Biometrics".
                                </span>
                            </div>
                            <span className="text-[11px] text-amber-700 font-mono">
                                Request ID: {activeConsentReq?.id}
                            </span>
                        </div>
                    )}

                    {consentStatus === "approved" && (
                        <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                                <span>✅</span> Biometrically Approved on Mobile! Document Verified Authentically.
                            </div>
                            <button
                                type="button"
                                onClick={() => setConsentStatus("idle")}
                                className="text-xs text-emerald-700 font-semibold underline cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Device Pairing Modal */}
            {isPairModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative text-gray-800">
                        <button
                            type="button"
                            onClick={() => setIsPairModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-50 text-[#5a4fcf] rounded-2xl mx-auto flex items-center justify-center text-2xl mb-3 shadow-inner">
                                📱
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Pair VEDA Mobile Wallet
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                Open the VEDA App on your phone and scan this QR code to bind your hardware device securely.
                            </p>
                        </div>

                        <div className="my-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                            {isGeneratingPair ? (
                                <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400 animate-pulse">
                                    Generating device token...
                                </div>
                            ) : qrUrl ? (
                                <>
                                    <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-200">
                                        <img
                                            src={qrUrl}
                                            alt="Device Pairing QR"
                                            className="w-48 h-48 rounded-lg"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-3 font-medium">
                                        ⏱️ One-time token expires in 10 minutes
                                    </p>
                                </>
                            ) : null}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCopyPayload}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                {copied ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <CopyIcon className="w-4 h-4" />}
                                {copied ? "Copied Token" : "Copy Token"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPairModalOpen(false)}
                                className="flex-1 py-2.5 px-4 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
