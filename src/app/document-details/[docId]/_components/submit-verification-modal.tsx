"use client";

import React, { useState, useEffect } from "react";
import { institutionService } from "@/lib/services/institution.service";
import type { Institution } from "@/lib/types/api.types";

interface SubmitVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    docId: string;
    docTitle: string;
    docCategory: string;
    onSuccess: (targetInst: string) => void;
}

export function SubmitVerificationModal({
    isOpen,
    onClose,
    docId,
    docTitle,
    docCategory,
    onSuccess,
}: SubmitVerificationModalProps) {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInst, setSelectedInst] = useState("");
    const [customInst, setCustomInst] = useState("");
    const [applicantNotes, setApplicantNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadInstitutions();
            // Default target based on category
            if (docCategory === "education") {
                setSelectedInst("NIT Calicut");
                setApplicantNotes("Student Roll #2022-CS-041");
            } else if (docCategory === "health") {
                setSelectedInst("Apollo Hospitals");
                setApplicantNotes("Patient Record #MED-89120");
            } else {
                setSelectedInst("NIT Calicut");
            }
        }
    }, [isOpen, docCategory]);

    async function loadInstitutions() {
        try {
            const list = await institutionService.getInstitutions();
            setInstitutions(list);
        } catch (_) {}
    }

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const target = selectedInst === "other" ? customInst.trim() : selectedInst.trim();
        if (!target) {
            setError("Please select or enter the institution name");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await institutionService.submitDocument(docId, {
                target_institution: target,
                applicant_notes: applicantNotes.trim() || undefined,
            });
            onSuccess(target);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to submit document");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-900">Request Institutional Verification</h3>
                        <p className="text-xs text-slate-500">Send this credential to an authorized institution for a permanent digital seal.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Credential
                        </label>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
                            {docTitle}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Target Institution
                        </label>
                        <select
                            value={selectedInst}
                            onChange={(e) => setSelectedInst(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {institutions.map((inst) => (
                                <option key={inst.id} value={inst.name}>
                                    {inst.name} ({inst.type})
                                </option>
                            ))}
                            <option value="other">+ Other / Custom Institution...</option>
                        </select>
                    </div>

                    {selectedInst === "other" && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Custom Institution Name
                            </label>
                            <input
                                type="text"
                                value={customInst}
                                onChange={(e) => setCustomInst(e.target.value)}
                                placeholder="e.g. Stanford University, Mayo Clinic, Oxford"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Roll Number / Record Reference Note (Optional)
                        </label>
                        <textarea
                            value={applicantNotes}
                            onChange={(e) => setApplicantNotes(e.target.value)}
                            placeholder="e.g. Student Roll #2022-CS-041 or Patient Admission #MED-8910"
                            rows={3}
                            className="w-full text-xs p-3 rounded-xl border border-slate-200 text-slate-800"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            This helps the verifying institution locate your records in their internal archives.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? "Submitting…" : "Submit to Institution"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
