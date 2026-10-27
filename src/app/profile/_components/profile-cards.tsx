"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckIcon, EditIcon, CopyIcon, ExternalLinkIcon, SearchIcon, CloseIcon } from "@/lib/icons";
import type { Profile, PublicProfile } from "@/lib/types/api.types";

interface ProfileInfoCardProps {
    profile: Profile | null;
    email?: string;
    isLoading: boolean;
    onEdit: () => void;
}

export function ProfileInfoCard({ profile, email, isLoading, onEdit }: ProfileInfoCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        if (!profile?.id) return;
        navigator.clipboard.writeText(profile.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[360px]">
                <div className="w-10 h-10 border-3 border-[#5a4fcf] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs text-gray-400 font-medium">Loading profile…</p>
            </div>
        );
    }

    const displayName = profile?.full_name || "Veda User";
    const displayUsername = profile?.username ? `@${profile.username}` : "@user";
    const displayEmail = email || "No email available";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Edit button */}
            <button
                type="button"
                onClick={onEdit}
                className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors cursor-pointer"
                title="Update Profile Information"
            >
                <EditIcon className="w-3.5 h-3.5 text-gray-500" />
                Edit Profile
            </button>

            {/* Avatar */}
            <div className="relative mb-5 mt-2">
                <div className="w-24 h-24 rounded-full border-[2.5px] border-[#5a4fcf] flex items-center justify-center bg-[#f4f2ff] overflow-hidden shadow-sm">
                    {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profile.avatar_url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback on broken image link
                                (e.target as HTMLElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span className="text-3xl font-extrabold text-[#5a4fcf]">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-bold text-[#1a172c] mb-0.5">{displayName}</h2>
            <p className="text-xs font-semibold text-[#5a4fcf] mb-1">{displayUsername}</p>
            <p className="text-xs text-gray-400 font-medium mb-4">{displayEmail}</p>

            <div className="inline-flex items-center gap-1.5 bg-[#e0f8e9] text-[#16a34a] px-3.5 py-1 rounded-full text-xs font-bold mb-5">
                <CheckIcon className="w-3.5 h-3.5" />
                Identity Verified
            </div>

            {/* User ID & metadata badge */}
            {profile?.id && (
                <div className="w-full pt-4 border-t border-gray-100 space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium text-gray-400">User ID:</span>
                        <div className="flex items-center gap-1 font-mono text-[11px] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                            <span className="truncate max-w-[170px]" title={profile.id}>
                                {profile.id}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyId}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                                title="Copy User ID for Public Profile lookup"
                            >
                                <CopyIcon className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                    {copied && (
                        <p className="text-[10px] text-emerald-600 font-semibold text-right">
                            Copied to clipboard!
                        </p>
                    )}
                    {profile.updated_at && (
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>Last updated:</span>
                            <span>{new Date(profile.updated_at).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface ProfileEditCardProps {
    formData: {
        username: string;
        full_name: string;
        avatar_url: string;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            username: string;
            full_name: string;
            avatar_url: string;
        }>
    >;
    formErrors: {
        username?: string;
        full_name?: string;
        avatar_url?: string;
    };
    isSaving: boolean;
    onSave: (e?: React.FormEvent) => Promise<void>;
    onCancel: () => void;
}

export function ProfileEditCard({
    formData,
    setFormData,
    formErrors,
    isSaving,
    onSave,
    onCancel,
}: ProfileEditCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-[#1a172c]">Edit Profile</h2>
                    <p className="text-xs text-gray-400">
                        Update your account information and preferences
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={onSave} className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        placeholder="e.g. Yadhu Krishna T M"
                        disabled={isSaving}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                    />
                    {formErrors.full_name && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">
                            {formErrors.full_name}
                        </p>
                    )}
                </div>

                {/* Username */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Username (min 3 characters)
                    </label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm font-medium">
                            @
                        </span>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, username: e.target.value }))
                            }
                            placeholder="yadhukrishna"
                            disabled={isSaving}
                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                        />
                    </div>
                    {formErrors.username && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">
                            {formErrors.username}
                        </p>
                    )}
                </div>

                {/* Avatar URL */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Avatar URL
                    </label>
                    <input
                        type="url"
                        value={formData.avatar_url}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
                        }
                        placeholder="https://example.com/avatar.jpg"
                        disabled={isSaving}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                    />
                    {formErrors.avatar_url && (
                        <p className="text-[11px] text-rose-500 mt-1 font-medium">
                            {formErrors.avatar_url}
                        </p>
                    )}
                    {formData.avatar_url && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={formData.avatar_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 truncate">
                                Live Preview: {formData.avatar_url}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

interface CredentialRowProps {
    label: string;
    value: string;
    title?: string;
    truncate?: boolean;
}

function CredentialRow({ label, value, title, truncate }: CredentialRowProps) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-4">
            <span className="text-xs text-gray-400 font-medium shrink-0">{label}</span>
            <span
                className={`text-xs font-bold text-[#1a172c] text-right font-mono ${
                    truncate ? "truncate max-w-[200px] sm:max-w-xs" : ""
                }`}
                title={title || value}
            >
                {value}
            </span>
        </div>
    );
}

export function CryptoCredentialsCard({ profile }: { profile: Profile | null }) {
    const rawId = profile?.id || "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";
    const shortId = rawId.length > 8 ? rawId.slice(0, 8) : rawId;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-[#1a172c] mb-1">Cryptographic Credentials</h2>
            <p className="text-xs text-gray-400 font-medium mb-6">
                Decentralized identifiers & Solana keypair pairings
            </p>
            <div className="space-y-1">
                <CredentialRow label="Legal Name" value={profile?.full_name || "Veda Verified Holder"} />
                <CredentialRow
                    label="Decentralized ID (DID)"
                    value={`did:veda:solana:${shortId}...`}
                    title={`did:veda:solana:${rawId}`}
                    truncate
                />
                <CredentialRow label="Assigned Vault Node" value="Vault Cluster #12 - Ireland" />
                <CredentialRow
                    label="Public Signature Key"
                    value={`VedaPub_${shortId}...6c5e`}
                    title={`VedaPub_${rawId}`}
                    truncate
                />
                <CredentialRow label="Recovery Phrase Configured" value="Yes (12 Words)" />
            </div>
        </div>
    );
}

interface PublicProfileExplorerCardProps {
    currentUserId?: string;
    searchId: string;
    setSearchId: (val: string) => void;
    publicProfile: PublicProfile | null;
    isSearching: boolean;
    error: string | null;
    onSearch: (overrideId?: string) => Promise<void>;
    onClear: () => void;
}

export function PublicProfileExplorerCard({
    currentUserId,
    searchId,
    setSearchId,
    publicProfile,
    isSearching,
    error,
    onSearch,
    onClear,
}: PublicProfileExplorerCardProps) {
    const handlePasteMyId = () => {
        if (!currentUserId) return;
        setSearchId(currentUserId);
        onSearch(currentUserId);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                    <h2 className="text-lg font-bold text-[#1a172c]">Public Profile Explorer</h2>
                    <p className="text-xs text-gray-400 font-medium">
                        Search and verify any public decentralized profile on the Veda network
                    </p>
                </div>
                {currentUserId && (
                    <button
                        type="button"
                        onClick={handlePasteMyId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f2ff] hover:bg-[#eae6fe] text-[#5a4fcf] text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                        title="Search using your current user ID"
                    >
                        <CopyIcon className="w-3 h-3" />
                        Use My ID
                    </button>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearch();
                }}
                className="flex gap-2 mb-4"
            >
                <div className="relative flex-1">
                    <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                        type="text"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="Enter User ID (UUID)..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#5a4fcf]/20 focus:border-[#5a4fcf] transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSearching || !searchId.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5a4fcf] hover:bg-[#4a3fb8] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                >
                    {isSearching ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Fetching…
                        </>
                    ) : (
                        "Inspect Profile"
                    )}
                </button>
            </form>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
                    {error}
                </div>
            )}

            {publicProfile && (
                <div className="p-5 bg-gradient-to-br from-[#fafbfc] to-[#f4f2ff]/30 rounded-xl border border-indigo-100/60 animate-fade-in relative">
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                        title="Dismiss result"
                    >
                        <CloseIcon className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-[#5a4fcf] flex items-center justify-center bg-white overflow-hidden shadow-sm shrink-0">
                            {publicProfile.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={publicProfile.avatar_url}
                                    alt={publicProfile.full_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                <span className="text-xl font-bold text-[#5a4fcf]">
                                    {(publicProfile.full_name || "U").charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-[#1a172c] truncate">
                                    {publicProfile.full_name || "Anonymous User"}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#5a4fcf] border border-indigo-100">
                                    Public Identity
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                @{publicProfile.username || "no-username"}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5" title={publicProfile.id}>
                                ID: {publicProfile.id}
                            </p>
                        </div>

                        <Link
                            href={`/profile/${publicProfile.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors shadow-xs shrink-0"
                            title="Open dedicated public profile page"
                        >
                            <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-500" />
                            View Public Page
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
