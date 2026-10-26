"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { documentService } from "@/lib/services/document.service";
import type {
    Document,
    DocumentCategory,
    DocumentSubcategory,
    CreateDocumentPayload,
} from "@/lib/types/api.types";
import { isAxiosError } from "axios";

export type UploadMode = "file" | "digital";

interface CustomField {
    key: string;
    value: string;
}

const FALLBACK_CATEGORIES: DocumentCategory[] = [
    {
        id: "government",
        name: "Government Documents",
        description: "Official identification, certificates, and government-issued cards",
        subcategories: [
            { id: "aadhar", name: "Aadhar Card", required_fields: ["aadhar_number", "dob"] },
            { id: "pan_card", name: "PAN Card", required_fields: ["pan_number"] },
            { id: "driving_license", name: "Driving License", required_fields: ["dl_number", "valid_till"] },
            { id: "passport", name: "Passport", required_fields: ["passport_number", "expiry_date"] },
            { id: "voter_id", name: "Voter ID Card", required_fields: ["epic_number"] },
            { id: "ration_card", name: "Ration Card", required_fields: ["ration_card_number"] },
            { id: "birth_certificate", name: "Birth Certificate" },
            { id: "marriage_certificate", name: "Marriage Certificate" },
            { id: "income_certificate", name: "Income Certificate" },
            { id: "caste_certificate", name: "Caste Certificate" },
            { id: "domicile_certificate", name: "Domicile Certificate" },
        ],
    },
    {
        id: "educational_institution",
        name: "Educational Institutions",
        description: "Academic degrees, diplomas, transcripts, and institutional certificates",
        subcategories: [
            {
                id: "degree_certificate",
                name: "Degree Certificate",
                required_fields: ["certificate_number", "student_name", "degree", "institution", "year_of_passing"],
            },
            {
                id: "marksheet",
                name: "Marksheet / Transcript",
                required_fields: ["roll_number", "institution", "year"],
            },
            { id: "diploma", name: "Diploma Certificate" },
            { id: "school_certificate", name: "School Leaving / Transfer Certificate" },
            { id: "college_id", name: "College Student ID" },
        ],
    },
    {
        id: "medical_institution",
        name: "Healthcare & Hospitals",
        description: "Medical records, prescriptions, and health reports",
        subcategories: [
            { id: "prescription", name: "Medical Prescription" },
            { id: "discharge_summary", name: "Hospital Discharge Summary" },
            { id: "health_insurance", name: "Health Insurance Card / Policy" },
            { id: "vaccination_certificate", name: "Vaccination Record" },
            { id: "lab_report", name: "Diagnostic / Lab Report" },
        ],
    },
    {
        id: "financial_institution",
        name: "Financial Institutions",
        description: "Bank statements, pay stubs, and tax returns",
        subcategories: [
            { id: "bank_statement", name: "Bank Account Statement" },
            { id: "salary_slip", name: "Salary Slip / Pay Stub" },
            { id: "tax_return", name: "ITR / Tax Return Acknowledgement" },
        ],
    },
    {
        id: "other",
        name: "Other Documents",
        description: "General certificates, licenses, or custom documents",
        subcategories: [
            { id: "utility_bill", name: "Utility Bill" },
            { id: "rent_agreement", name: "Rent Agreement" },
            { id: "general", name: "General Document" },
        ],
    },
];

