"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    LockIcon,
    QrCodeIcon,
    FingerprintIcon,
    UploadIcon,
    KeyIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ChevronRightIcon,
    DocFileIcon,
    CheckIcon,
} from "@/lib/icons";

export function HeroSection() {
    const [faqOpen, setFaqOpen] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/40 via-white to-slate-50">
            {/* Ambient background glow accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-60">
                <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute top-10 right-1/4 w-80 h-80 bg-violet-300/25 rounded-full blur-3xl" />
            </div>

            {/* HERO HERO SECTION */}
            <section className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 flex flex-col items-center text-center">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 shadow-xs mb-8 transition-transform hover:scale-102">
                    <SparklesIcon className="w-4 h-4 text-[#5a4fcf]" />
                    <span className="text-xs font-bold text-slate-700 tracking-wide">
                        Decentralized &amp; Cryptographically Verified Vault
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5a4fcf]" />
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#131127] tracking-tight max-w-4xl leading-[1.15] mb-6">
                    Military-Grade Security for Every{" "}
                    <span className="bg-gradient-to-r from-[#4f46e5] via-[#5a4fcf] to-[#7c3aed] bg-clip-text text-transparent">
                        Document You Own
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-600 mb-10 text-lg sm:text-xl max-w-2xl leading-relaxed font-normal">
                    Store, encrypt, and share sensitive credentials with end-to-end protection.
                    Verify authenticity instantly via time-limited QR codes and zero-knowledge proofs.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
                    <Link href="/signup" className="w-full sm:w-auto">
                        <button className="w-full sm:w-48 bg-[#131127] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-indigo-950/20 hover:bg-[#252048] hover:shadow-indigo-900/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <span>Open Free Vault</span>
                            <ChevronRightIcon className="w-4 h-4 text-indigo-300" />
                        </button>
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto">
                        <button className="w-full sm:w-48 bg-white text-slate-800 border border-slate-200 py-3.5 px-6 rounded-xl font-bold text-sm shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all">
                            Access Existing Account
                        </button>
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 mb-20">
                    <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-600" /> End-to-End Encryption
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                    <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-600" /> Zero-Knowledge Architecture
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                    <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-600" /> Instant QR Verification
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                    <span className="flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4 text-emerald-600" /> Device Biometrics
                    </span>
                </div>

                {/* INTERACTIVE PREVIEW CARD SHOWCASE */}
                <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-indigo-950/10 p-6 sm:p-10 text-left relative overflow-hidden mb-24 transition-all">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Left Details */}
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                                <span>Cryptographically Verified Document</span>
                            </div>

                            <h3 className="text-2xl font-extrabold text-[#131127]">
                                National Identity &amp; Digital Credential Vault
                            </h3>

                            <p className="text-slate-500 text-sm leading-relaxed">
                                Recipients verify authentic signatures in real-time without exposing your private data.
                                Revoke access anytime with a single click.
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[11px] font-semibold text-slate-400">Security Architecture</div>
                                    <div className="text-sm font-bold text-slate-800">End-to-End Encrypted</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="text-[11px] font-semibold text-slate-400">Share Expiration</div>
                                    <div className="text-sm font-bold text-emerald-600">Auto-expires in 24h</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Mock QR & Card */}
                        <div className="w-full md:w-64 bg-gradient-to-br from-[#131127] to-[#252048] p-6 rounded-2xl text-white shadow-xl flex flex-col items-center text-center relative shrink-0">
                            <div className="text-[10px] tracking-widest uppercase font-bold text-indigo-300 mb-3 flex items-center gap-1.5">
                                <QrCodeIcon className="w-3.5 h-3.5" />
                                <span>Scan to Verify</span>
                            </div>

                            {/* Stylized QR placeholder with glow */}
                            <div className="w-36 h-36 bg-white p-3 rounded-xl shadow-md flex items-center justify-center relative mb-3">
                                <QrCodeIcon className="w-28 h-28 text-slate-900" />
                                <div className="absolute inset-0 border-2 border-indigo-400/40 rounded-xl animate-pulse pointer-events-none" />
                            </div>

                            <span className="text-xs font-semibold text-slate-200">
                                Single-Use Verification Token
                            </span>
                            <span className="text-[10px] text-indigo-300 font-mono mt-1">
                                #VEDA-98A4-77C1
                            </span>
                        </div>
                    </div>
                </div>

                {/* CORE FEATURES SECTION (#features) */}
                <div id="features" className="w-full pt-10 pb-16">
                    <div className="mb-12">
                        <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#5a4fcf] mb-2">
                            Pillars of Security
                        </h2>
                        <h3 className="text-3xl font-extrabold text-[#131127]">
                            Engineered for Zero-Compromise Privacy
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<LockIcon className="w-6 h-6 text-[#5a4fcf]" />}
                            title="Zero-Knowledge Encryption"
                            description="All files are encrypted client-side before ever touching the network."
                        />
                        <FeatureCard
                            icon={<QrCodeIcon className="w-6 h-6 text-emerald-600" />}
                            title="Time-Limited QR Sharing"
                            description="Share documents using temporary, rotating QR tokens that expire automatically."
                        />
                        <FeatureCard
                            icon={<ShieldCheckIcon className="w-6 h-6 text-indigo-600" />}
                            title="Multi-Factor Auth (MFA)"
                            description="Guard your vault access with biometric passkeys, hardware keys, and one-time codes."
                        />
                        <FeatureCard
                            icon={<FingerprintIcon className="w-6 h-6 text-violet-600" />}
                            title="Biometric Device Handshake"
                            description="Pair desktop sessions seamlessly with your VEDA mobile hardware authenticator."
                        />
                    </div>
                </div>

                {/* HOW IT WORKS SECTION (#how-it-works) */}
                <div id="how-it-works" className="w-full pt-16 pb-20 border-t border-slate-100">
                    <div className="mb-14">
                        <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#5a4fcf] mb-2">
                            Simplified Architecture
                        </h2>
                        <h3 className="text-3xl font-extrabold text-[#131127]">
                            How VEDA Protects Your Documents
                        </h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
                            From local device encryption to cryptographic recipient validation in 5 seamless steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                        <StepCard
                            step="1"
                            icon={<UploadIcon className="w-6 h-6 text-indigo-600" />}
                            title="1. Upload File"
                            desc="Select PDF, image, or digital credential on your browser"
                        />
                        <StepCard
                            step="2"
                            icon={<LockIcon className="w-6 h-6 text-violet-600" />}
                            title="2. Encrypt Locally"
                            desc="Encrypted with unique symmetric key in memory"
                        />
                        <StepCard
                            step="3"
                            icon={<KeyIcon className="w-6 h-6 text-amber-600" />}
                            title="3. Generate Hash & UUID"
                            desc="Immutable fingerprint and UUID issued on the ledger"
                        />
                        <StepCard
                            step="4"
                            icon={<QrCodeIcon className="w-6 h-6 text-blue-600" />}
                            title="4. Share via QR / Link"
                            desc="Set expiry, view permissions, and recipient criteria"
                        />
                        <StepCard
                            step="5"
                            icon={<ShieldCheckIcon className="w-6 h-6 text-emerald-600" />}
                            title="5. Instant Verification"
                            desc="Verifier validates signature without accessing raw master keys"
                        />
                    </div>
                </div>

                {/* SECURITY COMPARISON BANNER (#security) */}
                <div id="security" className="w-full bg-gradient-to-br from-[#131127] via-[#1a1738] to-[#252048] rounded-3xl p-8 sm:p-12 text-white text-left relative overflow-hidden mb-24 shadow-2xl">
                    <div className="relative z-10 max-w-2xl">
                        <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
                            Enterprise Protection
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-4 leading-snug">
                            Traditional cloud storage isn&apos;t designed for private credentials.
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-8">
                            Most cloud storage providers hold the keys to decrypt your files. With VEDA&apos;s zero-knowledge architecture,
                            even if servers were compromised, your raw credentials remain undecryptable without your private authorization key.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-black text-indigo-300">Zero-Trust</div>
                                <div className="text-xs text-slate-300 mt-1">End-to-End Vault Security</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-black text-emerald-400">0 ms</div>
                                <div className="text-xs text-slate-300 mt-1">Instant QR Proof Verification</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                <div className="text-2xl font-black text-violet-300">100%</div>
                                <div className="text-xs text-slate-300 mt-1">Client-Side Key Ownership</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ SECTION (#faq) */}
                <div id="faq" className="w-full max-w-3xl pt-8 pb-16 text-left">
                    <div className="text-center mb-10">
                        <h2 className="text-xs uppercase tracking-widest font-extrabold text-[#5a4fcf] mb-2">
                            Frequently Asked Questions
                        </h2>
                        <h3 className="text-3xl font-extrabold text-[#131127]">
                            Everything You Need to Know
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <FaqItem
                            index={0}
                            isOpen={faqOpen === 0}
                            onClick={() => toggleFaq(0)}
                            question="How does VEDA's QR code document verification work?"
                            answer="When you generate a shareable QR code, VEDA creates a cryptographically signed verification payload with a strict expiration window. The verifier scans the QR code to fetch the public verification proof without receiving your master decryption key."
                        />
                        <FaqItem
                            index={1}
                            isOpen={faqOpen === 1}
                            onClick={() => toggleFaq(1)}
                            question="Can VEDA administrators view or read my uploaded documents?"
                            answer="No. All documents undergo client-side encryption. The encryption keys remain on your device or in your paired biometric wallet. VEDA servers only store the encrypted ciphertext and cryptographic hash."
                        />
                        <FaqItem
                            index={2}
                            isOpen={faqOpen === 2}
                            onClick={() => toggleFaq(2)}
                            question="What happens when a document or shared link reaches its expiry date?"
                            answer="Expired links are immediately invalidated at the API gateway. Verifiers attempting to scan or open expired credentials will receive an expiration notice, protecting you against permanent, open-ended document exposure."
                        />
                        <FaqItem
                            index={3}
                            isOpen={faqOpen === 3}
                            onClick={() => toggleFaq(3)}
                            question="Can I pair my smartphone as a biometric authenticator?"
                            answer="Yes! VEDA provides hardware device linking via QR pairing. Once paired, authorization challenges and document decrypt requests can be approved with FaceID or Fingerprint on your mobile device."
                        />
                    </div>
                </div>

                {/* BOTTOM CTA BANNER */}
                <div className="w-full bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-3xl border border-indigo-100 p-8 sm:p-12 text-center shadow-lg shadow-indigo-100/50">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#131127] mb-3">
                        Ready to Protect Your Digital Credentials?
                    </h3>
                    <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
                        Set up your encrypted vault in under 60 seconds with zero credit card required.
                    </p>
                    <Link href="/signup">
                        <button className="bg-[#131127] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-950/20 hover:bg-[#252048] hover:-translate-y-0.5 transition-all">
                            Get Started with VEDA Now
                        </button>
                    </Link>
                </div>
            </section>

            {/* SLEEK FOOTER */}
            <footer className="border-t border-slate-200 bg-white py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">VEDA</span>
                        <span>• Secure Cryptographic Document Verification System</span>
                    </div>
                    <div className="flex items-center gap-6 font-medium">
                        <a href="#features" className="hover:text-slate-800 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-slate-800 transition-colors">Architecture</a>
                        <a href="#security" className="hover:text-slate-800 transition-colors">Security</a>
                        <Link href="/login" className="hover:text-slate-800 transition-colors">Portal Login</Link>
                    </div>
                    <div>
                        &copy; {new Date().getFullYear()} VEDA Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-start text-left group">
            <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-indigo-50/60 transition-colors mb-4">
                {icon}
            </div>
            <h4 className="text-base font-bold text-[#131127] mb-2">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
        </div>
    );
}

function StepCard({
    step,
    icon,
    title,
    desc,
}: {
    step: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center mb-4 group-hover:bg-[#5a4fcf] group-hover:text-white transition-colors">
                {step}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {icon}
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
            <p className="text-xs text-slate-500 leading-snug">{desc}</p>
        </div>
    );
}

function FaqItem({
    index,
    isOpen,
    onClick,
    question,
    answer,
}: {
    index: number;
    isOpen: boolean;
    onClick: () => void;
    question: string;
    answer: string;
}) {
    return (
        <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs">
            <button
                type="button"
                onClick={onClick}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-[#5a4fcf] transition-colors"
            >
                <span>{question}</span>
                <span
                    className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 transition-transform ${
                        isOpen ? "rotate-180 bg-indigo-50 text-[#5a4fcf]" : ""
                    }`}
                >
                    ▼
                </span>
            </button>
            {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {answer}
                </div>
            )}
        </div>
    );
}
