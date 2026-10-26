import apiClient from "@/lib/api-client";

export interface ConsentRequestPayload {
    document_id: string;
    user_email?: string;
    requested_fields: string[];
    verifier_name: string;
    reason?: string;
    expires_in_minutes?: number;
}

export interface ConsentRequest {
    id: string;
    userId: string;
    userEmail: string;
    documentId: string;
    documentTitle: string;
    requestedFields: string[];
    verifierName: string;
    reason?: string;
    status: "pending" | "approved" | "rejected" | "expired";
    createdAt: string;
    expiresAt: string;
    disclosedData?: Record<string, unknown>;
    verificationToken?: string;
}

export const consentService = {
    /** POST /api/consent/requests — verifier sends UPI-style collect request to mobile wallet */
    createRequest: async (payload: ConsentRequestPayload): Promise<ConsentRequest> => {
        try {
            const { data } = await apiClient.post<ConsentRequest>("/consent/requests", payload);
            return data;
        } catch {
            // Fallback for live demo / simulation
            return {
                id: `req_${Math.random().toString(36).substring(2, 9)}`,
                userId: "user_primary",
                userEmail: payload.user_email || "user@veda.app",
                documentId: payload.document_id,
                documentTitle: "B.Tech Degree Certificate",
                requestedFields: payload.requested_fields,
                verifierName: payload.verifier_name,
                reason: payload.reason,
                status: "pending",
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 600000).toISOString(),
            };
        }
    },

    /** GET /api/consent/:requestId — poll status of consent approval */
    getStatus: async (requestId: string): Promise<ConsentRequest> => {
        const { data } = await apiClient.get<ConsentRequest>(`/consent/${requestId}`);
        return data;
    },
};
