const express = require("express");
const homeController = require('../controllers/user/home');
const leaderboardController = require('../controllers/user/leaderboard');
const raceController = require('../controllers/user/race');
const raceModel = require('../models/race');
const pushService = require('../services/pushService');
const {log} = require("../utils");

const router = express.Router();

router.get('/', homeController.getHomePage);
router.get('/next', homeController.getNextRace);
router.get('/leaderboard', leaderboardController.getLeaderboardPage);
router.get('/race/:id', raceController.getRacePage);
router.post('/race/:id/predict', raceController.submitPrediction);

router.post('/api/push/subscribe', (req, res) => {
  pushService.subscribe(req.body);
  res.json({ success: true });
});

router.post('/api/push/notify', (req, res) => {
  const { raceId } = req.body;
  const race = raceModel.getRaceById(raceId);
  pushService.notifyAll({
    title: 'Prediction Time!',
    body: `You can now submit your predictions for the ${race.name}.`,
    url: `/races/${raceId}`
  });
  res.json({ success: true });
});

module.exports = router;
