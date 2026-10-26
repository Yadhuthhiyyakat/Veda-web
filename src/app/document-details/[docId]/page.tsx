"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import DashHeader from "../../components/dash-header";
import DashSidebar from "../../components/dash-sidebar";
import {
    ArrowLeftIcon,
    ShieldIcon,
    DocFileIcon,
    DownloadIcon,
    EditIcon,
    TrashIcon,
    SendIcon,
    CopyIcon,
    CheckIcon,
    EyeIcon,
    EyeOffIcon,
} from "@/lib/icons";
import { useSingleDocument } from "./_hooks/use-single-document";
import { EditDocumentModal } from "./_components/edit-document-modal";
import { DeleteDocumentModal } from "./_components/delete-document-modal";
import { SubmitVerificationModal } from "./_components/submit-verification-modal";

interface DocumentDetailPageProps {
    params: Promise<{ docId: string }>;
}

function statusBadge(status: string) {
    switch (status) {
        case "verified":
            return "bg-[#e0f8e9] text-[#22c55e] border border-emerald-200";
        case "pending":
            return "bg-[#fef9c3] text-[#ca8a04] border border-amber-200";
        case "rejected":
            return "bg-[#fee2e2] text-[#ef4444] border border-rose-200";
        default:
            return "bg-gray-100 text-gray-500 border border-gray-200";
    }
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
    const { docId } = use(params);
    const {
        doc,
        categories,
        isLoading,
        error,
        toastMessage,
        decryptedData,
        isDecrypting,
        isDecryptedVisible,
        decryptError,
        isDownloading,
        downloadError,
        isEditModalOpen,
        setIsEditModalOpen,
        isSubmittingEdit,
        editError,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isDeleting,
        handleDecrypt,
        handleDownloadFile,
        handleUpdate,
        handleDelete,
        refresh,
    } = useSingleDocument(docId);

    const [copiedId, setCopiedId] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);
    const [viewRawJson, setViewRawJson] = useState(false);

    const copyDocId = () => {
        if (!doc) return;
        navigator.clipboard.writeText(doc.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const copyDecryptedJson = () => {
        if (!decryptedData) return;
        navigator.clipboard.writeText(JSON.stringify(decryptedData, null, 2));
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans text-gray-800">
            <DashHeader />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#1a172c] text-white text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                <DashSidebar page="document-details" />

                <main className="flex-1 p-8 overflow-y-auto">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Link
                            href="/document-details"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#5a4fcf] transition-colors cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Back to Documents</span>
                        </Link>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
                            <div className="w-8 h-8 border-3 border-[#5a4fcf]/20 border-t-[#5a4fcf] rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm font-semibold text-gray-700">Loading document metadata…</p>
                            <p className="text-xs text-gray-400 mt-1">Connecting to secure document vault</p>
                        </div>
                    ) : error || !doc ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-xs">
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                                <DocFileIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 mb-2">Document Not Found</h2>
                            <p className="text-xs text-gray-500 mb-6">{error || "Unable to retrieve this document."}</p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => refresh()}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-xl text-gray-700 cursor-pointer"
                                >
                                    Retry
                                </button>
                                <Link
                                    href="/document-details"
                                    className="px-4 py-2 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-xs font-semibold rounded-xl text-white cursor-pointer"
                                >
                                    Return to Documents
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Document Header & Actions */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadge(
                                                    doc.status
                                                )}`}
                                            >
                                                {doc.status}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-[#5a4fcf] uppercase">
                                                {doc.type}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Category: <strong className="text-gray-600 capitalize">{doc.category}</strong>
                                                {doc.subcategory && ` / ${doc.subcategory}`}
                                            </span>
                                        </div>

                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a172c]">
                                            {doc.title}
                                        </h1>

                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>Document ID:</span>
                                            <code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono text-[11px]">
                                                {doc.id}
                                            </code>
                                            <button
                                                onClick={copyDocId}
                                                className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                                                title="Copy Document ID"
                                            >
                                                {copiedId ? (
                                                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <CopyIcon className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        {/* Download Binary File (6.5) */}
                                        <button
                                            type="button"
                                            onClick={handleDownloadFile}
                                            disabled={isDownloading}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                            title="Download and decrypt the stored binary file (6.5)"
                                        >
                                            <DownloadIcon
                                                className={`w-3.5 h-3.5 text-[#5a4fcf] ${
                                                    isDownloading ? "animate-bounce" : ""
                                                }`}
                                            />
                                            <span>{isDownloading ? "Downloading…" : "Download File"}</span>
                                        </button>

                                        {/* Submit to Institution for Verification */}
                                        <button
                                            type="button"
                                            onClick={() => setIsSubmitModalOpen(true)}
                                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                                            title="Request institutional verification seal"
                                        >
                                            <span>🛡️</span>
                                            <span>
                                                {doc.submission_status === "submitted"
                                                    ? `Submitted (${doc.target_institution || "Institution"})`
                                                    : "Verify via Institution"}
                                            </span>
                                        </button>

                                        {/* Share QR / Token Link */}
                                        <Link
                                            href={`/document-share?docId=${doc.id}`}
                                            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#5a4fcf] text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                                            title="Generate temporary QR access token"
                                        >
                                            <SendIcon className="w-3.5 h-3.5" />
                                            <span>Share / QR</span>
                                        </Link>

                                        {/* Edit Document Metadata (6.8) */}
                                        <button
                                            type="button"
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                                            title="Edit metadata or expiry date (6.8)"
                                        >
                                            <EditIcon className="w-3.5 h-3.5 text-gray-500" />
                                            <span>Edit</span>
                                        </button>

                                        {/* Delete Document (6.9) */}
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-xs cursor-pointer"
                                            title="Delete document and remove stored file (6.9)"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {downloadError && (
                                    <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl">
                                        {downloadError}
                                    </div>
                                )}

                                {doc.verification_seal && (
                                    <div className={`mt-5 p-4 rounded-xl border flex items-start gap-3.5 ${
                                        doc.verification_seal.is_genuine && doc.status !== "rejected"
                                            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                                            : "bg-rose-50/90 border-rose-300 text-rose-950"
                                    }`}>
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-bold ${
                                            doc.verification_seal.is_genuine && doc.status !== "rejected"
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "bg-rose-600 text-white shadow-xs"
                                        }`}>
                                            {doc.verification_seal.is_genuine && doc.status !== "rejected" ? "✓" : "⛔"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-extrabold text-sm">
                                                    {doc.verification_seal.is_genuine && doc.status !== "rejected"
                                                        ? `OFFICIALLY VERIFIED BY ${doc.verification_seal.verifier_name.toUpperCase()}`
                                                        : "FLAGGED AS NOT GENUINE / COUNTERFEIT"}
                                                </span>
                                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white font-bold border border-current/20">
                                                    Seal #${doc.verification_seal.seal_id}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-1 leading-relaxed opacity-90">
                                                {doc.verification_seal.notes || (
                                                    doc.verification_seal.is_genuine
                                                        ? "This credential has been examined, confirmed authentic, and sealed."
                                                        : "This credential was examined by the institution and flagged as fake. Permanent warning applied."
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Main Two-Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left 2 Columns: Encrypted Document Payload & File Decryption */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* 6.4 AES-256-GCM Encrypted Document Payload Section */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-gray-100 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5a4fcf] flex items-center justify-center">
                                                    <ShieldIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-bold text-[#1a172c]">
                                                        Encrypted Document Data (AES-256-GCM)
                                                    </h2>
                                                    <p className="text-xs text-gray-400">
                                                        Stored ciphertext payload protected by server encryption key
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Decrypt / Hide Action Button (6.4) */}
                                            <button
                                                type="button"
                                                onClick={handleDecrypt}
                                                disabled={isDecrypting}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                                    isDecryptedVisible
                                                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        : "bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white shadow-md shadow-indigo-100"
                                                } disabled:opacity-50`}
                                            >
                                                {isDecrypting ? (
                                                    <>
                                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Decrypting…</span>
                                                    </>
                                                ) : isDecryptedVisible ? (
                                                    <>
                                                        <EyeOffIcon className="w-3.5 h-3.5" />
                                                        <span>Hide Payload</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        <span>Decrypt Document Data (6.4)</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {decryptError && (
                                            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl">
                                                {decryptError}
                                            </div>
                                        )}

                                        {/* Decrypted Payload Content */}
                                        {isDecryptedVisible && decryptedData ? (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                            ✓ AES-256 Plaintext Decrypted
                                                        </span>
                                                        <span className="text-gray-400">
                                                            ({Object.keys(decryptedData).length} attributes)
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewRawJson(!viewRawJson)}
                                                            className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
                                                        >
                                                            {viewRawJson ? "View Key-Value" : "View Raw JSON"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={copyDecryptedJson}
                                                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                            title="Copy Decrypted JSON"
                                                        >
                                                            {copiedJson ? (
                                                                <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                                                            ) : (
                                                                <CopyIcon className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {Object.keys(decryptedData).length === 0 ? (
                                                    <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
                                                        No custom document data attributes stored for this document.
                                                    </div>
                                                ) : viewRawJson ? (
                                                    <pre className="bg-[#1a172c] text-emerald-300 p-5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
                                                        {JSON.stringify(decryptedData, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {Object.entries(decryptedData).map(([key, val]) => (
                                                            <div
                                                                key={key}
                                                                className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-1"
                                                            >
                                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                                                    {key.replace(/_/g, " ")}
                                                                </span>
                                                                <span className="text-xs font-semibold text-gray-800 break-words block">
                                                                    {typeof val === "object"
                                                                        ? JSON.stringify(val)
                                                                        : String(val ?? "—")}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl space-y-2">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                                                    <ShieldIcon className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-700">
                                                    Data is currently encrypted at rest
                                                </p>
                                                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                                                    Click &quot;Decrypt Document Data&quot; to securely fetch the
                                                    AES-256-GCM decrypted plaintext JSON payload from the server.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* 6.5 Binary File Information & Decryption Download */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <DocFileIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-[#1a172c]">
                                                    Encrypted Binary File Attachment (6.5)
                                                </h2>
                                                <p className="text-xs text-gray-400">
                                                    Secure storage file buffer decrypted on-the-fly with mime-type streaming
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xs font-bold uppercase text-gray-600">
                                                    {doc.type ? doc.type.slice(0, 3) : "FILE"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{doc.title}</p>
                                                    <p className="text-[11px] text-gray-400">
                                                        AES-256 encrypted binary stream
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleDownloadFile}
                                                disabled={isDownloading}
                                                className="px-4 py-2 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                            >
                                                <DownloadIcon className="w-3.5 h-3.5" />
                                                <span>{isDownloading ? "Streaming File…" : "Download & Decrypt File"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right 1 Column: Metadata & Cryptographic Details */}
                                <div className="space-y-6">
                                    {/* Document Metadata (6.3) */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Document Metadata (6.3)
                                        </h3>

                                        <div className="space-y-3 text-xs">
                                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Category</span>
                                                <span className="font-semibold text-gray-800 capitalize">
                                                    {doc.category || "other"}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Subcategory</span>
                                                <span className="font-semibold text-gray-800 capitalize">
                                                    {doc.subcategory || "general"}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Document Type</span>
                                                <span className="font-semibold text-gray-800 uppercase">
                                                    {doc.type}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Expiry Date</span>
                                                <span className="font-bold text-gray-800">
                                                    {doc.expiry_date
                                                        ? new Date(doc.expiry_date).toLocaleDateString("en-US", {
                                                              month: "long",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : "No Expiration"}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                                <span className="text-gray-500 font-medium">Created At</span>
                                                <span className="font-medium text-gray-600">
                                                    {new Date(doc.created_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-gray-500 font-medium">Last Updated</span>
                                                <span className="font-medium text-gray-600">
                                                    {new Date(doc.updated_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security & Verification Card */}
                                    <div className="bg-gradient-to-br from-[#1a172c] to-[#2e294e] text-white rounded-2xl p-6 shadow-sm space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                <ShieldIcon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                                                Vault Security
                                            </h4>
                                        </div>

                                        <p className="text-xs text-gray-300 leading-relaxed">
                                            This document is encrypted with <strong>AES-256-GCM</strong> cipher. Decryption
                                            keys are held in isolated HSM/KMS environments, ensuring strict data residency
                                            and privacy compliance.
                                        </p>

                                        <div className="pt-2">
                                            <Link
                                                href={`/document-share?docId=${doc.id}`}
                                                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                                            >
                                                <SendIcon className="w-3.5 h-3.5" />
                                                <span>Issue Zero-Knowledge Share Token</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals for Edit (6.8) and Delete (6.9) */}
            {doc && (
                <>
                    <EditDocumentModal
                        doc={doc}
                        categories={categories}
                        initialDocumentData={decryptedData}
                        isOpen={isEditModalOpen}
                        isSubmitting={isSubmittingEdit}
                        error={editError}
                        onClose={() => setIsEditModalOpen(false)}
                        onSubmit={handleUpdate}
                    />

                    <DeleteDocumentModal
                        title={doc.title}
                        isOpen={isDeleteModalOpen}
                        isDeleting={isDeleting}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                    />
                </>
            )}
        </div>
    );
}
