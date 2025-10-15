function createPushNotificationUI() {
  const existingUI = document.getElementById('push-notification-ui');
  if (existingUI) {
    return;
  }

  const uiContainer = document.createElement('div');
  uiContainer.id = 'push-notification-ui';
  uiContainer.innerHTML = `
    <style>
      #push-notification-banner {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
        color: #000;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-width: 320px;
        animation: slideInUp 0.3s ease-out;
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      #push-notification-banner.hidden {
        display: none;
      }

      .push-banner-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .push-banner-text {
        display: flex;
        align-items: start;
        gap: 10px;
      }

      .push-banner-text i {
        font-size: 24px;
        margin-top: 2px;
      }

      .push-banner-title {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .push-banner-description {
        font-size: 13px;
        opacity: 0.9;
        line-height: 1.4;
      }

      .push-banner-buttons {
        display: flex;
        gap: 8px;
      }

      .push-btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .push-btn-primary {
        background: #000;
        color: #FFD700;
      }

      .push-btn-primary:hover {
        background: #222;
        transform: translateY(-1px);
      }

      .push-btn-secondary {
        background: rgba(0, 0, 0, 0.1);
        color: #000;
      }

      .push-btn-secondary:hover {
        background: rgba(0, 0, 0, 0.2);
      }

      .push-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      #push-status-indicator {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #fff;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 999;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      #push-status-indicator:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      #push-status-indicator.hidden {
        display: none;
      }

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .status-dot.active {
        background: #10b981;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
      }

      .status-dot.inactive {
        background: #ef4444;
      }

      @media (max-width: 640px) {
        #push-notification-banner {
          bottom: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        #push-status-indicator {
          top: 70px;
          right: 10px;
        }
      }
    </style>

    <div id="push-notification-banner" class="hidden">
      <div class="push-banner-content">
        <div class="push-banner-text">
          <i class="fas fa-bell"></i>
          <div>
            <div class="push-banner-title">Activer les notifications</div>
            <div class="push-banner-description">
              Recevez des alertes pour les réservations du jour
            </div>
          </div>
        </div>
        <div class="push-banner-buttons">
          <button id="enable-push-btn" class="push-btn push-btn-primary">
            Activer
          </button>
          <button id="dismiss-push-btn" class="push-btn push-btn-secondary">
            Plus tard
          </button>
        </div>
      </div>
    </div>

    <div id="push-status-indicator" class="hidden">
      <span class="status-dot"></span>
      <span id="push-status-text">Notifications</span>
    </div>
  `;

  document.body.appendChild(uiContainer);

  const banner = document.getElementById('push-notification-banner');
  const statusIndicator = document.getElementById('push-status-indicator');
  const enableBtn = document.getElementById('enable-push-btn');
  const dismissBtn = document.getElementById('dismiss-push-btn');
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = document.getElementById('push-status-text');

  async function updatePushStatus() {
    if (!window.pushManager) {
      return;
    }

    const isSubscribed = await window.pushManager.isSubscribed();
    const permission = window.pushManager.getNotificationPermission();

    if (isSubscribed) {
      statusIndicator.classList.remove('hidden');
      statusDot.classList.add('active');
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Notifications activées';
      banner.classList.add('hidden');
    } else if (permission === 'denied') {
      statusIndicator.classList.remove('hidden');
      statusDot.classList.remove('active');
      statusDot.classList.add('inactive');
      statusText.textContent = 'Notifications bloquées';
      banner.classList.add('hidden');
    } else if (permission === 'default') {
      const dismissed = localStorage.getItem('push-banner-dismissed');
      if (!dismissed) {
        banner.classList.remove('hidden');
      }
      statusIndicator.classList.add('hidden');
    } else {
      statusIndicator.classList.add('hidden');
    }
  }

  enableBtn.addEventListener('click', async () => {
    enableBtn.disabled = true;
    enableBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Activation...';

    try {
      if (!window.pushManager) {
        throw new Error('Push manager not initialized');
      }

      const vapidPublicKey = 'BFJ4V6z0yS2YmxySa4wpbF5rUd1gg3cKGXfCNfT49eP116D9SugDazkfRMiDfDK0l-hmzvS8suFBwfPq490tfQE'; // Replace with your real VAPID public key


      await window.pushManager.setupPushNotifications(vapidPublicKey);

      banner.classList.add('hidden');
      await updatePushStatus();

      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
      `;
      successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Notifications activées avec succès!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.remove();
      }, 3000);

    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      alert('Erreur lors de l\'activation des notifications. Veuillez réessayer.');
      enableBtn.disabled = false;
      enableBtn.textContent = 'Activer';
    }
  });

  dismissBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem('push-banner-dismissed', 'true');
  });

  statusIndicator.addEventListener('click', async () => {
    if (!window.pushManager) {
      return;
    }

    const isSubscribed = await window.pushManager.isSubscribed();
    const permission = window.pushManager.getNotificationPermission();

    if (isSubscribed) {
      if (confirm('Voulez-vous désactiver les notifications?')) {
        await window.pushManager.unsubscribe();
        await updatePushStatus();
        localStorage.removeItem('push-banner-dismissed');
      }
    } else if (permission === 'denied') {
      alert('Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.');
    } else {
      banner.classList.remove('hidden');
      localStorage.removeItem('push-banner-dismissed');
    }
  });

  updatePushStatus();

  if (window.pushManager) {
    setInterval(updatePushStatus, 5000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createPushNotificationUI);
} else {
  createPushNotificationUI();
}
