const pushService = require('../../services/pushService');
const raceModel = require("../../models/race");

exports.getVapidKey = (req, res) => {
  res.json({ publicKey: pushService.VAPID_PUBLIC_KEY });
};

exports.subscribe = (req, res) => {
  pushService.subscribe(req.body);
  res.status(201).json({});
};

exports.sendNotification = (req, res) => {
  const { raceId } = req.body;
  const race = raceModel.getRaceById(raceId);
  const payload = {
    title: 'Prediction Time!',
    body: `You can now submit your predictions for the ${race.name}.`,
    data: `/race/${raceId}`
  };
  pushService.notifyAll(payload);
  res.status(200).json({ message: 'Notification sent to all subscribers.' });
};