const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUBSCRIPTIONS_FILE = path.join(__dirname, '../data/push_subscriptions.json');

function getSubscriptions() {
  if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf8'));
}
function saveSubscriptions(subs) {
  fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
}

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

webpush.setVapidDetails(
  `mailto:${ADMIN_EMAIL}`,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

module.exports = {
  VAPID_PUBLIC_KEY,
  subscribe: (subscription) => {
    const subs = getSubscriptions();
    if (!subs.find(s => s.endpoint === subscription.endpoint)) {
      subs.push(subscription);
      saveSubscriptions(subs);
    }
  },
  notifyAll: (payload) => {
    const subs = getSubscriptions();
    subs.forEach(sub => {
      webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
        console.error(`Error sending notification to ${sub.endpoint}:`, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Subscription for ${sub.endpoint} is invalid. Removing.`);
          const newSubs = getSubscriptions().filter(s => s.endpoint !== sub.endpoint);
          saveSubscriptions(newSubs);
        }
      });
    });
  }
};
