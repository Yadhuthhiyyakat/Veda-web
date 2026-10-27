"use client";

import DashSidebar from "../components/dash-sidebar";
import DashHeader from "../components/dash-header";
import { SearchIcon, RefreshIcon, PlusIcon } from "@/lib/icons";
import Link from "next/link";
import { CategoryGrid } from "./_components/category-grid";
import { CategoryDetail } from "./_components/category-detail";
import { useDocumentCategories } from "./_hooks/use-document-categories";
import React from "react";

export default function DocumentCategoriesPage() {
    const {
        categories,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedCategory,
        filteredCategories,
        categoryDocuments,
        selectedSubcategoryFilter,
        setSelectedSubcategoryFilter,
        getDocumentCount,
        refresh,
    } = useDocumentCategories();

    return (
        <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans text-gray-800">
            <DashHeader />

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                <DashSidebar page="document-categories" />

                <main className="flex-1 p-8 overflow-y-auto">
                    {selectedCategory ? (
                        <CategoryDetail
                            selectedCategory={selectedCategory}
                            categoryDocuments={categoryDocuments}
                            selectedSubcategoryFilter={selectedSubcategoryFilter}
                            onSelectSubcategoryFilter={setSelectedSubcategoryFilter}
                            onBack={() => setSelectedCategoryId(null)}
                        />
                    ) : (
                        <div>
                            {/* Top Section */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#1a172c] mb-1">
                                        Document Categories
                                    </h1>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Taxonomy & classification schema for encrypted credentials
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
                                            placeholder="Search categories or subcategories..."
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
                                        onClick={() => refresh()}
                                        disabled={isLoading}
                                        title="Refresh categories from server"
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

                            {/* Informative Alert / Error Banner */}
                            {error && (
                                <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
                                    <span>{error}</span>
                                    <button
                                        onClick={() => refresh()}
                                        className="font-bold underline hover:text-amber-950 ml-4 cursor-pointer"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Categories Grid or Skeleton */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                                                <div className="w-16 h-5 rounded-full bg-gray-100" />
                                            </div>
                                            <div className="w-3/4 h-5 bg-gray-100 rounded mb-2" />
                                            <div className="w-full h-10 bg-gray-50 rounded mb-4" />
                                            <div className="w-1/2 h-3 bg-gray-100 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <CategoryGrid
                                    categories={filteredCategories}
                                    getDocumentCount={getDocumentCount}
                                    searchQuery={searchQuery}
                                    onSelect={(id) => setSelectedCategoryId(id)}
                                />
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
