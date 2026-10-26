"use client";

import React from "react";
import Link from "next/link";
import type { Document } from "@/lib/types/api.types";
import { DocFileIcon, PlusIcon, ExternalLinkIcon, ShieldCheckIcon } from "@/lib/icons";

function statusBadge(status: string) {
    switch (status) {
        case "verified":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified
                </span>
            );
        case "pending":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending
                </span>
            );
        case "rejected":
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Rejected
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    {status}
                </span>
            );
    }
}

function typeBadge(type: string) {
    const t = type.toLowerCase();
    if (t.includes("pdf")) {
        return <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">PDF</span>;
    }
    if (t.includes("img") || t.includes("png") || t.includes("jpg")) {
        return <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-100">IMG</span>;
    }
    if (t.includes("id") || t.includes("pass") || t.includes("cert")) {
        return <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-100">CERT</span>;
    }
    return <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">DOC</span>;
}

interface RecentDocumentsTableProps {
    documents: Document[];
    isLoading?: boolean;
}

export function RecentDocumentsTable({ documents, isLoading }: RecentDocumentsTableProps) {
    const recent = documents.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-extrabold text-[#131127] tracking-tight">
                        Recent Vault Documents
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Latest encrypted files and cryptographic credentials
                    </p>
                </div>
                <Link
                    href="/document-details"
                    className="text-xs font-bold text-[#5a4fcf] hover:text-[#4239a0] px-3 py-1.5 rounded-lg hover:bg-indigo-50/50 transition-colors flex items-center gap-1"
                >
                    <span>View All Vault</span>
                    <span>→</span>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100">
                            <th className="pb-3.5 pl-2">Document Details</th>
                            <th className="pb-3.5">Category</th>
                            <th className="pb-3.5">Expiry Date</th>
                            <th className="pb-3.5">Status</th>
                            <th className="pb-3.5 pr-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-6 h-6 border-2 border-[#5a4fcf]/30 border-t-[#5a4fcf] rounded-full animate-spin" />
                                        <span className="text-xs text-slate-400">Loading documents…</span>
                                    </div>
                                </td>
                            </tr>
                        ) : recent.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-14 text-center">
                                    <div className="max-w-sm mx-auto space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#5a4fcf] flex items-center justify-center mx-auto">
                                            <DocFileIcon className="w-6 h-6" />
                                        </div>
                                        <div className="text-sm font-bold text-slate-800">No documents in vault yet</div>
                                        <p className="text-xs text-slate-500">
                                            Protect your credentials with AES-256-GCM encryption. Upload your first document now.
                                        </p>
                                        <Link
                                            href="/document-upload"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5" />
                                            <span>Upload First Document</span>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            recent.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="py-4 pl-2">
                                        <div className="flex items-center gap-3">
                                            {typeBadge(doc.type)}
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-[#5a4fcf] transition-colors">
                                                    {doc.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    ID: {doc.id.slice(0, 13)}…
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold capitalize">
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="py-4 font-semibold text-slate-600">
                                        {doc.expiry_date
                                            ? new Date(doc.expiry_date).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                              })
                                            : <span className="text-slate-400">Never</span>}
                                    </td>
                                    <td className="py-4">
                                        {statusBadge(doc.status)}
                                    </td>
                                    <td className="py-4 pr-2 text-right">
                                        <Link
                                            href={`/document-details/${doc.id}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200/80 text-slate-600 hover:text-[#5a4fcf] hover:border-indigo-200 hover:bg-indigo-50/40 text-xs font-bold transition-all"
                                        >
                                            <span>Details</span>
                                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
