import apiClient from "@/lib/api-client";

export interface AdminStats {
  total_users: number;
  total_citizens: number;
  total_institutions: number;
  total_admins: number;
  total_documents: number;
  verified_documents: number;
  flagged_forgeries: number;
}

export interface AdminUserItem {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "citizen" | "institution" | "admin";
  institution_name: string | null;
  institution_type: string | null;
  updated_at: string;
}

export interface AssignRolePayload {
  role: "citizen" | "institution" | "admin";
  institution_name?: string;
  institution_type?: string;
}

export const adminService = {
  // Get overview platform statistics
  async getStats(): Promise<AdminStats> {
    const res = await apiClient.get<{ stats: AdminStats }>("/admin/stats");
    return res.data.stats;
  },

  // List users with search and role filters
  async listUsers(params?: { search?: string; role?: string }): Promise<AdminUserItem[]> {
    const res = await apiClient.get<{ count: number; users: AdminUserItem[] }>("/admin/users", {
      params,
    });
    return res.data.users || [];
  },

  // Assign role and institution credentials to a specific user
  async assignRole(userId: string, payload: AssignRolePayload): Promise<{ message: string; profile: AdminUserItem }> {
    const res = await apiClient.patch<{ message: string; profile: AdminUserItem }>(
      `/admin/users/${userId}/role`,
      payload
    );
    return res.data;
  },
};
