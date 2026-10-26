import apiClient from "@/lib/api-client";
import type {
    Document,
    DocumentDecrypted,
    CategoriesResponse,
    CreateDocumentPayload,
    UpdateDocumentPayload,
    UpdateDocumentResponse,
} from "@/lib/types/api.types";

export const documentService = {
    /** GET /api/documents/categories */
    getCategories: async (): Promise<CategoriesResponse> => {
        const { data } = await apiClient.get<CategoriesResponse>("/documents/categories");
        return data;
    },

    /** GET /api/documents?category=...&subcategory=... */
    listDocuments: async (params?: {
        category?: string;
        subcategory?: string;
    }): Promise<Document[]> => {
        const { data } = await apiClient.get<Document[]>("/documents", { params });
        return data;
    },

    /** GET /api/documents/:docId */
    getDocument: async (docId: string): Promise<Document> => {
        const { data } = await apiClient.get<Document>(`/documents/${docId}`);
        return data;
    },

    /** GET /api/documents/:docId/decrypt */
    decryptDocument: async (docId: string): Promise<DocumentDecrypted> => {
        const { data } = await apiClient.get<DocumentDecrypted>(
            `/documents/${docId}/decrypt`
        );
        return data;
    },

    /** GET /api/documents/:docId/file — returns a blob */
    downloadFile: async (docId: string): Promise<Blob> => {
        const { data } = await apiClient.get<Blob>(`/documents/${docId}/file`, {
            responseType: "blob",
        });
        return data;
    },

    /** POST /api/documents */
    createDocument: async (payload: CreateDocumentPayload): Promise<Document> => {
        const { data } = await apiClient.post<Document>("/documents", payload);
        return data;
    },

    /**
     * POST /api/documents/upload
     * Uses multipart/form-data — pass a FormData object.
     */
    uploadDocument: async (formData: FormData): Promise<Document> => {
        const { data } = await apiClient.post<Document>("/documents/upload", formData, {
            headers: { "Content-Type": undefined },
        });
        return data;
    },

    /** PATCH /api/documents/:docId */
    updateDocument: async (
        docId: string,
        payload: UpdateDocumentPayload
    ): Promise<UpdateDocumentResponse> => {
        const { data } = await apiClient.patch<UpdateDocumentResponse>(
            `/documents/${docId}`,
            payload
        );
        return data;
    },

    /** DELETE /api/documents/:docId */
    deleteDocument: async (docId: string): Promise<void> => {
        await apiClient.delete(`/documents/${docId}`);
    },

    /** POST /api/documents/:docId/verify */
    verifyDocument: async (
        docId: string
    ): Promise<{
        message: string;
        status: string;
        verified: boolean;
        checks_passed?: string[];
        errors?: string[];
        details: Record<string, unknown>;
    }> => {
        const { data } = await apiClient.post(`/documents/${docId}/verify`);
        return data;
    },

    /** PATCH /api/documents/:docId/status */
    updateDocumentStatus: async (
        docId: string,
        payload: { status: "verified" | "pending" | "rejected"; notes?: string }
    ): Promise<{ message: string; document: Document; notes?: string }> => {
        const { data } = await apiClient.patch(`/documents/${docId}/status`, payload);
        return data;
    },
};
