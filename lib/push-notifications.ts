// lib/push-notifications.ts
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export async function initPushNotifications(sessionToken: string) {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Push] Not a native platform, skipping');
    return;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.log('[Push] Permission not granted');
      return;
    }

    await PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] Token received:', token.value);
      await registerDeviceToken(token.value, sessionToken);
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Registration error:', err.error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Received:', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Push] Action:', notification);
      const agentId = notification.notification.data?.agentId;
      if (agentId) {
        window.location.href = `/agents/${agentId}`;
      }
    });

    await PushNotifications.register();
    console.log('[Push] Registration initiated');
  } catch (error) {
    console.error('[Push] Init error:', error);
  }
}

async function registerDeviceToken(token: string, sessionToken: string) {
  try {
    const platform = Capacitor.getPlatform();
    const res = await fetch('/api/push/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ token, platform }),
    });
    if (!res.ok) {
      console.error('[Push] Token registration failed:', await res.json());
      return;
    }
    console.log('[Push] Token registered successfully');
  } catch (error) {
    console.error('[Push] Token registration error:', error);
  }
}

export async function unregisterPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await PushNotifications.unregister();
  } catch (error) {
    console.error('[Push] Unregister error:', error);
  }
}