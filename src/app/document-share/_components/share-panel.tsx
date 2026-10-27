"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { documentService } from "@/lib/services/document.service";
import { useDocumentShare } from "../_hooks/use-document-share";
import { useAuth } from "@/lib/context/auth-context";
import type { Document } from "@/lib/types/api.types";
import {
    ShieldIcon,
    DocFileIcon,
    ClockIcon,
    RefreshIcon,
    SendIcon,
    ExternalLinkIcon,
    LockIcon,
    GlobeIcon,
    UserIcon,
    CopyIcon,
    CheckIcon,
    TrashIcon,
    EyeIcon,
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

    const { user, profile } = useAuth();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string>(queryDocId || "");
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    // Google Drive style General Access: "restricted" (only added emails) | "anyone" (anyone with link)
    const [generalAccess, setGeneralAccess] = useState<"restricted" | "anyone">("restricted");

    // Email input and authorized viewers list
    const [emailInput, setEmailInput] = useState("");
    const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
    const [showRoleTooltip, setShowRoleTooltip] = useState(false);

    // Document disclosure settings
    const [shareAll, setShareAll] = useState(true);
    const [includeFile, setIncludeFile] = useState(false);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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

    const handleAddEmail = () => {
        if (!emailInput.trim()) return;
        const parts = emailInput
            .split(/[\s,]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => e.includes("@"));
        if (parts.length > 0) {
            const next = Array.from(new Set([...allowedEmails, ...parts]));
            setAllowedEmails(next);
            setEmailInput("");
            setGeneralAccess("restricted");
        }
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setAllowedEmails(allowedEmails.filter((e) => e !== emailToRemove));
    };

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
                fieldsToShare = undefined;
            }
        } else {
            fieldsToShare = [...selectedFields];
            if (includeFile) {
                fieldsToShare.push("file");
            }
        }

        const emailsToSend =
            generalAccess === "restricted" && allowedEmails.length > 0 ? allowedEmails : undefined;

        await generateShareToken(selectedDocId, fieldsToShare, emailsToSend);
    };

    const shareUrl = generatedToken ? getShareUrl(generatedToken.token) : "";

    const handleCopy = () => {
        const urlToCopy = shareUrl || (activeTokens.length > 0 ? getShareUrl(activeTokens[0].token) : "");
        if (!urlToCopy) {
            handleGenerate();
            return;
        }
        navigator.clipboard.writeText(urlToCopy);
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
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Google Drive / Google Classroom Style Sharing Modal Card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                {/* 1. Header: Document Context & Selector */}
                <div className="px-6 py-6 sm:px-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-indigo-50/20 to-white">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5a4fcf] to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                            <DocFileIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-[#1a172c] truncate">
                                Share &ldquo;{selectedDoc?.title || "Document"}&rdquo;
                            </h2>
                            <p className="text-xs text-gray-400">
                                Give access to specific people or generate a secure public link
                            </p>
                        </div>
                    </div>

                    {/* Document Selector */}
                    <div className="sm:w-64 shrink-0">
                        {isLoadingDocs ? (
                            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                        ) : (
                            <select
                                value={selectedDocId}
                                onChange={(e) => setSelectedDocId(e.target.value)}
                                className="w-full text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 transition-all cursor-pointer"
                            >
                                {documents.map((doc) => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.title} ({doc.category})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-7">
                    {/* 2. Add People and Groups (Email Input with Viewer Role Badge) */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddEmail();
                                        }
                                    }}
                                    placeholder="Add people and groups by email (e.g. verifier@college.edu)..."
                                    className="w-full pl-10 pr-28 py-3 bg-white border border-gray-300 rounded-2xl text-xs sm:text-sm text-[#1a172c] placeholder:text-gray-400 focus:outline-none focus:border-[#5a4fcf] focus:ring-4 focus:ring-[#5a4fcf]/10 transition-all shadow-xs"
                                />

                                {/* Explicit Role Pill on the right side of the input (Google Classroom style) */}
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleTooltip(!showRoleTooltip)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
                                            title="View access control"
                                        >
                                            <LockIcon className="w-3 h-3 text-[#5a4fcf]" />
                                            <span>Viewer</span>
                                        </button>
                                        {showRoleTooltip && (
                                            <div className="absolute right-0 top-full mt-1 w-52 p-2.5 bg-gray-900 text-white text-[11px] rounded-xl shadow-lg z-10 animate-fade-in leading-relaxed">
                                                <p className="font-bold text-indigo-300 mb-0.5">Role: Viewer</p>
                                                <p className="text-gray-300">
                                                    For cryptographic integrity, recipients are granted view-only access.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddEmail}
                                disabled={!emailInput.trim()}
                                className="px-5 py-3 bg-[#5a4fcf] hover:bg-[#4d42be] disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs rounded-2xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed shrink-0"
                            >
                                Add Person
                            </button>
                        </div>
                    </div>

                    {/* 3. People with Access (Google Drive Style List) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                People with access
                            </h3>
                            {allowedEmails.length > 0 && (
                                <span className="text-[11px] font-semibold text-[#5a4fcf] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    {allowedEmails.length} recipient{allowedEmails.length > 1 ? "s" : ""} added
                                </span>
                            )}
                        </div>

                        <div className="border border-gray-200/80 rounded-2xl divide-y divide-gray-100 bg-[#fafbfe] overflow-hidden">
                            {/* Owner Row */}
                            <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5a4fcf] to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                        {profile?.full_name
                                            ? profile.full_name.charAt(0).toUpperCase()
                                            : user?.email
                                            ? user.email.charAt(0).toUpperCase()
                                            : "O"}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-bold text-[#1a172c] truncate">
                                            {profile?.full_name || "Account Owner"}{" "}
                                            <span className="text-gray-400 font-normal">(you)</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 truncate">
                                            {user?.email || "owner@veda.network"}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-xl">
                                    Owner
                                </span>
                            </div>

                            {/* Added Recipient Viewers */}
                            {allowedEmails.map((email) => (
                                <div
                                    key={email}
                                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-gray-50/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-[#5a4fcf] font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                                            {email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs sm:text-sm font-bold text-[#1a172c] truncate">
                                                {email}
                                            </div>
                                            <div className="text-[11px] text-emerald-600 font-medium">
                                                Authorized Recipient
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[#5a4fcf] text-xs font-bold">
                                            <EyeIcon className="w-3.5 h-3.5" />
                                            Viewer
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmail(email)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Remove access"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {allowedEmails.length === 0 && generalAccess === "restricted" && (
                                <div className="p-4 text-center text-xs text-amber-700 bg-amber-50/60 font-medium">
                                    ⚠️ No emails added yet. Enter recipient emails above, or switch General Access to &ldquo;Anyone with the link&rdquo;.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. General Access (Google Drive Style Card) */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            General access
                        </h3>

                        <div className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        generalAccess === "anyone"
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                            : "bg-indigo-50 text-[#5a4fcf] border border-indigo-100"
                                    }`}
                                >
                                    {generalAccess === "anyone" ? (
                                        <GlobeIcon className="w-5 h-5" />
                                    ) : (
                                        <LockIcon className="w-5 h-5" />
                                    )}
                                </div>

                                <div>
                                    <div className="relative inline-block">
                                        <select
                                            value={generalAccess}
                                            onChange={(e) =>
                                                setGeneralAccess(e.target.value as "restricted" | "anyone")
                                            }
                                            className="text-sm font-bold text-[#1a172c] bg-transparent hover:bg-gray-100 py-1 px-2 -ml-2 rounded-lg cursor-pointer focus:outline-none"
                                        >
                                            <option value="restricted">Restricted</option>
                                            <option value="anyone">Anyone with the link</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {generalAccess === "anyone"
                                            ? "Anyone on the internet with this link can view disclosed credentials"
                                            : "Only people explicitly added with authorized emails can open with the link"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                                    Viewer
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 5. Document Controls (Selective Disclosure & Attachment Settings) */}
                    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-[#fafbfe]">
                        <button
                            type="button"
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldIcon className="w-4 h-4 text-[#5a4fcf]" />
                                <span>Credential Disclosure & Expiration Controls</span>
                            </div>
                            <span className="text-gray-400 text-xs">
                                {isAdvancedOpen ? "Hide" : "Show Options"}
                            </span>
                        </button>

                        {isAdvancedOpen && (
                            <div className="p-5 pt-0 space-y-5 border-t border-gray-100 bg-white">
                                {/* Expiry Picker */}
                                <div className="pt-4">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Link Validity Duration
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { label: "15 min", val: 15 },
                                            { label: "1 hour", val: 60 },
                                            { label: "24 hours", val: 1440 },
                                            { label: "7 days", val: 10080 },
                                        ].map((dur) => (
                                            <button
                                                key={dur.val}
                                                type="button"
                                                onClick={() => setExpiresInMinutes(dur.val)}
                                                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                                    expiresInMinutes === dur.val
                                                        ? "bg-[#5a4fcf] text-white shadow-sm"
                                                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                                                }`}
                                            >
                                                {dur.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* File Attachment Toggle */}
                                {hasFile && (
                                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-[#5a4fcf]">
                                                <DocFileIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#1a172c]">
                                                    Attach Document Photo / File
                                                </h4>
                                                <p className="text-[11px] text-gray-500">
                                                    Allows recipient to view verified document photo or PDF scan
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

                                {/* Selective Attributes */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Disclosed Attributes
                                        </span>
                                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#5a4fcf]">
                                            <input
                                                type="checkbox"
                                                checked={shareAll}
                                                onChange={(e) => {
                                                    setShareAll(e.target.checked);
                                                    if (e.target.checked) {
                                                        setSelectedFields(availableAttributes);
                                                    }
                                                }}
                                                className="w-3.5 h-3.5 rounded text-[#5a4fcf]"
                                            />
                                            Share All Fields
                                        </label>
                                    </div>

                                    {!shareAll && (
                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                            {availableAttributes.map((attr) => {
                                                const isSel = selectedFields.includes(attr);
                                                return (
                                                    <button
                                                        key={attr}
                                                        type="button"
                                                        onClick={() => handleToggleField(attr)}
                                                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                                                            isSel
                                                                ? "bg-[#5a4fcf] text-white shadow-xs"
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
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* 6. Footer Action Bar (Google Drive Style) */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 hover:border-gray-400 bg-white text-gray-700 text-xs font-bold transition-all hover:bg-gray-50 shadow-xs cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                                    <span className="text-emerald-700">Link Copied!</span>
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="w-4 h-4 text-[#5a4fcf]" />
                                    <span>Copy link</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedDocId}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5a4fcf] hover:bg-[#4d42be] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-[#5a4fcf]/20 cursor-pointer disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshIcon className="w-4 h-4 animate-spin" />
                                    <span>Creating Link...</span>
                                </>
                            ) : (
                                <>
                                    <SendIcon className="w-4 h-4" />
                                    <span>Create Secure Share Link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Generated Link Preview & Active Links */}
            {generatedToken && shareUrl && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-8 animate-fade-in space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-sm font-bold text-[#1a172c]">
                                Share Link Ready
                            </h3>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                            Expires at {new Date(generatedToken.expires_at).toLocaleTimeString()}
                        </span>
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs font-mono text-gray-700">
                        <span className="truncate">{shareUrl}</span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="px-3 py-1.5 rounded-xl bg-[#5a4fcf] text-white font-sans font-bold hover:bg-[#4d42be] transition-colors shrink-0"
                        >
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                                `Verify my document on VEDA: ${shareUrl}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                            Share on WhatsApp
                        </a>
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-all flex items-center gap-1.5"
                        >
                            <span>Open Verifier Page</span>
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-500" />
                        </a>
                    </div>
                </div>
            )}

            {/* Active Share Links History */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-[#1a172c]">
                            Active Share Links for this Document ({activeTokens.length})
                        </h3>
                        <p className="text-xs text-gray-400">
                            Revoke links anytime to immediately terminate verification access
                        </p>
                    </div>
                    {isLoadingTokens && <RefreshIcon className="w-4 h-4 animate-spin text-gray-400" />}
                </div>

                {activeTokens.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                        No active share links created yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeTokens.map((t) => {
                            const isExpired = new Date(t.expires_at) < new Date();
                            const link = getShareUrl(t.token);
                            return (
                                <div
                                    key={t.id}
                                    className="p-4 rounded-2xl border border-gray-100 bg-[#fafbfe] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="font-mono text-[#1a172c] font-bold truncate">
                                            {link}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 mt-1 flex-wrap">
                                            <span className={isExpired ? "text-rose-500 font-semibold" : ""}>
                                                {isExpired
                                                    ? "Expired"
                                                    : `Expires: ${new Date(t.expires_at).toLocaleTimeString()}`}
                                            </span>
                                            <span>•</span>
                                            {t.allowed_emails && t.allowed_emails.length > 0 ? (
                                                <span className="text-[#5a4fcf] font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full text-[10px]">
                                                    🔒 Restricted ({t.allowed_emails.length} Viewer{t.allowed_emails.length > 1 ? "s" : ""})
                                                </span>
                                            ) : (
                                                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                                                    🌐 Public with Link (Viewer)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(link);
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-[#1a172c] font-bold transition-all text-xs cursor-pointer shadow-2xs"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => revokeToken(t.id)}
                                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition-all text-xs cursor-pointer"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
