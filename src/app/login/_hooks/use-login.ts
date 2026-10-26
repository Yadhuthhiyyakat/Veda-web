"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { useAuth } from "@/lib/context/auth-context";
import { isAxiosError } from "axios";

/**
 * Hook for login form: calls POST /api/auth/login,
 * stores tokens, then redirects to /dashboard.
 */
export function useLogin() {
    const router = useRouter();
    const { refreshSession } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authService.login({ email, password });
            await refreshSession();
            router.push("/dashboard");
        } catch (err) {
            if (isAxiosError(err)) {
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Login failed. Please check your credentials.";
                setError(msg);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        isLoading,
        error,
        handleSubmit,
    };
}
