// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface HealthCheckResponse {
    status: string;
    timestamp: string;
}


export interface AuthUser {
    id: string;
    email: string;
}

export interface AuthProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    role?: "citizen" | "institution" | "admin";
    institution_name?: string | null;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: AuthUser;
}

export interface SignupResponse {
    message: string;
    user: AuthUser;
}

export interface MeResponse {
    user: AuthUser;
    profile: AuthProfile;
}

export interface RefreshPayload {
    refresh_token: string;
}

export interface RefreshResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    new_password: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface DeleteAccountResponse {
    message: string;
}

export interface DevicePairingTokenResponse {
    pair_token: string;
    expires_in: number;
    user_id: string;
    email: string;
    qr_payload: string;
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export interface VerificationSeal {
    seal_id: string;
    is_genuine: boolean;
    status: string;
    verifier_id?: string;
    verifier_name: string;
    institution_type?: string;
    verified_at: string;
    notes?: string;
}

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    updated_at?: string;
    role?: "citizen" | "institution" | "admin";
    institution_name?: string | null;
    institution_type?: string | null;
}

export interface UpdateProfilePayload {
    username?: string;
    full_name?: string;
    avatar_url?: string;
}

export interface PublicProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
}

// ─────────────────────────────────────────────
// Documents
// ─────────────────────────────────────────────

export type DocumentStatus = "verified" | "pending" | "rejected";

export interface Document {
    id: string;
    owner_id: string;
    title: string;
    type: string;
    category: string;
    subcategory: string;
    status: DocumentStatus;
    expiry_date: string | null;
    created_at: string;
    updated_at: string;
    file_url?: string | null;
    document_data?: Record<string, unknown>;
    target_institution?: string | null;
    submission_status?: "draft" | "submitted" | "reviewed";
    applicant_notes?: string | null;
    verification_seal?: VerificationSeal | null;
}

export interface DocumentDecrypted extends Document {
    document_data: Record<string, unknown>;
}

export interface CreateDocumentPayload {
    title: string;
    type: string;
    category?: string;
    subcategory?: string;
    expiry_date?: string | null;
    document_data?: Record<string, unknown>;
}

export interface UpdateDocumentPayload {
    title?: string;
    type?: string;
    category?: string;
    subcategory?: string;
    expiry_date?: string | null;
    document_data?: Record<string, unknown>;
}

export interface UpdateDocumentResponse {
    message: string;
    document: Document;
}

// Category taxonomy from /api/documents/categories
export interface DocumentSubcategory {
    id: string;
    name: string;
    required_fields?: string[];
}

export interface DocumentCategory {
    id: string;
    name: string;
    description?: string;
    subcategories: DocumentSubcategory[];
}

export interface CategoriesResponse {
    categories: DocumentCategory[];
}

// ─────────────────────────────────────────────
// Tokens (QR)
// ─────────────────────────────────────────────

export interface Token {
    id: string;
    document_id: string;
    token: string;
    expires_at: string;
    shared_fields: string[] | null;
    created_at: string;
}

export interface GenerateTokenPayload {
    document_id: string;
    expires_in_minutes?: number;
    shared_fields?: string[];
}

export interface VerifyTokenResponse {
    valid: boolean;
    expires_at: string;
    document: Record<string, unknown>;
    file_url?: string | null;
    file_name?: string | null;
    mime_type?: string | null;
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export type NotificationType = "expiry_warning" | "document_expired" | "verification_status";
export type NotificationStatus = "unread" | "read" | "archived";
export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
    id: string;
    user_id: string;
    document_id: string | null;
    type: NotificationType;
    title: string;
    message: string;
    severity: NotificationSeverity;
    status: NotificationStatus;
    read_at: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface NotificationsResponse {
    unread_count: number;
    count: number;
    notifications: Notification[];
}

export interface UnreadCountResponse {
    unread_count: number;
}

export interface ExpiringSummaryDoc {
    id: string;
    title: string;
    category?: string;
    subcategory?: string;
    expiry_date: string;
    days_remaining: number;
}

export interface ExpiringSummaryResponse {
    total_with_expiry: number;
    expired: ExpiringSummaryDoc[];
    critical_7_days: ExpiringSummaryDoc[];
    warning_30_days: ExpiringSummaryDoc[];
    valid: ExpiringSummaryDoc[];
}

// ─────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────

export interface AuditLog {
    id: string;
    document_id: string;
    verifier_id: string | null;
    status: string;
    created_at: string;
    documents: {
        title: string;
        type: string;
    };
}

// ─────────────────────────────────────────────
// Standard API Error
// ─────────────────────────────────────────────

export interface ApiError {
    error: string;
    details?: Record<string, string[]>;
}

// ─────────────────────────────────────────────
// Institutions
// ─────────────────────────────────────────────

export interface Institution {
    id: string;
    name: string;
    type: string;
    avatar_url?: string | null;
    verified: boolean;
}

export interface InstitutionQueueItem {
    id: string;
    title: string;
    type: string;
    category: string;
    subcategory: string;
    status: DocumentStatus;
    submission_status: string;
    target_institution: string | null;
    applicant_notes: string | null;
    verification_seal: VerificationSeal | null;
    created_at: string;
    expiry_date: string | null;
    owner_name: string;
    owner_avatar?: string | null;
    document_data?: Record<string, unknown>;
    has_file?: boolean;
}
