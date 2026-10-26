"use client";

import { useState, useEffect, useCallback } from "react";
import { documentService } from "@/lib/services/document.service";
import { useAuth } from "@/lib/context/auth-context";
import type { Document } from "@/lib/types/api.types";

/**
 * Hook for the dashboard page.
 * Fetches recent documents and computes summary statistics.
 */
export function useDashboard() {
    const { profile } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const docs = await documentService.listDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const expiringSoonCount = documents.filter((d) => {
        if (!d.expiry_date) return false;
        const diff = new Date(d.expiry_date).getTime() - now;
        return diff > 0 && diff <= thirtyDaysMs;
    }).length;

    // Stats derived from real data
    const stats = {
        totalDocuments: documents.length,
        sharedToday: 0,
        expiringSoon: expiringSoonCount,
        recentActivity: 0,
    };

    return {
        profile,
        searchQuery,
        setSearchQuery,
        documents: filteredDocuments,
        stats,
        isLoading,
        error,
        refresh: fetchDashboardData,
    };
}
