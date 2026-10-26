/**
 * Veda API Client
 *
 * Singleton Axios instance pre-configured with:
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Automatic Bearer token injection from localStorage
 * - Automatic token refresh on 401 responses
 * - Redirect to /login on refresh failure
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://vedha-backend-9wy7.onrender.com";
// Strip trailing slashes and trailing /api to guarantee clean endpoints
export const BASE_URL = rawBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");

// ─── Token helpers ────────────────────────────────────────────────────────────

export const tokenStorage = {
    getAccessToken: () =>
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
    getRefreshToken: () =>
        typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null,
    setTokens: (access: string, refresh: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
        }
    },
    clearTokens: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
    },
};

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// ─── Request interceptor: attach token ───────────────────────────────────────

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/refresh",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
];

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const isPublic =
        config.url && PUBLIC_AUTH_ENDPOINTS.some((endpoint) => config.url?.includes(endpoint));

    const token = tokenStorage.getAccessToken();
    if (token && !isPublic) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response interceptor: auto-refresh on 401 ───────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            // If the failing request was itself /auth/refresh, don't attempt to refresh again
            if (originalRequest.url?.includes("/auth/refresh")) {
                tokenStorage.clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
                tokenStorage.clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers = originalRequest.headers ?? {};
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refresh_token: refreshToken,
                });
                const { access_token, refresh_token: newRefresh } = res.data;
                tokenStorage.setTokens(access_token, newRefresh);
                processQueue(null, access_token);

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                tokenStorage.clearTokens();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
