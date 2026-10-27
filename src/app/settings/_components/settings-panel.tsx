"use client";

import React from "react";
import { useSettings } from "../_hooks/use-settings";
import { TrashIcon, CloseIcon, AlertTriangleIcon } from "@/lib/icons";

interface SettingRowProps {
    label: string;
    description: string;
    children?: React.ReactNode;
}

export function SettingRow({ label, description, children }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

export function SettingsPanel() {
    const {
        emailNotifications,
        setEmailNotifications,
        twoFactorEnabled,
        setTwoFactorEnabled,
        user,
        isDeleteModalOpen,
        openDeleteModal,
        closeDeleteModal,
        confirmText,
        setConfirmText,
        isDeleting,
        deleteError,
        deleteSuccess,
        handleDeleteAccount,
    } = useSettings();

    const isDeleteConfirmed = confirmText.trim() === "DELETE";

    return (
        <div className="space-y-8 max-w-4xl">
            {/* General Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-lg font-bold text-[#1a172c] mb-6">General Settings</h2>
                <div>
                    <SettingRow
                        label="Email Notifications"
                        description="Receive alerts for document expiry and sharing"
                    >
                        <button
                            type="button"
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                emailNotifications ? "bg-[#5a4fcf]" : "bg-gray-200"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                    emailNotifications ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </SettingRow>

                    <SettingRow
                        label="Two-Factor Authentication"
                        description="Add an extra layer of security to your account"
                    >
                        <button
                            type="button"
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                twoFactorEnabled
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    : "bg-[#5a4fcf] text-white hover:bg-[#4a3fb8]"
                            }`}
                        >
                            {twoFactorEnabled ? "Enabled" : "Enable"}
                        </button>
                    </SettingRow>

                    <SettingRow
                        label="Data Export"
                        description="Download all your document records and cryptographic metadata"
                    >
                        <button
                            type="button"
                            className="px-4 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Export
                        </button>
                    </SettingRow>

                    <SettingRow
                        label="Veda Mobile Wallet Authorization"
                        description="Authorize your Veda Mobile Wallet & Verifier App to access credentials from this Cloud Locker"
                    >
                        <a
                            href="/dashboard"
                            className="px-4 py-1.5 text-xs font-semibold bg-[#5a4fcf] text-white rounded-lg hover:bg-[#4a3fb8] transition-colors inline-block"
                        >
                            Authorize Wallet
                        </a>
                    </SettingRow>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-8 relative overflow-hidden">
                <div className="flex items-center gap-2.5 mb-2">
                    <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                        <AlertTriangleIcon className="w-4 h-4" />
                    </span>
                    <h2 className="text-lg font-bold text-rose-900">Danger Zone</h2>
                </div>
                <p className="text-xs text-rose-600/90 font-medium mb-6">
                    Irreversible actions that permanently impact your account and cryptographic data.
                </p>

                <div className="pt-2 border-t border-rose-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Delete Account</p>
                            <p className="text-xs text-gray-500 max-w-xl mt-0.5">
                                Permanently delete your account, encrypted documents, encryption keys, and identity proofs. Once deleted, this data cannot be recovered.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openDeleteModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer shrink-0"
                        >
                            <TrashIcon className="w-4 h-4 text-rose-600" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                    <AlertTriangleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#1a172c]">Delete Account</h2>
                                    <p className="text-xs text-rose-500 font-medium">This action is permanent and irreversible</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 leading-relaxed">
                                <p className="font-semibold mb-1">Warning: This action is permanent and cannot be undone.</p>
                                <p>
                                    All your documents, decentralized identities, verified credentials, and cryptographic vault associations
                                    {user?.email ? ` for (${user.email})` : ""} will be permanently deleted from the Veda system.
                                </p>
                            </div>

                            {deleteError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                                    <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{deleteError}</span>
                                </div>
                            )}

                            {deleteSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                                    {deleteSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Type <span className="text-rose-600 font-extrabold select-all">DELETE</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    disabled={isDeleting || !!deleteSuccess}
                                    autoFocus
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={!isDeleteConfirmed || isDeleting || !!deleteSuccess}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-rose-200 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Deleting Account…
                                        </>
                                    ) : (
                                        <>
                                            <TrashIcon className="w-3.5 h-3.5" />
                                            Permanently Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
