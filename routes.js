const controller = require('./controller');
const express = require("express");

module.exports = function (app) {
    const router = express.Router();

    router.get('/', controller.getHomePage);
    router.get('/race/:id', controller.getRacePage);
    router.post('/race/:id/predict', controller.submitPrediction);

    app.use('/', router);

    app.use((req, res) => {
        res.status(404).render('error', {
            message: 'Page not found'
        });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('error', {
            message: 'Something went wrong!'
        });
    });
};