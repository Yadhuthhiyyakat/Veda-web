import apiClient from "@/lib/api-client";
import type { Institution, InstitutionQueueItem } from "@/lib/types/api.types";

export interface SubmitVerificationPayload {
  target_institution: string;
  applicant_notes?: string;
}

export interface ReviewDocumentPayload {
  status: "verified" | "rejected";
  decision: "genuine" | "fraudulent";
  institution_name?: string;
  institution_type?: string;
  notes?: string;
}

export const institutionService = {
  // Get list of registered institutions
  async getInstitutions(): Promise<Institution[]> {
    const res = await apiClient.get<{ count: number; institutions: Institution[] }>("/institutions");
    return res.data.institutions || [];
  },

  // Get institution verification queue
  async getQueue(): Promise<{ institution: string; count: number; documents: InstitutionQueueItem[] }> {
    const res = await apiClient.get<{ institution: string; count: number; documents: InstitutionQueueItem[] }>("/institutions/queue");
    return res.data;
  },

  // Citizen submits document for verification
  async submitDocument(docId: string, payload: SubmitVerificationPayload) {
    const res = await apiClient.post(`/institutions/submit/${docId}`, payload);
    return res.data;
  },

  // Institution reviews and verifies or flags document
  async reviewDocument(docId: string, payload: ReviewDocumentPayload) {
    const res = await apiClient.patch(`/documents/${docId}/status`, payload);
    return res.data;
  },

  // Switch or register account role (citizen vs institution)
  async updateRole(role: "citizen" | "institution", institution_name?: string, institution_type?: string) {
    const res = await apiClient.patch("/institutions/role", {
      role,
      institution_name,
      institution_type,
    });
    return res.data;
  },
};
