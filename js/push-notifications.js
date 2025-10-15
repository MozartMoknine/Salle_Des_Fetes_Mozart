class PushNotificationManager {
  constructor() {
    this.supabaseUrl = 'https://qyskiegopptbugbbxbtp.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5c2tpZWdvcHB0YnVnYmJ4YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTM4MDYsImV4cCI6MjA3MzAyOTgwNn0.HbAJ3nJIeJShOv3huwkWZuUeKadVQfnXX_ow0zoKEeg';
    this.vapidPublicKey = null;
    this.registration = null;
  }

  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
  scope: '/'

      });
      console.log('Service Worker registered:', this.registration);

      await navigator.serviceWorker.ready;
      console.log('Service Worker ready');

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  setVapidPublicKey(key) {
    this.vapidPublicKey = key;
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission === 'granted';
  }

  async subscribe() {
    if (!this.vapidPublicKey) {
      throw new Error('VAPID public key not set. Call setVapidPublicKey() first.');
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered. Call initialize() first.');
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }

    try {
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async saveSubscription(subscription, userId = null) {
    const subscriptionJson = subscription.toJSON();

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save subscription:', errorText);
        throw new Error(`Failed to save subscription: ${response.status}`);
      }

      console.log('Subscription saved to database');
      return true;
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        const subscriptionJson = subscription.toJSON();

        await fetch(`${this.supabaseUrl}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(subscriptionJson.endpoint)}`, {
          method: 'DELETE',
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`
          }
        });

        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  async getSubscription() {
    if (!this.registration) {
      return null;
    }
    return await this.registration.pushManager.getSubscription();
  }

  async isSubscribed() {
    const subscription = await this.getSubscription();
    return subscription !== null;
  }

  getNotificationPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  async setupPushNotifications(vapidPublicKey, userId = null) {
    this.setVapidPublicKey(vapidPublicKey);

    const initialized = await this.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize push notifications');
    }

    const subscription = await this.subscribe();
    await this.saveSubscription(subscription, userId);

    return subscription;
  }
}

if (typeof window !== 'undefined') {
  window.PushNotificationManager = PushNotificationManager;
}

export default PushNotificationManager;
