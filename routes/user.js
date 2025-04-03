const express = require("express");
const controller = require('../controllers/user');

module.exports = function (app) {
    const router = express.Router();

    router.get('/', controller.getHomePage);
    router.get('/leaderboard', controller.getLeaderboardPage);
    router.get('/race/:id', controller.getRacePage);
    router.post('/race/:id/predict', controller.submitPrediction);

    app.use('/', router);
};