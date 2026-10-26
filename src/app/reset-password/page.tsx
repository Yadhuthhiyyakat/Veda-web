import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import { ResetPasswordForm } from "./_components/reset-password-form";
import { ShieldCheckIcon, LockIcon } from "@/lib/icons";

export const metadata = {
    title: "Reset Password - VEDA",
    description: "Enter your verification code and set a new password for your VEDA account.",
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-slate-50 to-purple-50/40 font-sans text-slate-900 flex flex-col relative selection:bg-indigo-100">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 pointer-events-none overflow-hidden opacity-50">
                <div className="absolute -top-24 left-1/3 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute top-10 right-1/3 w-72 h-72 bg-violet-300/30 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between px-6 sm:px-10 py-5 bg-white/70 backdrop-blur-md border-b border-slate-200/70 relative z-10">
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/vedalogo.svg"
                        alt="Veda Logo"
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xl text-[#131127] tracking-tight">VEDA</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-[#5a4fcf] border border-indigo-100">
                            Vault
                        </span>
                    </div>
                </Link>

                <Link
                    href="/login"
                    className="text-xs font-bold text-slate-600 hover:text-[#5a4fcf] transition-colors"
                >
                    Back to Login →
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 relative z-10 my-8">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-950/5 w-full max-w-md p-8 sm:p-10 border border-slate-200/80">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#131127] to-[#252048] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <LockIcon className="w-5 h-5 text-indigo-300" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#131127] tracking-tight mb-1.5">
                            Set New Password
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                            Enter the code sent to your email to set a new master password
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="py-8 text-center text-xs text-slate-400">
                                Loading reset form…
                            </div>
                        }
                    >
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-6 pt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-100">
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Protected by End-to-End Cryptographic Verification</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
