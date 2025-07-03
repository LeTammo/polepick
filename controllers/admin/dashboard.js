const raceModel = require('../../models/race');
const driverModel = require('../../models/driver');
const teamModel = require('../../models/team');
const utils = require('../../utils');

function getDashboard(req, res) {
    try {
        const races = raceModel.getPreparedRaces();
        const drivers = driverModel.getPreparedDrivers();
        const teams = teamModel.getTeams();

        res.render('admin/dashboard', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
            pageTitle: 'Admin Dashboard',
            races,
            drivers,
            teams,
            flags: require('fs').readdirSync('public/flags'),
            circuits: require('fs').readdirSync('public/circuits'),
        });
    } catch (error) {
        utils.error('Error rendering admin dashboard:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the admin dashboard'
        });
    }
}

module.exports = {
    getDashboard,
};
