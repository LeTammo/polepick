const express = require('express');
const authController = require('../controllers/admin/auth');
const dashboardController = require('../controllers/admin/dashboard');
const teamController = require('../controllers/admin/team');
const driverController = require('../controllers/admin/driver');
const raceController = require('../controllers/admin/race');
const resultController = require('../controllers/admin/result');
const predictionController = require('../controllers/admin/prediction');
const apiController = require('../controllers/admin/api');

module.exports = function(app) {
    const router = express.Router();

    router.get('/login', authController.getLoginPage);
    router.post('/login', authController.handleLogin);
    router.get('/logout', authController.handleLogout);

    router.use(authController.requireAdmin);

    router.get('/', dashboardController.getDashboard);

    router.get('/teams', teamController.getTeams);
    router.post('/teams', teamController.createTeam);
    router.put('/teams/:id', teamController.updateTeam);
    router.delete('/teams/:id', teamController.deleteTeam);

    router.get('/drivers', driverController.getDrivers);
    router.post('/drivers', driverController.createDriver);
    router.put('/drivers/:id', driverController.updateDriver);
    router.delete('/drivers/:id', driverController.deleteDriver);

    router.get('/races', raceController.getRaces);
    router.post('/races', raceController.createOrUpdateRace);
    router.post('/races/:id', raceController.createOrUpdateRace);
    router.delete('/races/:id', raceController.deleteRace);

    router.get('/results', resultController.getResults);
    router.get('/results/:id', resultController.getResultForm);
    router.post('/results/:id', resultController.createOrUpdateResult);
    router.delete('/results/:id', resultController.deleteResult);

    router.get('/races/:id/predictions', predictionController.getPredictions);
    router.delete('/predictions/:id', predictionController.deletePrediction);

    router.post('/query/quali/:id', apiController.loadQualiFromApi);
    router.post('/query/race/:id', apiController.loadRaceFromApi);

    app.use('/admin', router);
};
