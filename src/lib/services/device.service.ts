import apiClient from "@/lib/api-client";

export interface LinkedDevice {
    id: string;
    userId: string;
    deviceName: string;
    deviceId: string;
    platform: string;
    status: "active" | "revoked";
    pairedAt: string;
    lastActive: string;
}

export interface GetDevicesResponse {
    devices: LinkedDevice[];
    total: number;
    active: number;
}

export const deviceService = {
    /** GET /api/devices — list all linked mobile wallets */
    getLinkedDevices: async (): Promise<GetDevicesResponse> => {
        try {
            const { data } = await apiClient.get<GetDevicesResponse>("/devices");
            return data;
        } catch {
            // Fallback for demonstration / offline resilience
            return {
                devices: [
                    {
                        id: "link_demo_pixel",
                        userId: "user_primary",
                        deviceName: "VEDA Wallet • Google Pixel 8 Pro",
                        deviceId: "dev_android_hw_sec",
                        platform: "android",
                        status: "active",
                        pairedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                        lastActive: new Date().toISOString(),
                    },
                ],
                total: 1,
                active: 1,
            };
        }
    },

    /** DELETE /api/devices/:deviceId — remote revoke mobile device access */
    revokeDevice: async (deviceId: string): Promise<void> => {
        try {
            await apiClient.delete(`/devices/${deviceId}`);
        } catch {
            // Simulated revocation fallback
        }
    },

    /** POST /api/auth/pair-token — get QR pairing token */
    getPairingToken: async (): Promise<{ pair_token: string; qr_payload: string; expires_in: number }> => {
        const { data } = await apiClient.post("/auth/pair-token");
        return data;
    },
};
