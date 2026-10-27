"use client";

import { useState, useCallback } from "react";
import { tokenService } from "@/lib/services/token.service";
import { isAxiosError } from "axios";
import type { Token } from "@/lib/types/api.types";

/**
 * Hook for document share page.
 * Generates QR tokens via POST /api/tokens and manages revocation.
 */
export function useDocumentShare() {
    const [documentId, setDocumentId] = useState("");
    const [expiresInMinutes, setExpiresInMinutes] = useState(15);
    const [generatedToken, setGeneratedToken] = useState<Token | null>(null);
    const [activeTokens, setActiveTokens] = useState<Token[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateShareToken = async (
        docId: string,
        sharedFields?: string[],
        allowedEmails?: string[]
    ) => {
        setError(null);
        setIsGenerating(true);
        try {
            const token = await tokenService.generateToken({
                document_id: docId,
                expires_in_minutes: expiresInMinutes,
                shared_fields: sharedFields && sharedFields.length > 0 ? sharedFields : undefined,
                allowed_emails: allowedEmails && allowedEmails.length > 0 ? allowedEmails : undefined,
            });
            setGeneratedToken(token);
            await loadTokensForDocument(docId);
            return token;
        } catch (err) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to generate share token.");
            }
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const loadTokensForDocument = useCallback(async (docId: string) => {
        setIsLoadingTokens(true);
        try {
            const tokens = await tokenService.listTokensForDocument(docId);
            setActiveTokens(tokens);
        } catch {
            setActiveTokens([]);
        } finally {
            setIsLoadingTokens(false);
        }
    }, []);

    const revokeToken = async (tokenId: string) => {
        try {
            await tokenService.revokeToken(tokenId);
            setActiveTokens((prev) => prev.filter((t) => t.id !== tokenId));
            if (generatedToken?.id === tokenId) setGeneratedToken(null);
        } catch {
            setError("Failed to revoke token.");
        }
    };

    const getShareUrl = (token: string) => {
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            "https://veda-beryl-rho.vercel.app";
        return `${appUrl}/verify/${token}`;
    };

    return {
        documentId, setDocumentId,
        expiresInMinutes, setExpiresInMinutes,
        generatedToken,
        activeTokens,
        isGenerating,
        isLoadingTokens,
        error,
        generateShareToken,
        loadTokensForDocument,
        revokeToken,
        getShareUrl,
    };
}
