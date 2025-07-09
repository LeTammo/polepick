const utils = require("../utils");

function notFoundHandler(req, res, next) {
    res.status(404).render('error', {
        message: 'Page not found'
    });
}

function errorHandler(err, req, res, next) {
    utils.error('Unhandled error:', err.stack || err);
    res.status(500).render('error', {
        message: 'Something went wrong!'
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};