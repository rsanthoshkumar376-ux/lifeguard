// In-app Update Management Service for LifeGuard PWA & Web
export interface VersionInfo {
  version: string;
  buildTime: number;
  releaseDate: string;
  changelog: string[];
}

const LOCAL_VERSION_KEY = 'lifeguard_app_version';
const LOCAL_BUILD_TIME_KEY = 'lifeguard_app_build_time';
export const CURRENT_APP_VERSION = '1.3.1';

type UpdateCallback = (info: { hasUpdate: boolean; newVersion?: string; changelog?: string[] }) => void;
const listeners = new Set<UpdateCallback>();

let latestRemoteInfo: VersionInfo | null = null;
let updateAvailable = false;

export const subscribeToUpdates = (callback: UpdateCallback) => {
  listeners.add(callback);
  if (updateAvailable && latestRemoteInfo) {
    callback({
      hasUpdate: true,
      newVersion: latestRemoteInfo.version,
      changelog: latestRemoteInfo.changelog
    });
  }
  return () => {
    listeners.delete(callback);
  };
};

const notifyListeners = (hasUpdate: boolean, newVersion?: string, changelog?: string[]) => {
  updateAvailable = hasUpdate;
  listeners.forEach(cb => cb({ hasUpdate, newVersion, changelog }));
};

export const checkForAppUpdate = async (): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  changelog: string[];
}> => {
  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res.ok) {
      const data: VersionInfo = await res.json();
      latestRemoteInfo = data;

      const savedBuildTime = localStorage.getItem(LOCAL_BUILD_TIME_KEY);
      const savedVersion = localStorage.getItem(LOCAL_VERSION_KEY) || CURRENT_APP_VERSION;

      // If remote build time is newer, or version is different
      const isNewer = (savedBuildTime && data.buildTime > parseInt(savedBuildTime, 10)) || 
                      (data.version !== CURRENT_APP_VERSION && data.version !== savedVersion);

      if (isNewer) {
        notifyListeners(true, data.version, data.changelog);
        return {
          hasUpdate: true,
          currentVersion: CURRENT_APP_VERSION,
          latestVersion: data.version,
          changelog: data.changelog || []
        };
      }
    }
  } catch (err) {
    console.warn('Update check network skipped:', err);
  }

  // Also check if any service worker is waiting
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        if (registration.waiting) {
          notifyListeners(true, latestRemoteInfo?.version || 'Latest', latestRemoteInfo?.changelog);
          return {
            hasUpdate: true,
            currentVersion: CURRENT_APP_VERSION,
            latestVersion: latestRemoteInfo?.version || 'Latest',
            changelog: latestRemoteInfo?.changelog || []
          };
        }
      }
    } catch (e) {
      // ignore
    }
  }

  notifyListeners(false);
  return {
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    latestVersion: CURRENT_APP_VERSION,
    changelog: []
  };
};

export const triggerAppUpdate = async () => {
  // Save current remote version as confirmed
  if (latestRemoteInfo) {
    localStorage.setItem(LOCAL_VERSION_KEY, latestRemoteInfo.version);
    localStorage.setItem(LOCAL_BUILD_TIME_KEY, String(latestRemoteInfo.buildTime));
  } else {
    localStorage.setItem(LOCAL_VERSION_KEY, CURRENT_APP_VERSION);
    localStorage.setItem(LOCAL_BUILD_TIME_KEY, String(Date.now()));
  }

  // Signal waiting service workers to activate immediately
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Clear HTTP/PWA caches and reload
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch {}
  }

  // Hard reload
  window.location.reload();
};

// Initialize periodic check
if (typeof window !== 'undefined') {
  // Store initial baseline if not present
  if (!localStorage.getItem(LOCAL_VERSION_KEY)) {
    localStorage.setItem(LOCAL_VERSION_KEY, '1.1.0');
    localStorage.setItem(LOCAL_BUILD_TIME_KEY, '1727515800000');
  }

  // Check quickly after load
  setTimeout(() => {
    checkForAppUpdate();
  }, 1000);

  // Check when user returns to app/tab
  window.addEventListener('focus', () => {
    checkForAppUpdate();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForAppUpdate();
    }
  });
}
