export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    redirectUrl?: string;
}

class NotificationManager {
    private swRegistration: ServiceWorkerRegistration | null = null;

    // Inisialisasi Service Worker
    async initialize(): Promise<boolean> {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
            console.warn('Service Worker atau Notifications tidak didukung di browser ini');
            return false;
        }

        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('Service Worker registered successfully:', this.swRegistration);

            // Tunggu hingga service worker aktif
            await navigator.serviceWorker.ready;

            return true;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return false;
        }
    }

    // Request permission untuk notifikasi
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('Notifications tidak didukung');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission;
        }

        return Notification.permission;
    }

    // Cek apakah notifikasi sudah diizinkan
    isPermissionGranted(): boolean {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    // Kirim notifikasi
    async sendNotification(options: NotificationOptions): Promise<void> {
        let permission = Notification.permission;
        console.log("Current notification permission state:", permission);

        if (permission === 'default') {
            permission = await this.requestPermission();
            console.log("Notification permission state after request:", permission);
        }

        if (permission !== 'granted') {
            console.warn('Permission untuk notifikasi belum diberikan. Status:', permission);
            alert(`Izin notifikasi diblokir browser (Status: ${permission}). Silakan klik ikon gembok di sebelah kiri URL browser Anda dan ubah izin Notifikasi menjadi 'Izinkan' (Allow).`);
            return;
        }

        if (!this.swRegistration) {
            console.log("Service Worker registration is null, initializing...");
            await this.initialize();
        }

        try {
            const notificationOptions: NotificationOptions & { data?: { url: string } } = {
                title: options.title,
                body: options.body,
                icon: options.icon || '/icon-192x192.png',
                badge: options.badge || '/icon-72x72.png',
                data: {
                    url: options.redirectUrl || window.location.pathname
                }
            };

            console.log("Showing notification with options:", notificationOptions);

            if (this.swRegistration) {
                await this.swRegistration.showNotification(options.title, notificationOptions);
                console.log("Notification sent successfully via Service Worker.");
            } else {
                console.warn("Service Worker not available, falling back to window.Notification");
                new Notification(options.title, notificationOptions);
            }
        } catch (error) {
            console.error('Error mengirim notifikasi via Service Worker:', error);
            try {
                console.log("Attempting fallback to standard window.Notification");
                new Notification(options.title, {
                    body: options.body,
                    icon: options.icon || '/icon-192x192.png'
                });
            } catch (err) {
                console.error('Fallback window.Notification juga gagal:', err);
            }
        }
    }

    // Helper untuk unregister service worker (untuk development/debugging)
    async unregister(): Promise<boolean> {
        if (!this.swRegistration) {
            return false;
        }

        try {
            const result = await this.swRegistration.unregister();
            this.swRegistration = null;
            return result;
        } catch (error) {
            console.error('Error unregistering service worker:', error);
            return false;
        }
    }
}

// Export singleton instance
export const notificationManager = new NotificationManager();        