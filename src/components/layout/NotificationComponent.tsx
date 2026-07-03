"use client";

import { useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { notificationManager, NotificationOptions } from "@/lib/notificationManager";

interface NotificationContextType {
    sendNotification: (options: NotificationOptions) => Promise<void>;
    requestPermission: () => Promise<NotificationPermission>;
    isPermissionGranted: () => boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {

    // Inisialisasi Service Worker saat provider dimuat
    useEffect(() => {
        const initServiceWorker = async () => {
            try {
                const initialized = await notificationManager.initialize();
                if (initialized) {
                    console.log("Service Worker berhasil diinisialisasi.");
                    // Minta permission jika statusnya default (belum pernah ditanya)
                    if ('Notification' in window && Notification.permission === 'default') {
                        await notificationManager.requestPermission();
                    }
                }
            } catch (error) {
                console.error("Gagal menginisialisasi Service Worker:", error);
            }
        };

        initServiceWorker();
    }, []);

    // Menggunakan useCallback agar fungsi tidak berubah-ubah setiap render
    const sendNotification = useCallback(async (options: NotificationOptions) => {
        await notificationManager.sendNotification(options);
    }, []);

    const requestPermission = useCallback(async () => {
        return await notificationManager.requestPermission();
    }, []);

    const isPermissionGranted = useCallback(() => {
        return notificationManager.isPermissionGranted();
    }, []);

    const contextValue: NotificationContextType = {
        sendNotification,
        requestPermission,
        isPermissionGranted,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}

// Custom hook untuk akses notifikasi dengan proteksi context
export function useNotification() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotification harus digunakan di dalam NotificationProvider");
    }

    return context;
}