const raceModel = require('../../models/race');
const driverModel = require('../../models/driver');
const teamModel = require('../../models/team');
const utils = require('../../utils');
const fs = require('fs');

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
            flags: getFlags(),
            circuits: getCircuits(),
        });
    } catch (error) {
        utils.error('Error rendering admin dashboard:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the admin dashboard'
        });
    }
}

function toPascalCase(str) {
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .replace(/ /g, '');
}

function toPascalCaseWithSpaces(str) {
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function getFlags() {
    const flagFiles = fs.readdirSync('public/flags');
    return flagFiles.map(filename => {
        const match = filename.match(/^([a-z]{2,3})_([a-z-]+)\./i);
        let short = '', long = '';
        if (match) {
            short = match[1].toUpperCase();
            long = toPascalCaseWithSpaces(match[2]);
        } else {
            const base = filename.split('.')[0];
            short = base.toUpperCase();
            long = toPascalCaseWithSpaces(base);
        }
        return {
            filename,
            name: `${short} - ${long}`
        };
    });
}

function getCircuits() {
    const circuitFiles = fs.readdirSync('public/circuits');
    const flagFiles = fs.readdirSync('public/flags');
    const flagMap = {};
    flagFiles.forEach(filename => {
        const match = filename.match(/^([a-z]{2,3})_([a-z-]+)\./i);
        if (match) {
            flagMap[match[1].toUpperCase()] = filename;
        }
    });
    return circuitFiles.map(filename => {
        const match = filename.match(/^([a-z]{2,3})_([a-z0-9-]+)\./i);
        let short = '', circuit = '', flag = '';
        if (match) {
            short = match[1].toUpperCase();
            circuit = toPascalCaseWithSpaces(match[2]);
            flag = flagMap[short] || '';
        } else {
            const base = filename.split('.')[0];
            short = base.toUpperCase();
            circuit = toPascalCaseWithSpaces(base);
            flag = flagMap[short] || '';
        }
        return {
            filename,
            name: `${short} - ${circuit}`,
            flag,
            short
        };
    });
}

module.exports = {
    getDashboard,
};
