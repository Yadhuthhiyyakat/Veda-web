import DashSidebar from "../components/dash-sidebar";
import DashHeader from "../components/dash-header";
import { DocumentUploadForm } from "./_components/upload-form";
import React, { Suspense } from "react";

export const metadata = {
    title: "Upload & Encrypt Document - VEDA",
    description: "Upload and securely encrypt documents on VEDA.",
};

export default function DocumentUploadPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans">
            <DashHeader />
            <div className="flex flex-1 overflow-hidden">
                <DashSidebar page="document-upload" />
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-[#1a172c] mb-1">Upload & Issue Document</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Securely upload encrypted files or create structured digital credentials
                        </p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="py-12 text-center text-sm text-gray-400">
                                Loading upload form…
                            </div>
                        }
                    >
                        <DocumentUploadForm />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
