"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { documentService } from "@/lib/services/document.service";
import { useDocumentShare } from "../_hooks/use-document-share";
import type { Document } from "@/lib/types/api.types";
import {
    ShieldIcon,
    DocFileIcon,
    ClockIcon,
    RefreshIcon,
    SendIcon,
} from "@/lib/icons";

const SENSITIVE_KEYS = new Set([
    "id",
    "owner_id",
    "user_id",
    "type",
    "created_at",
    "updated_at",
    "is_encrypted",
    "encryption_key_version",
    "key_version",
    "file_path",
    "filepath",
    "document_data",
    "iv",
    "tag",
    "ciphertext",
    "auth_tag",
    "file_url",
    "fileurl",
]);

export function SharePanel() {
    const searchParams = useSearchParams();
    const queryDocId = searchParams.get("docId");

    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string>(queryDocId || "");
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    const [shareAll, setShareAll] = useState(true);
    const [includeFile, setIncludeFile] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const {
        expiresInMinutes,
        setExpiresInMinutes,
        generatedToken,
        activeTokens,
        isGenerating,
        isLoadingTokens,
        error,
        generateShareToken,
        loadTokensForDocument,
        revokeToken,
        getShareUrl,
    } = useDocumentShare();

    // Load available documents
    useEffect(() => {
        async function fetchDocs() {
            try {
                const list = await documentService.listDocuments();
                setDocuments(list);
                if (!selectedDocId && list.length > 0) {
                    setSelectedDocId(list[0].id);
                }
            } catch (err) {
                console.error("Failed to load documents:", err);
            } finally {
                setIsLoadingDocs(false);
            }
        }
        fetchDocs();
    }, []);

    // Load active tokens whenever selectedDocId changes
    useEffect(() => {
        if (selectedDocId) {
            loadTokensForDocument(selectedDocId);
        }
    }, [selectedDocId, loadTokensForDocument]);

    // Currently selected document
    const selectedDoc = useMemo(
        () => documents.find((d) => d.id === selectedDocId),
        [documents, selectedDocId]
    );

    // Compute clean human attributes for selective disclosure
    const availableAttributes = useMemo(() => {
        if (!selectedDoc) return [];
        const keys: string[] = ["title", "category", "subcategory", "status"];
        if (selectedDoc.expiry_date) keys.push("expiry_date");

        if (selectedDoc.document_data && typeof selectedDoc.document_data === "object") {
            Object.keys(selectedDoc.document_data).forEach((k) => {
                const norm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (!SENSITIVE_KEYS.has(k) && !SENSITIVE_KEYS.has(norm) && !keys.includes(k)) {
                    keys.push(k);
                }
            });
        }
        return keys;
    }, [selectedDoc]);

    // Reset selected fields on document change
    useEffect(() => {
        setSelectedFields(availableAttributes);
    }, [availableAttributes]);

    const handleToggleField = (field: string) => {
        if (selectedFields.includes(field)) {
            if (selectedFields.length > 1) {
                setSelectedFields(selectedFields.filter((f) => f !== field));
            }
        } else {
            setSelectedFields([...selectedFields, field]);
        }
    };

    const handleGenerate = async () => {
        if (!selectedDocId) return;

        let fieldsToShare: string[] | undefined;
        if (shareAll) {
            if (includeFile) {
                fieldsToShare = [...availableAttributes, "file"];
            } else {
                fieldsToShare = undefined; // Null/omitted = share clean human attributes only
            }
        } else {
            fieldsToShare = [...selectedFields];
            if (includeFile) {
                fieldsToShare.push("file");
            }
        }

        await generateShareToken(selectedDocId, fieldsToShare);
    };

    const shareUrl = generatedToken ? getShareUrl(generatedToken.token) : "";
    const qrImageUrl = shareUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
              shareUrl
          )}`
        : "";

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const hasFile = Boolean(
        selectedDoc?.file_url ||
            (selectedDoc?.document_data &&
                typeof selectedDoc.document_data === "object" &&
                ("file_path" in selectedDoc.document_data || "filepath" in selectedDoc.document_data))
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Configuration & Generation */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#f4f2ff] flex items-center justify-center text-[#5a4fcf]">
                            <SendIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1a172c]">
                                Generate Verification QR
                            </h2>
                            <p className="text-xs text-gray-400 font-medium">
                                Create an expiring Zero-Knowledge QR token with selective data disclosure
                            </p>
                        </div>
                    </div>

                    {/* Document Selector */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-[#1a172c] uppercase tracking-wider mb-2">
                            Select Document to Share
                        </label>
                        {isLoadingDocs ? (
                            <div className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                        ) : (
                            <select
                                value={selectedDocId}
                                onChange={(e) => setSelectedDocId(e.target.value)}
                                className="w-full bg-[#f8f9fc] border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1a172c] focus:outline-none focus:border-[#5a4fcf]"
                            >
                                {documents.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.title} ({doc.category} • {doc.subcategory})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Selective Attribute Disclosure */}
                    <div className="mb-6 p-5 rounded-xl bg-[#f9fafc] border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#1a172c]">
                                    Selective Field Disclosure
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Sensitive technical metadata is automatically stripped
                                </p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#5a4fcf]">
                                <input
                                    type="checkbox"
                                    checked={shareAll}
                                    onChange={(e) => {
                                        setShareAll(e.target.checked);
                                        if (e.target.checked) {
                                            setSelectedFields(availableAttributes);
                                        }
                                    }}
                                    className="w-4 h-4 rounded text-[#5a4fcf] focus:ring-[#5a4fcf]"
                                />
                                Share All
                            </label>
                        </div>

                        {!shareAll && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                                {availableAttributes.map((attr) => {
                                    const isSel = selectedFields.includes(attr);
                                    return (
                                        <button
                                            key={attr}
                                            type="button"
                                            onClick={() => handleToggleField(attr)}
                                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                                isSel
                                                    ? "bg-[#5a4fcf] text-white shadow-sm"
                                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            {attr.replace(/_/g, " ").toUpperCase()}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Document Photo / File Sharing Toggle */}
                    {hasFile && (
                        <div className="mb-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-[#5a4fcf]">
                                    <DocFileIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#1a172c]">
                                        Share Document Photo / File
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Allows verifier to view verified document photo or PDF scan
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeFile}
                                    onChange={(e) => setIncludeFile(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5a4fcf]"></div>
                            </label>
                        </div>
                    )}

                    {/* Expiry Duration */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-[#1a172c] uppercase tracking-wider mb-2 flex items-center gap-2">
                            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                            Token Expiry Duration
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[5, 10, 15, 60, 1440].map((mins) => (
                                <button
                                    key={mins}
                                    type="button"
                                    onClick={() => setExpiresInMinutes(mins)}
                                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                                        expiresInMinutes === mins
                                            ? "bg-[#1a172c] text-white border-[#1a172c] shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    {mins < 60 ? `${mins}m` : mins === 60 ? "1 hr" : "24 hrs"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !selectedDocId}
                        className="w-full bg-[#5a4fcf] hover:bg-[#4d42be] text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-[#5a4fcf]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshIcon className="w-4 h-4 animate-spin" />
                                <span>Generating Secure QR...</span>
                            </>
                        ) : (
                            <>
                                <ShieldIcon className="w-4 h-4" />
                                <span>Generate Verification QR Token</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Active Tokens List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[#1a172c]">
                            Active Tokens for this Document ({activeTokens.length})
                        </h3>
                        {isLoadingTokens && <RefreshIcon className="w-4 h-4 animate-spin text-gray-400" />}
                    </div>

                    {activeTokens.length === 0 ? (
                        <p className="text-xs text-gray-400">No active tokens created yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {activeTokens.map((t) => {
                                const isExpired = new Date(t.expires_at) < new Date();
                                return (
                                    <div
                                        key={t.id}
                                        className="p-3 rounded-xl border border-gray-100 bg-[#f9fafc] flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="min-w-0">
                                            <div className="font-mono text-[#1a172c] font-bold truncate">
                                                {t.token.slice(0, 16)}...
                                            </div>
                                            <div className="text-gray-400 mt-0.5">
                                                {isExpired
                                                    ? "Expired"
                                                    : `Expires: ${new Date(t.expires_at).toLocaleTimeString()}`}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => revokeToken(t.id)}
                                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-all text-xs"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Generated QR Preview Card */}
            <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col items-center text-center">
                    <h3 className="text-base font-bold text-[#1a172c] mb-1">
                        QR Code Verification
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mb-6">
                        Verifiers can scan this QR code with their mobile camera to inspect verified credentials.
                    </p>

                    {generatedToken && qrImageUrl ? (
                        <div className="flex flex-col items-center w-full animate-fade-in">
                            <div className="p-4 bg-white rounded-2xl border-2 border-[#5a4fcf]/20 shadow-lg mb-6">
                                <img
                                    src={qrImageUrl}
                                    alt="Verification QR Code"
                                    className="w-56 h-56 rounded-xl object-contain"
                                />
                            </div>

                            <div className="w-full bg-[#f8f9fc] p-3 rounded-xl border border-gray-200 mb-4 flex items-center justify-between text-xs font-mono text-gray-600">
                                <span className="truncate mr-2">{shareUrl}</span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="text-[#5a4fcf] font-bold hover:underline shrink-0"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            <div className="flex gap-2 w-full">
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(
                                        `Verify my document on VEDA: ${shareUrl}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-all text-center"
                                >
                                    Share on WhatsApp
                                </a>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1a172c] font-bold text-xs transition-all text-center"
                                >
                                    {copied ? "Link Copied" : "Copy Link"}
                                </button>
                            </div>

                            <p className="text-[11px] text-gray-400 mt-4">
                                Auto-expires at {new Date(generatedToken.expires_at).toLocaleTimeString()}
                            </p>
                        </div>
                    ) : (
                        <div className="w-full py-16 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                <DocFileIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-xs font-medium">
                                Configure your parameters and click Generate to preview the QR code.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
