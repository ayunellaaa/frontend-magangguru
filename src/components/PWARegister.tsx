"use client";

import { useEffect } from "react";

export default function PWARegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered:', registration);

                    // Check for update periodically
                    setInterval(() => {
                        registration.update().catch((error) => {
                            console.debug('Failed to check Service Worker update (normal when server restarts):', error);
                        });
                    }, 60000); // Check every 1 minute
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }, []);
    return null;
}