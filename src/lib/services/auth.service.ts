import apiClient, { BASE_URL, tokenStorage } from "@/lib/api-client";
import axios from "axios";
import type {
    LoginResponse,
    SignupResponse,
    MeResponse,
    RefreshPayload,
    RefreshResponse,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    ResetPasswordPayload,
    ResetPasswordResponse,
    DeleteAccountResponse,
    HealthCheckResponse,
    DevicePairingTokenResponse,
} from "@/lib/types/api.types";

export const authService = {
    /** GET /health — Uptime monitoring / Render backend warmup check */
    healthCheck: async (): Promise<HealthCheckResponse> => {
        const { data } = await axios.get<HealthCheckResponse>(`${BASE_URL}/health`);
        return data;
    },

    /** POST /api/auth/signup */
    signup: async (payload: {
        email: string;
        password: string;
        full_name?: string;
    }): Promise<SignupResponse> => {
        const { data } = await apiClient.post<SignupResponse>("/auth/signup", payload);
        return data;
    },

    /** POST /api/auth/login — stores tokens automatically */
    login: async (payload: {
        email: string;
        password: string;
    }): Promise<LoginResponse> => {
        const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return data;
    },

    /**
     * POST /api/auth/refresh
     * Refreshes access token using provided refresh token or stored refresh token.
     * Updates token storage with newly returned access & refresh tokens.
     */
    refresh: async (payload?: string | RefreshPayload): Promise<RefreshResponse> => {
        const refreshToken =
            typeof payload === "string"
                ? payload
                : payload?.refresh_token ?? tokenStorage.getRefreshToken();

        if (!refreshToken) {
            throw new Error("No refresh token available to refresh access token.");
        }

        const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", {
            refresh_token: refreshToken,
        });
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return data;
    },

    /**
     * POST /api/auth/forgot-password
     * Sends a password reset OTP code to the provided email address.
     */
    forgotPassword: async (
        payload: string | ForgotPasswordPayload
    ): Promise<ForgotPasswordResponse> => {
        const email = typeof payload === "string" ? payload : payload.email;
        const { data } = await apiClient.post<ForgotPasswordResponse>(
            "/auth/forgot-password",
            { email }
        );
        return data;
    },

    /**
     * POST /api/auth/reset-password
     * Resets password using verification OTP sent to email.
     */
    resetPassword: async (
        payload: ResetPasswordPayload
    ): Promise<ResetPasswordResponse> => {
        const { data } = await apiClient.post<ResetPasswordResponse>(
            "/auth/reset-password",
            payload
        );
        return data;
    },

    /** GET /api/auth/me */
    me: async (): Promise<MeResponse> => {
        const { data } = await apiClient.get<MeResponse>("/auth/me");
        return data;
    },

    /** POST /api/auth/logout — clears tokens */
    logout: async (): Promise<void> => {
        await apiClient.post("/auth/logout");
        tokenStorage.clearTokens();
    },

    /** DELETE /api/auth/delete */
    deleteAccount: async (): Promise<DeleteAccountResponse> => {
        const { data } = await apiClient.delete<DeleteAccountResponse>("/auth/delete");
        tokenStorage.clearTokens();
        return data;
    },

    /** POST /api/auth/pair-token — generates QR pairing payload for mobile app */
    getPairingToken: async (): Promise<DevicePairingTokenResponse> => {
        const { data } = await apiClient.post<DevicePairingTokenResponse>("/auth/pair-token");
        return data;
    },

    /** Helper: returns true if a token exists in localStorage */
    isLoggedIn: (): boolean => {
        return !!tokenStorage.getAccessToken();
    },
};
