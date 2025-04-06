const express = require('express');
const controller = require('../controllers/admin/index');

module.exports = function(app) {
    const router = express.Router();

    router.get('/login', controller.getLoginPage);
    router.post('/login', controller.handleLogin);
    router.get('/logout', controller.handleLogout);

    router.use(controller.requireAdmin);

    router.get('/', controller.getDashboard);

    router.get('/teams', controller.getTeams);
    router.post('/teams', controller.createTeam);
    router.put('/teams/:id', controller.updateTeam);
    router.delete('/teams/:id', controller.deleteTeam);

    router.get('/drivers', controller.getDrivers);
    router.post('/drivers', controller.createDriver);
    router.put('/drivers/:id', controller.updateDriver);
    router.post('/drivers/:id/assign-team', controller.assignDriverTeam);
    router.delete('/drivers/:id', controller.deleteDriver);

    router.get('/races', controller.getRaces);
    router.get('/races/:id', controller.getRaceForm);
    router.post('/races/:id', controller.createOrUpdateRace);
    router.delete('/races/:id', controller.deleteRace);

    router.get('/results', controller.getResults);
    router.get('/results/:id', controller.getResultForm);
    router.post('/results/:id', controller.createOrUpdateResult);
    router.delete('/results/:id', controller.deleteResult);

    router.get('/races/:id/predictions', controller.getPredictions);
    router.delete('/predictions/:id', controller.deletePrediction);

    app.use('/admin', router);
};