// Service to trigger persistent Lock Screen notifications for Emergency Medical ID & QR Code

export interface EmergencyNotificationData {
  name: string;
  bloodGroup: string;
  emergencyInstructions?: string;
  pandemicNote?: string;
  primaryContact?: string;
}

export const pinEmergencyToLockScreen = async (data: EmergencyNotificationData): Promise<{ success: boolean; message: string }> => {
  if (!('Notification' in window)) {
    return {
      success: false,
      message: 'Notifications are not supported by this browser.'
    };
  }

  try {
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return {
        success: false,
        message: 'Notification permission was denied. Please allow notifications in browser settings.'
      };
    }

    const title = `🚨 EMERGENCY MEDICAL ID: ${data.bloodGroup || 'Blood Info'} - ${data.name || 'User'}`;
    const bodyText = `Tap to view Medical QR Code, Allergies & Emergency Contacts. ${data.pandemicNote ? '⚠️ Precaution note attached.' : ''}`;

    const notificationOptions: any = {
      body: bodyText,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'lifeguard-lockscreen-emergency',
      requireInteraction: true, // Key property: forces notification to stay on lock screen until dismissed
      silent: false,
      renotify: true,
      data: {
        type: 'EMERGENCY_PIN',
        url: window.location.origin + '/emergency/id'
      }
    };

    // If service worker registration is active, use it for true background/lock-screen integration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, notificationOptions);
          return {
            success: true,
            message: '🚨 Emergency card pinned! It is now visible on your phone lock screen.'
          };
        }
      } catch (swErr) {
        console.warn('Service worker notification failed, falling back to Notification API', swErr);
      }
    }

    // Direct Notification fallback
    new Notification(title, notificationOptions);
    return {
      success: true,
      message: '🚨 Emergency card pinned! It is now visible on your phone lock screen.'
    };

  } catch (error: any) {
    console.error('Error displaying lock screen notification:', error);
    return {
      success: false,
      message: error?.message || 'Could not display lock screen notification.'
    };
  }
};
