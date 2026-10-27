"use client";

import React, { useEffect, useState } from "react";
import DashHeader from "@/app/components/dash-header";
import DashSidebar from "@/app/components/dash-sidebar";
import { institutionService } from "@/lib/services/institution.service";
import type { InstitutionQueueItem, Profile } from "@/lib/types/api.types";
import { profileService } from "@/lib/services/profile.service";
import apiClient from "@/lib/api-client";
import { documentService } from "@/lib/services/document.service";

export default function InstitutionDashboardPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [queue, setQueue] = useState<InstitutionQueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<InstitutionQueueItem | null>(null);
    const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
    const [decisionNote, setDecisionNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Institution Registration form state (for switching role)
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [regInstName, setRegInstName] = useState("");
    const [regInstType, setRegInstType] = useState("university");
    const [isDownloading, setIsDownloading] = useState(false);
    const [tokenInput, setTokenInput] = useState("");
    const [isLookingUpToken, setIsLookingUpToken] = useState(false);

    async function handleDownloadFile(docId: string, title?: string) {
        setIsDownloading(true);
        try {
            const blob = await documentService.downloadFile(docId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${title || "document"}.bin`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setFeedback({ message: "Failed to download certificate file", type: "error" });
        } finally {
            setIsDownloading(false);
        }
    }

    async function handleVerifyByToken() {
        if (!tokenInput.trim()) return;
        setIsLookingUpToken(true);
        try {
            const res = await apiClient.get(`/tokens/verify/${tokenInput.trim()}`);
            const data = res.data;
            if (data && data.valid) {
                setSelectedDoc({
                    id: data.document_id || "scanned-doc",
                    title: data.document?.title || "Citizen Certificate",
                    type: data.document?.type || "certificate",
                    category: data.document?.category || "general",
                    subcategory: data.document?.subcategory || "general",
                    status: data.document?.status || "pending",
                    submission_status: "submitted",
                    target_institution: data.target_institution,
                    applicant_notes: data.applicant_notes,
                    verification_seal: data.verification_seal,
                    created_at: data.expires_at || new Date().toISOString(),
                    owner_name: "Citizen (Via Verification QR)",
                    document_data: data.document || {},
                    expiry_date: data.document?.expiry_date || null,
                    has_file: !!data.file_url,
                });
                setFeedback({ message: "Document verified via QR token. Ready for institutional review.", type: "success" });
            } else {
                setFeedback({ message: "Token not valid or expired", type: "error" });
            }
        } catch (err: any) {
            setFeedback({ message: err.response?.data?.error || "Token invalid or expired", type: "error" });
        } finally {
            setIsLookingUpToken(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const p = await profileService.getMyProfile();
            setProfile(p);
            if (p.role === "institution" || p.role === "admin") {
                const q = await institutionService.getQueue();
                setQueue(q.documents || []);
            }
        } catch (err: any) {
            console.error("Failed to load queue:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRoleSwitch(role: "citizen" | "institution") {
        setIsSubmitting(true);
        try {
            await institutionService.updateRole(
                role,
                role === "institution" ? (regInstName || "NIT Calicut") : undefined,
                regInstType
            );
            setShowRoleModal(false);
            setFeedback({
                message: `Account role switched to ${role.toUpperCase()}.`,
                type: "success",
            });
            await loadData();
        } catch (err: any) {
            setFeedback({ message: err.message || "Failed to update role", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleReview(decision: "genuine" | "fraudulent") {
        if (!selectedDoc) return;
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const instName = profile?.institution_name || "NIT Calicut";
            const res = await institutionService.reviewDocument(selectedDoc.id, {
                status: decision === "genuine" ? "verified" : "rejected",
                decision,
                institution_name: instName,
                institution_type: profile?.institution_type || "university",
                notes: decisionNote.trim() || (decision === "genuine" ? "Officially verified and sealed" : "Flagged as counterfeit by institution"),
            });

            setFeedback({
                message: decision === "genuine"
                    ? `Seal issued! Document verified under Seal #${res.verification_seal?.seal_id || "VDA-SEAL"}.`
                    : `Document flagged as counterfeit (#${res.verification_seal?.seal_id || "VDA-FORGED"}). Permanent warning applied.`,
                type: "success",
            });

            setSelectedDoc(null);
            setDecisionNote("");
            await loadData();
        } catch (err: any) {
            setFeedback({ message: err.message || "Failed to review document", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const filteredQueue = queue.filter((doc) => {
        if (filter === "pending") return doc.status === "pending" || doc.submission_status === "submitted";
        if (filter === "verified") return doc.status === "verified";
        if (filter === "rejected") return doc.status === "rejected";
        return true;
    });

    const pendingCount = queue.filter((d) => d.status === "pending" || d.submission_status === "submitted").length;
    const verifiedCount = queue.filter((d) => d.status === "verified").length;
    const rejectedCount = queue.filter((d) => d.status === "rejected").length;

    const isInstitution = profile?.role === "institution" || profile?.role === "admin";

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
            <DashHeader />
            <div className="flex flex-1">
                <DashSidebar page="institution" />
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {/* Header Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                    Institutional Verifier Desk
                                </span>
                                {isInstitution && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        Authorized Signatory
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                                {profile?.institution_name || "Institution Verification Portal"}
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Authenticate academic credentials, medical records, and digital seals with cryptographic authority.
                            </p>
                        </div>

                        {/* Mode Switcher / Role Badge */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setRegInstName(profile?.institution_name || "NIT Calicut");
                                    setShowRoleModal(true);
                                }}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-2"
                            >
                                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>{isInstitution ? "Manage Institution Profile" : "Switch to Institution Mode"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Feedback Toast */}
                    {feedback && (
                        <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center justify-between ${
                            feedback.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}>
                            <span>{feedback.message}</span>
                            <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4">Dismiss</button>
                        </div>
                    )}

                    {/* Non-Institution Guard */}
                    {!isInstitution ? (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xs">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Institution Authorization Required</h2>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                Your account is currently in <strong>Citizen</strong> mode. To inspect submitted credentials, issue official digital seals, or flag forged documents, switch your account to <strong>Institution</strong> mode.
                            </p>
                            <button
                                onClick={() => {
                                    setRegInstName("NIT Calicut");
                                    setShowRoleModal(true);
                                }}
                                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
                            >
                                Enable Institution Access (Instant)
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Pending Reviews</div>
                                        <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
                                        <div className="text-[11px] text-slate-500 mt-1">Awaiting your authority decision</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">⏳</div>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Approved &amp; Sealed</div>
                                        <div className="text-2xl font-black text-emerald-600">{verifiedCount}</div>
                                        <div className="text-[11px] text-slate-500 mt-1">Cryptographic seals issued</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">🛡️</div>
                                </div>

                                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Flagged Counterfeits</div>
                                        <div className="text-2xl font-black text-rose-600">{rejectedCount}</div>
                                        <div className="text-[11px] text-slate-500 mt-1">Permanent warning marks applied</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">⛔</div>
                                </div>
                            </div>

                            {/* QR Token Verification Quick Scan Box */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <span>🔍</span>
                                        <span>Verify Citizen via QR Token</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Scan or paste the verification token presented by the citizen to manually inspect and seal credentials.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <input
                                        type="text"
                                        value={tokenInput}
                                        onChange={(e) => setTokenInput(e.target.value)}
                                        placeholder="Paste citizen's QR token..."
                                        className="px-3.5 py-2 text-xs border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono w-full md:w-64"
                                    />
                                    <button
                                        type="button"
                                        disabled={isLookingUpToken || !tokenInput.trim()}
                                        onClick={handleVerifyByToken}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                                    >
                                        {isLookingUpToken ? "Inspecting..." : "Inspect QR"}
                                    </button>
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setFilter(tab)}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                                                filter === tab
                                                    ? "bg-indigo-600 text-white shadow-2xs"
                                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                                            }`}
                                        >
                                            {tab === "all" ? `All (${queue.length})` : `${tab} (${tab === "pending" ? pendingCount : tab === "verified" ? verifiedCount : rejectedCount})`}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={loadData}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <span>↻ Refresh Queue</span>
                                </button>
                            </div>

                            {/* Submissions Table / Cards */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
                                {isLoading ? (
                                    <div className="p-12 text-center text-slate-400 text-sm font-semibold">
                                        Loading verification requests...
                                    </div>
                                ) : filteredQueue.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="text-3xl mb-2">📬</div>
                                        <div className="text-sm font-bold text-slate-800">No verification requests in this view</div>
                                        <div className="text-xs text-slate-500 mt-1">When citizens submit documents to your institution, they will appear here.</div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {filteredQueue.map((item) => {
                                            const isVerified = item.status === "verified";
                                            const isRejected = item.status === "rejected";

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                >
                                                    <div className="flex items-start gap-4 min-w-0">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
                                                            isVerified
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : isRejected
                                                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                                        }`}>
                                                            {isVerified ? "✓" : isRejected ? "✕" : "?"}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-sm text-slate-900 truncate">
                                                                    {item.title}
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                                    {item.category}
                                                                </span>
                                                                {item.verification_seal && (
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                        item.verification_seal.is_genuine
                                                                            ? "bg-emerald-100 text-emerald-800"
                                                                            : "bg-rose-100 text-rose-800"
                                                                    }`}>
                                                                        Seal #{item.verification_seal.seal_id}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                                                                <span>Applicant: <strong className="text-slate-700">{item.owner_name}</strong></span>
                                                                <span>•</span>
                                                                <span>Target: <strong className="text-slate-700">{item.target_institution || "General Authority"}</strong></span>
                                                            </div>

                                                            {item.applicant_notes && (
                                                                <div className="mt-2 text-xs bg-slate-50 border border-slate-200/60 rounded-lg p-2 text-slate-600 max-w-xl">
                                                                    <strong>Applicant Notes:</strong> {item.applicant_notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDoc(item);
                                                                setDecisionNote(item.verification_seal?.notes || "");
                                                            }}
                                                            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer"
                                                        >
                                                            {item.verification_seal ? "Inspect & Modify Seal" : "Review &amp; Verify"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Review Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">Institutional Credential Review</h3>
                                <p className="text-xs text-slate-500">Examine submitted data and exercise statutory verification authority.</p>
                            </div>
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Document Summary */}
                        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 mb-5 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-semibold">Document Title</span>
                                <span className="text-sm font-bold text-slate-900">{selectedDoc.title}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-semibold">Applicant</span>
                                <span className="text-xs font-bold text-slate-800">{selectedDoc.owner_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-semibold">Category / Type</span>
                                <span className="text-xs font-semibold text-slate-700 uppercase">{selectedDoc.category} • {selectedDoc.subcategory}</span>
                            </div>
                            {selectedDoc.applicant_notes && (
                                <div className="pt-2 border-t border-slate-200/60">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">Applicant Roll / Record Reference:</span>
                                    <p className="text-xs text-slate-800 mt-0.5">{selectedDoc.applicant_notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Download Original Certificate File */}
                        {selectedDoc.has_file && (
                            <div className="mb-5">
                                <button
                                    type="button"
                                    disabled={isDownloading}
                                    onClick={() => handleDownloadFile(selectedDoc.id, selectedDoc.title)}
                                    className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-[#5a4fcf] text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-indigo-200 transition cursor-pointer disabled:opacity-50"
                                >
                                    <span>📄</span>
                                    <span>{isDownloading ? "Downloading file..." : "Download & Inspect Original Certificate File"}</span>
                                </button>
                            </div>
                        )}

                        {/* Decrypted Payload Preview */}
                        <div className="mb-5">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Submitted Credential Data</div>
                            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono max-h-48 overflow-y-auto">
                                <pre>{JSON.stringify(selectedDoc.document_data || {}, null, 2)}</pre>
                            </div>
                        </div>

                        {/* Decision Notes Input */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Verification / Audit Notes
                            </label>
                            <textarea
                                value={decisionNote}
                                onChange={(e) => setDecisionNote(e.target.value)}
                                placeholder="Enter registrar registry citation, student roll match confirmation, or reason for counterfeit detection..."
                                rows={3}
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 bg-white"
                            />
                        </div>

                        {/* Decision Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setSelectedDoc(null)}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleReview("fraudulent")}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span>⛔</span>
                                <span>Flag as Forged / Fake</span>
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleReview("genuine")}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span>🛡️</span>
                                <span>Approve &amp; Issue Digital Seal</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Institution Role Configuration Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Account Mode &amp; Authority</h3>
                        <p className="text-xs text-slate-500 mb-4">Switch your account role to act as a verifier or as a normal citizen.</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name</label>
                                <input
                                    type="text"
                                    value={regInstName}
                                    onChange={(e) => setRegInstName(e.target.value)}
                                    placeholder="e.g. NIT Calicut, Apollo Hospitals, Stanford"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Institution Type</label>
                                <select
                                    value={regInstType}
                                    onChange={(e) => setRegInstType(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                                >
                                    <option value="university">University / College</option>
                                    <option value="hospital">Hospital / Medical Center</option>
                                    <option value="corporate">Corporate / Employer</option>
                                    <option value="government">Government Body</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => handleRoleSwitch("citizen")}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200"
                            >
                                Set as Citizen
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleRoleSwitch("institution")}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            >
                                Save as Institution
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
