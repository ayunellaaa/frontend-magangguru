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
        if (permission === 'default') {
            permission = await this.requestPermission();
        }

        if (permission !== 'granted') {
            console.warn('Permission untuk notifikasi belum diberikan');
            return;
        }

        if (!this.swRegistration) {
            await this.initialize();
        }

        if (!this.swRegistration) {
            console.error('Service Worker tidak tersedia');
            return;
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

            await this.swRegistration.showNotification(options.title, notificationOptions);
        } catch (error) {
            console.error('Error mengirim notifikasi:', error);
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