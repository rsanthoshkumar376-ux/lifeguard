// Firebase Cloud Messaging Service Worker
// Handles push notifications when the app is in the background

/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

// Firebase config will be injected during build or set via environment
// For now, use placeholder values — replace with your actual config
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const notificationData = payload.data || {};
  const notification = payload.notification || {};

  let title = notification.title || '🩸 LifeGuard Notification';
  let body = notification.body || 'You have a new notification.';
  let icon = '/icons/icon-192.png';
  let badge = '/icons/icon-192.png';
  let tag = 'lifeguard-notification';
  let actions = [];
  let vibrate = [200, 100, 200];
  let requireInteraction = false;

  // Customize based on notification type
  switch (notificationData.type) {
    case 'BLOOD_REQUEST':
      tag = `blood-request-${notificationData.requestId}`;
      actions = [
        { action: 'donate', title: '✅ I CAN DONATE' },
        { action: 'unavailable', title: '❌ NOT AVAILABLE' },
      ];
      vibrate = [200, 100, 200, 100, 200];
      requireInteraction = true;

      if (notificationData.urgency === 'critical') {
        vibrate = [300, 100, 300, 100, 300, 100, 300];
      }
      break;

    case 'SOS_ALERT':
      tag = `sos-${notificationData.userId}`;
      title = `🚨 EMERGENCY: ${notificationData.userName} needs help!`;
      actions = [
        { action: 'view', title: '👁️ VIEW DETAILS' },
        { action: 'call', title: '📞 CALL NOW' },
      ];
      vibrate = [300, 100, 300, 100, 300, 100, 300];
      requireInteraction = true;
      break;

    case 'DONOR_RESPONSE':
      tag = `donor-response-${notificationData.requestId}`;
      break;

    default:
      break;
  }

  const options = {
    body,
    icon,
    badge,
    tag,
    vibrate,
    requireInteraction,
    actions,
    data: notificationData,
    renotify: true,
  };

  self.registration.showNotification(title, options);
});

// Handle notification click actions
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  let targetUrl = '/';

  switch (data.type) {
    case 'BLOOD_REQUEST':
      if (action === 'donate') {
        targetUrl = `/blood/requests/${data.requestId}?action=donate`;
      } else if (action === 'unavailable') {
        // Just close the notification
        return;
      } else {
        targetUrl = `/blood/requests/${data.requestId}`;
      }
      break;

    case 'SOS_ALERT':
      if (action === 'call' && data.contactPhone) {
        // Open phone dialer
        event.waitUntil(clients.openWindow(`tel:${data.contactPhone}`));
        return;
      }
      targetUrl = `/emergency/sos?alertId=${data.alertId}`;
      break;

    case 'EMERGENCY_PIN':
      targetUrl = data.url || '/emergency/id';
      break;

    default:
      targetUrl = data.url || '/';
      break;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
