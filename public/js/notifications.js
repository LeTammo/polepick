function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      let permission;
      permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const res = await fetch('/api/push/vapid-key');
      const { publicKey } = await res.json();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
    } catch (err) {
      console.error('Push registration failed:', err);
    }
  });
}

function setupPredictionNotificationButtons() {
  document.querySelectorAll('.send-prediction-notification').forEach(btn => {
    btn.addEventListener('click', async () => {
      const raceId = btn.getAttribute('data-race-id');
      await fetch('/admin/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raceId })
      });
      alert('Notification sent to all users!');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPredictionNotificationButtons);
} else {
  setupPredictionNotificationButtons();
}
