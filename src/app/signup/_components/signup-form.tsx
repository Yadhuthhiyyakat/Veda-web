"use client";

import React, { useState } from "react";
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from "@/lib/icons";
import { useSignup } from "../_hooks/use-signup";

export function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const {
        fullName,
        setFullName,
        email,
        setEmail,
        password,
        setPassword,
        isLoading,
        error,
        success,
        handleSubmit,
    } = useSignup();

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Error Banner */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Success Banner */}
            {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl">
                    Account created successfully! Initializing your vault…
                </div>
            )}

            {/* Full Name */}
            <div>
                <label
                    htmlFor="signup-name"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                >
                    Full Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="signup-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                        placeholder="e.g. Alex Morgan"
                        autoComplete="name"
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="signup-email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                >
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MailIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="signup-email"
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
                <label
                    htmlFor="signup-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5"
                >
                    Create Master Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <LockIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                        placeholder="Min. 8 chars, 1 uppercase, 1 number"
                        autoComplete="new-password"
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
                    id="signup-submit"
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-[#131127] text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-950/20 hover:bg-[#252048] hover:shadow-indigo-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating Vault Keypair…</span>
                        </>
                    ) : (
                        <span>Create Free Account</span>
                    )}
                </button>
            </div>
        </form>
    );
}
