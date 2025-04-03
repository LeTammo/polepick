const express = require("express");
const utils = require("../utils");

module.exports = function (app) {
    const router = express.Router();

    app.use((req, res) => {
        res.status(404).render('error', {
            message: 'Page not found'
        });
    });

    app.use((err, req, res, next) => {
        utils.error('Unhandled error:', err.stack || err);
        res.status(500).render('error', {
            message: 'Something went wrong!'
        });
    });

    app.use('/', router);
};