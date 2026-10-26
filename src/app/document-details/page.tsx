"use client";

import DashSidebar from "../components/dash-sidebar";
import DashHeader from "../components/dash-header";
import { SearchIcon, RefreshIcon, PlusIcon } from "@/lib/icons";
import Link from "next/link";
import { DocumentTableRow, FilterSelect, SortSelect } from "./_components/document-table";
import { useDocumentDetails } from "./_hooks/use-document-details";
import type { Document } from "@/lib/types/api.types";
import React from "react";

export default function DocumentDetails() {
    const {
        filters,
        sort,
        searchQuery,
        setSearchQuery,
        handleFilterChange,
        handleSortChange,
        availableSubcategories,
        uniqueValues,
        processedDocuments,
        allDocumentsCount,
        isLoading,
        error,
        toastMessage,
        deletingId,
        downloadingId,
        deleteDocument,
        downloadDocumentFile,
        refresh,
    } = useDocumentDetails();

    return (
        <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans">
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
                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-[#1a172c] mb-1">My Documents</h1>
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#5a4fcf] border border-indigo-100">
                                    {allDocumentsCount} Total
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                Manage, decrypt, and verify your AES-256 encrypted digital vault
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
                            <div className="relative w-full md:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, category, subcategory..."
                                    className="w-full bg-[#f3f4f6] border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                suppressHydrationWarning
                                onClick={() => refresh()}
                                disabled={isLoading}
                                title="Refresh documents"
                                className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                <RefreshIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            </button>

                            <Link
                                href="/document-upload"
                                className="shrink-0 px-4 py-2.5 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-100 cursor-pointer"
                            >
                                <PlusIcon className="w-4 h-4" />
                                <span>Upload Document</span>
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
                            <span>{error}</span>
                            <button
                                onClick={() => refresh()}
                                className="font-bold underline ml-4 cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Documents Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 pt-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-gray-500 border-b border-gray-100">
                                        <th className="pb-4 pl-3 align-top">
                                            <FilterSelect
                                                column="type"
                                                label="Type"
                                                options={uniqueValues("type")}
                                                value={filters.type}
                                                onChange={handleFilterChange}
                                            />
                                        </th>
                                        <th className="pb-4 align-top">
                                            <SortSelect
                                                column="title"
                                                label="Title"
                                                currentColumn={sort.column}
                                                currentDirection={sort.direction}
                                                onChange={handleSortChange}
                                            />
                                        </th>
                                        <th className="pb-4 align-top">
                                            <FilterSelect
                                                column="category"
                                                label="Category"
                                                options={uniqueValues("category")}
                                                value={filters.category}
                                                onChange={handleFilterChange}
                                            />
                                        </th>
                                        <th className="pb-4 align-top">
                                            <FilterSelect
                                                column="subcategory"
                                                label="Subcategory"
                                                options={availableSubcategories}
                                                value={filters.subcategory}
                                                onChange={handleFilterChange}
                                            />
                                        </th>
                                        <th className="pb-4 align-top">
                                            <SortSelect
                                                column="expiry_date"
                                                label="Expiry"
                                                currentColumn={sort.column}
                                                currentDirection={sort.direction}
                                                onChange={handleSortChange}
                                            />
                                        </th>
                                        <th className="pb-4 align-top">
                                            <FilterSelect
                                                column="status"
                                                label="Status"
                                                options={uniqueValues("status")}
                                                value={filters.status}
                                                onChange={handleFilterChange}
                                            />
                                        </th>
                                        <th className="pb-4 pr-3 align-top pt-1 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-6 h-6 border-2 border-[#5a4fcf]/30 border-t-[#5a4fcf] rounded-full animate-spin" />
                                                    <span className="text-xs">Loading secure document vault…</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : processedDocuments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-14 text-center">
                                                <div className="max-w-sm mx-auto space-y-3">
                                                    <p className="text-sm font-semibold text-gray-700">
                                                        No documents found
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Try adjusting your search filters or upload a new encrypted document.
                                                    </p>
                                                    <Link
                                                        href="/document-upload"
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5a4fcf] text-white text-xs font-semibold rounded-xl hover:bg-[#4a3fb8] transition-all cursor-pointer"
                                                    >
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                        <span>Upload Document</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        processedDocuments.map((doc: Document) => (
                                            <DocumentTableRow
                                                key={doc.id}
                                                doc={doc}
                                                isDeleting={deletingId === doc.id}
                                                isDownloading={downloadingId === doc.id}
                                                onDelete={deleteDocument}
                                                onDownload={downloadDocumentFile}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
