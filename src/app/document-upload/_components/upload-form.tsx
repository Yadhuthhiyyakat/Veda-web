"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { UploadIcon, ShieldIcon, DocFileIcon, CheckIcon, PlusIcon, TrashIcon } from "@/lib/icons";
import { useDocumentUpload } from "../_hooks/use-document-upload";

function formatFieldLabel(key: string): string {
    return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DocumentUploadForm() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        mode,
        setMode,
        categories,
        isLoadingTaxonomy,
        selectedFile,
        setSelectedFile,
        title,
        setTitle,
        type,
        setType,
        category,
        setCategory,
        subcategory,
        setSubcategory,
        availableSubcategories,
        activeSubcategoryObj,
        expiryDate,
        setExpiryDate,
        dynamicFields,
        handleDynamicFieldChange,
        customFields,
        addCustomField,
        updateCustomField,
        removeCustomField,
        isSubmitting,
        error,
        createdDoc,
        handleFileSelect,
        handleSubmit,
        resetForm,
    } = useDocumentUpload();

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    if (!isMounted) {
        return (
            <div className="py-12 text-center text-sm text-gray-400 animate-pulse">
                Loading upload form…
            </div>
        );
    }

    // If document was just created, show success confirmation view
    if (createdDoc) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                    <CheckIcon className="w-8 h-8" />
                </div>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1a172c] mb-1">Document Created Successfully!</h2>
                    <p className="text-sm text-gray-500">
                        Your document data has been securely encrypted.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Document Title</span>
                        <span className="font-bold text-gray-800">{createdDoc.title}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Document ID</span>
                        <span className="font-mono text-gray-600 truncate max-w-[240px]">{createdDoc.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Category / Subcategory</span>
                        <span className="font-semibold text-gray-700 capitalize">
                            {createdDoc.category} / {createdDoc.subcategory}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Document Type</span>
                        <span className="font-semibold text-gray-700 uppercase">{createdDoc.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500 font-medium">Status</span>
                        <span className="px-2.5 py-0.5 rounded-full font-bold capitalize bg-amber-50 text-amber-700 border border-amber-100">
                            {createdDoc.status}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/document-details"
                        className="flex-1 py-3 px-5 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-sm font-semibold rounded-xl text-center transition-all shadow-md shadow-indigo-100 cursor-pointer"
                    >
                        View in Document Vault
                    </Link>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl text-center transition-all cursor-pointer"
                    >
                        Upload Another Document
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* Mode Switcher Tabs */}
            <div className="bg-gray-100/80 p-1.5 rounded-2xl grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => setMode("file")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                        mode === "file"
                            ? "bg-white text-[#1a172c] shadow-xs"
                            : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                    <UploadIcon className="w-4 h-4 text-[#5a4fcf]" />
                    <span>Upload Stored File (Multipart)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setMode("digital")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                        mode === "digital"
                            ? "bg-white text-[#1a172c] shadow-xs"
                            : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                    <ShieldIcon className="w-4 h-4 text-[#5a4fcf]" />
                    <span>Digital Entry (JSON Payload)</span>
                </button>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
                    <span className="font-semibold shrink-0">Upload Rejected:</span>
                    <span>{error}</span>
                </div>
            )}

            {/* File Upload Dropzone (File Mode) */}
            {mode === "file" && (
                <div
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-[#5a4fcf] transition-colors"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#f4f2ff] flex items-center justify-center">
                        <UploadIcon className="w-7 h-7 text-[#5a4fcf]" />
                    </div>
                    {selectedFile ? (
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-[#1a172c]">{selectedFile.name}</p>
                            <p className="text-xs text-gray-400">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                            </p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedFile(null);
                                }}
                                className="text-xs font-semibold text-rose-500 hover:underline pt-1 inline-block"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-semibold text-[#1a172c]">
                                Click to select or drag & drop document file
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                PDF, JPG, PNG, or DOCX — max 25 MB (Encrypted on upload)
                            </p>
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/70 border border-indigo-100 rounded-full text-[11px] text-indigo-700 font-medium">
                                <ShieldIcon className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Authenticity Guard: Uploaded file will be verified for genuine {activeSubcategoryObj?.name || "document"} markers</span>
                            </div>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={onFileChange}
                    />
                </div>
            )}

            {/* Core Metadata Fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#1a172c] uppercase tracking-wider mb-2">
                    Document Information
                </h3>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Document Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Degree Certificate, Indian Passport, PAN Card"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all cursor-pointer"
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Subcategory
                        </label>
                        <select
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all cursor-pointer"
                        >
                            {availableSubcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Document Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all cursor-pointer"
                        >
                            <option value="identity">Identity Document</option>
                            <option value="educational">Educational Certificate</option>
                            <option value="financial">Financial / Tax Document</option>
                            <option value="medical">Health & Medical Record</option>
                            <option value="legal">Legal & Contract</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Expiry Date (optional)
                        </label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic AES-256 Encrypted Payload Data Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-[#1a172c] uppercase tracking-wider flex items-center gap-2">
                            <ShieldIcon className="w-4 h-4 text-[#5a4fcf]" />
                            <span>Encrypted Document Payload</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {mode === "digital"
                                ? "These fields form the decrypted payload stored securely."
                                : "Optional structured attributes encrypted alongside your file."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addCustomField}
                        className="px-3 py-1.5 bg-indigo-50 text-[#5a4fcf] hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                        <PlusIcon className="w-3 h-3" />
                        <span>Add Field</span>
                    </button>
                </div>

                {/* Subcategory required fields */}
                {Object.keys(dynamicFields).length > 0 && (
                    <div className="space-y-3 pt-2">
                        {Object.entries(dynamicFields).map(([fieldName, val]) => (
                            <div key={fieldName}>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-gray-700 capitalize">
                                        {formatFieldLabel(fieldName)}
                                    </label>
                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-[#5a4fcf]">
                                        Taxonomy Field
                                    </span>
                                </div>
                                <input
                                    type={fieldName.includes("date") || fieldName.includes("dob") ? "date" : "text"}
                                    value={val}
                                    onChange={(e) => handleDynamicFieldChange(fieldName, e.target.value)}
                                    placeholder={`Enter ${formatFieldLabel(fieldName)}`}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Arbitrary Custom Fields */}
                {customFields.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                            Custom Properties
                        </span>
                        {customFields.map((cf, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={cf.key}
                                    placeholder="Property Name (e.g. issuing_authority)"
                                    onChange={(e) => updateCustomField(index, e.target.value, cf.value)}
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf]"
                                />
                                <input
                                    type="text"
                                    value={cf.value}
                                    placeholder="Value"
                                    onChange={(e) => updateCustomField(index, cf.key, e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf]"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCustomField(index)}
                                    className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Remove field"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {Object.keys(dynamicFields).length === 0 && customFields.length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                        No encrypted fields defined for this subcategory yet. Click &quot;Add Field&quot; to include custom encrypted attributes.
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                suppressHydrationWarning
                disabled={isSubmitting || (mode === "file" && !selectedFile)}
                className="w-full px-6 py-3.5 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
                {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Encrypting & Saving Document…</span>
                    </>
                ) : mode === "file" ? (
                    <>
                        <UploadIcon className="w-4 h-4" />
                        <span>Upload & Encrypt File (Multipart)</span>
                    </>
                ) : (
                    <>
                        <ShieldIcon className="w-4 h-4" />
                        <span>Create Encrypted Document (JSON)</span>
                    </>
                )}
            </button>
        </form>
    );
}
