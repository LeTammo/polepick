const express = require("express");
const homeController = require('../controllers/user/home');
const leaderboardController = require('../controllers/user/leaderboard');
const raceController = require('../controllers/user/race');

const router = express.Router();

router.get('/', homeController.getHomePage);
router.get('/next', homeController.getNextRace);
router.get('/leaderboard', leaderboardController.getLeaderboardPage);
router.get('/race/:id', raceController.getRacePage);
router.post('/race/:id/predict', raceController.submitPrediction);

module.exports = router;
