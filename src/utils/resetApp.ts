/**
 * Utility to completely reset the application
 * Wipes all stored state, requests, donations, chat logs, user sessions,
 * caches, and service workers to restore factory state.
 */
export const performFullAppReset = async () => {
  try {
    // 1. Clear all localStorage keys
    localStorage.clear();

    // 2. Clear all sessionStorage keys
    sessionStorage.clear();

    // 3. Clear CacheStorage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // 4. Unregister Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
  } catch (err) {
    console.warn('Error during full app reset:', err);
  }

  // 5. Force reload to home page
  window.location.href = '/';
};
