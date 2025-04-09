const raceModel = require('../../models/race');
const driverModel = require('../../models/driver');
const teamModel = require('../../models/team');
const utils = require('../../utils');
const teamController = require('./team');
const driverController = require('./driver');
const racesController = require('./race');
const resultController = require('./result');
const predictionController = require('./prediction');

function getDashboard(req, res) {
    try {
        const races = raceModel.getPreparedRaces();
        const drivers = driverModel.getPreparedDrivers();
        const teams = teamModel.getAllTeams();

        res.render('admin/dashboard', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
            pageTitle: 'Admin Dashboard',
            races,
            drivers,
            teams
        });
    } catch (error) {
        utils.error('Error rendering admin dashboard:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the admin dashboard'
        });
    }
}

function requireAdmin(req, res, next) {
    const adminKey = req.cookies['polepick-admin-key'];

    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.redirect('/admin/login');
    }

    next();
}

function getLoginPage(req, res) {
    res.render('admin/login', {
        pageTitle: 'Admin Login',
        error: req.query.error ? 'Invalid admin key' : null
    });
}

function handleLogin(req, res) {
    const { adminKey } = req.body;

    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.redirect('/admin/login?error=1');
    }

    res.cookie('polepick-admin-key', adminKey, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true
    });

    res.redirect('/admin');
}

function handleLogout(req, res) {
    res.clearCookie('polepick-admin-key');
    res.redirect('/admin/login');
}

module.exports = {
    getDashboard,

    requireAdmin,
    getLoginPage,
    handleLogin,
    handleLogout,

    getTeams : teamController.getTeams,
    createTeam : teamController.createTeam,
    updateTeam : teamController.updateTeam,
    deleteTeam : teamController.deleteTeam,

    getDrivers : driverController.getDrivers,
    createDriver : driverController.createDriver,
    updateDriver : driverController.updateDriver,
    deleteDriver : driverController.deleteDriver,

    getRaces : racesController.getRaces,
    createOrUpdateRace : racesController.createOrUpdateRace,
    deleteRace : racesController.deleteRace,

    getResults : resultController.getResults,
    getResultForm : resultController.getResultForm,
    createOrUpdateResult : resultController.createOrUpdateResult,
    deleteResult : resultController.deleteResult,

    getPredictions : predictionController.getPredictions,
    deletePrediction : predictionController.deletePrediction,
};