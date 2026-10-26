"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/lib/icons";
import { useLogin } from "../_hooks/use-login";

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { email, setEmail, password, setPassword, isLoading, error, handleSubmit } =
        useLogin();

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error Banner */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Email */}
            <div>
                <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                >
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MailIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                        placeholder="you@domain.com"
                        autoComplete="email"
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label
                        htmlFor="login-password"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
                    >
                        Master Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-xs text-[#5a4fcf] hover:underline font-semibold"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LockIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                        ) : (
                            <EyeIcon className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="pt-2">
                <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#131127] text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-950/20 hover:bg-[#252048] hover:shadow-indigo-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying Credentials…</span>
                        </>
                    ) : (
                        <span>Sign In to Vault</span>
                    )}
                </button>
            </div>
        </form>
    );
}
