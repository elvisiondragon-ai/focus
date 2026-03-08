/**
 * iOS Cache Cleaner - Comprehensive cache clearing for iOS PWA
 * Handles iOS-specific cache layers that regular SW clearing misses
 */

export interface CacheCleaningResult {
    success: boolean;
    clearedCaches: string[];
    errors: string[];
    isIOS: boolean;
}

class IOSCacheCleaner {
    private isIOS(): boolean {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    async clearAllCaches(): Promise<CacheCleaningResult> {
        const result: CacheCleaningResult = {
            success: true,
            clearedCaches: [],
            errors: [],
            isIOS: this.isIOS()
        };

        try {
            if ('serviceWorker' in navigator) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                result.clearedCaches.push(`SW Caches: ${cacheNames.length} caches`);
            }
        } catch (error) {
            result.errors.push('SW cache clearing failed');
        }

        try {
            const authKeys = Object.keys(localStorage).filter(key =>
                key.startsWith('sb-') ||
                key.includes('auth') ||
                key.includes('session') ||
                key.includes('supabase') ||
                key.includes('token') ||
                key.match(/^supabase\.auth\./)
            );

            const keysToDelete = Object.keys(localStorage).filter(key =>
                !authKeys.includes(key) &&
                !key.includes('update-') &&
                !key.includes('recovery')
            );

            keysToDelete.forEach(key => localStorage.removeItem(key));
            result.clearedCaches.push(`localStorage: ${keysToDelete.length} items`);
        } catch (error) {
            result.errors.push('localStorage cleaning failed');
        }

        try {
            sessionStorage.clear();
            result.clearedCaches.push('sessionStorage: all items');
        } catch (error) {
            result.errors.push('sessionStorage clearing failed');
        }

        if (this.isIOS()) {
            try {
                if ('indexedDB' in window) {
                    const dbsToDelete = ['supabase-auth-token', 'workbox-expiration'];
                    for (const dbName of dbsToDelete) {
                        try {
                            await new Promise<void>((resolve) => {
                                const deleteReq = indexedDB.deleteDatabase(dbName);
                                deleteReq.onsuccess = () => resolve();
                                deleteReq.onerror = () => resolve();
                                deleteReq.onblocked = () => setTimeout(() => resolve(), 1000);
                            });
                        } catch (e) {}
                    }
                    result.clearedCaches.push('IndexedDB: auth & cache DBs');
                }
            } catch (error) {
                result.errors.push('IndexedDB clearing failed');
            }
        }

        result.success = result.errors.length === 0;
        return result;
    }

    async quickLoginCacheClear(): Promise<boolean> {
        try {
            const emailInputs = document.querySelectorAll('input[type="email"], input[name="email"]');
            const passwordInputs = document.querySelectorAll('input[type="password"], input[name="password"]');

            [...emailInputs, ...passwordInputs].forEach(input => {
                (input as HTMLInputElement).value = '';
                (input as HTMLInputElement).autocomplete = 'off';
                (input as HTMLInputElement).setAttribute('autocomplete', 'new-password');
                (input as HTMLInputElement).focus();
                (input as HTMLInputElement).blur();
            });

            const loginKeys = Object.keys(localStorage).filter(key =>
                key.includes('login') || key.includes('form') || key.includes('input')
            );
            loginKeys.forEach(key => localStorage.removeItem(key));

            return true;
        } catch (error) {
            return false;
        }
    }

    async forceCleanReload(): Promise<void> {
        await this.clearAllCaches();
        localStorage.setItem('ios-force-reload-completed', 'true');
        localStorage.setItem('ios-clean-reload-timestamp', Date.now().toString());
        const url = new URL(window.location.href);
        url.searchParams.set('ios_cache_bust', Date.now().toString());
        window.location.replace(url.toString());
    }

    async verifyCleanState(): Promise<boolean> {
        if (!this.isIOS()) return true;
        const cleanReloadFlag = localStorage.getItem('ios-force-reload-completed');
        if (cleanReloadFlag === 'true') {
            localStorage.removeItem('ios-force-reload-completed');
            await this.quickLoginCacheClear();
            return true;
        }
        return false;
    }
}

export const iOSCacheCleaner = new IOSCacheCleaner();
if (typeof window !== 'undefined') {
    setTimeout(() => {
        iOSCacheCleaner.verifyCleanState();
    }, 1000);
}