export function useDocumentUpload() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const paramCategory = searchParams.get("category");
    const paramSubcategory = searchParams.get("subcategory");

    const [mode, setMode] = useState<UploadMode>("file");
    const [categories, setCategories] = useState<DocumentCategory[]>(FALLBACK_CATEGORIES);
    const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(true);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("identity");
    const [category, setCategory] = useState("government");
    const [subcategory, setSubcategory] = useState("aadhar");
    const [expiryDate, setExpiryDate] = useState("");

    // Dynamic fields for subcategory required fields
    const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
    // Arbitrary extra custom key-value fields
    const [customFields, setCustomFields] = useState<CustomField[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdDoc, setCreatedDoc] = useState<Document | null>(null);

    // Fetch taxonomy from backend
    useEffect(() => {
        let isMounted = true;
        async function loadTaxonomy() {
            setIsLoadingTaxonomy(true);
            try {
                const res = await documentService.getCategories();
                if (isMounted && res.categories && res.categories.length > 0) {
                    setCategories(res.categories);
                }
            } catch (err) {
                console.warn("Could not load backend taxonomy, using default schema", err);
            } finally {
                if (isMounted) setIsLoadingTaxonomy(false);
            }
        }
        loadTaxonomy();
        return () => {
            isMounted = false;
        };
    }, []);

    // Set initial category & subcategory from query params if available
    useEffect(() => {
        if (paramCategory) {
            setCategory(paramCategory);
            if (paramCategory === "educational_institution") {
                setType("educational");
            } else if (paramCategory === "government") {
                setType("identity");
            }
        }
    }, [paramCategory]);

    // Active category and subcategories
    const activeCategoryObj = useMemo(() => {
        return categories.find((c) => c.id === category) || categories[0];
    }, [categories, category]);

    const availableSubcategories: DocumentSubcategory[] = useMemo(() => {
        return activeCategoryObj?.subcategories || [];
    }, [activeCategoryObj]);

    // Keep subcategory in sync when category changes
    useEffect(() => {
        if (paramSubcategory && availableSubcategories.some((s) => s.id === paramSubcategory)) {
            setSubcategory(paramSubcategory);
        } else if (availableSubcategories.length > 0) {
            if (!availableSubcategories.some((s) => s.id === subcategory)) {
                setSubcategory(availableSubcategories[0].id);
            }
        } else {
            setSubcategory("general");
        }
    }, [availableSubcategories, paramSubcategory, subcategory]);

    // Active subcategory object
    const activeSubcategoryObj = useMemo(() => {
        return availableSubcategories.find((s) => s.id === subcategory);
    }, [availableSubcategories, subcategory]);

    // Sync dynamic fields with required_fields of selected subcategory
    useEffect(() => {
        const required = activeSubcategoryObj?.required_fields || [];
        setDynamicFields((prev) => {
            const next: Record<string, string> = {};
            required.forEach((fieldName) => {
                next[fieldName] = prev[fieldName] || "";
            });
            return next;
        });
    }, [activeSubcategoryObj]);

    const handleFileSelect = useCallback(
        (file: File) => {
            setSelectedFile(file);
            if (!title) {
                const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
            }
        },
        [title]
    );

    const handleDynamicFieldChange = (fieldName: string, value: string) => {
        setDynamicFields((prev) => ({ ...prev, [fieldName]: value }));
    };

    const addCustomField = () => {
        setCustomFields((prev) => [...prev, { key: "", value: "" }]);
    };

    const updateCustomField = (index: number, key: string, value: string) => {
        setCustomFields((prev) => {
            const updated = [...prev];
            updated[index] = { key, value };
            return updated;
        });
    };

    const removeCustomField = (index: number) => {
        setCustomFields((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Please provide a document title.");
            return;
        }

        // Build combined document_data payload
        const combinedData: Record<string, unknown> = {};
        Object.entries(dynamicFields).forEach(([k, v]) => {
            if (v.trim()) combinedData[k] = v.trim();
        });
        customFields.forEach(({ key, value }) => {
            const trimmedKey = key.trim();
            if (trimmedKey && value.trim()) {
                combinedData[trimmedKey] = value.trim();
            }
        });

        setIsSubmitting(true);

        try {
            if (mode === "file") {
                // 6.7 POST /api/documents/upload (Multipart Form-Data)
                if (!selectedFile) {
                    setError("Please select a file to upload.");
                    setIsSubmitting(false);
                    return;
                }

                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("title", title.trim());
                formData.append("type", type);
                if (category) formData.append("category", category);
                if (subcategory) formData.append("subcategory", subcategory);
                if (expiryDate) formData.append("expiry_date", expiryDate);

                if (Object.keys(combinedData).length > 0) {
                    formData.append("document_data", JSON.stringify(combinedData));
                }

                const result = await documentService.uploadDocument(formData);
                setCreatedDoc(result);
            } else {
                // 6.6 POST /api/documents (JSON Payload)
                const payload: CreateDocumentPayload = {
                    title: title.trim(),
                    type,
                    category: category || "other",
                    subcategory: subcategory || "other",
                    expiry_date: expiryDate || null,
                    document_data: Object.keys(combinedData).length > 0 ? combinedData : undefined,
                };

                const result = await documentService.createDocument(payload);
                setCreatedDoc(result);
            }
        } catch (err: unknown) {
            if (isAxiosError(err) && err.response?.status && err.response.status < 500) {
                console.warn(`[Upload Rejected: ${err.response.status}]`, err.response.data);
            } else {
                console.error("Document creation failed", err);
            }
            if (isAxiosError(err)) {
                const data = err.response?.data;
                if (Array.isArray(data?.reasons) && data.reasons.length > 0) {
                    setError(`${data.error || "Validation failed"}: ${data.reasons.join(" ")}`);
                } else if (data?.error) {
                    setError(data.error);
                } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
                    setError("Connection failed (Network Error): The server closed the connection or timed out. Please verify your connection.");
                } else {
                    setError(err.message || "Upload failed. Please verify the input values.");
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while saving the document.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
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
        resetForm: () => {
            setCreatedDoc(null);
            setSelectedFile(null);
            setTitle("");
            setExpiryDate("");
            setDynamicFields({});
            setCustomFields([]);
            setError(null);
        },
    };
}
