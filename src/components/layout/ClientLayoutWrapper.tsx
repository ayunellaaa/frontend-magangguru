"use client";
import { NotificationProvider } from "./NotificationComponent";
import PWARegister from "../PWARegister";
import PWAInstallButton from "../PWAButton";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <PWARegister />
            <div className="fixed bottom-4 right-4 z-50">
                <PWAInstallButton />
            </div>
            {children}
        </NotificationProvider>
    );
}