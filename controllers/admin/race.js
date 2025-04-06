const raceModel = require('../../models/race');
const driverModel = require('../../models/driver');
const teamModel = require('../../models/team');
const utils = require('../../utils');

function getRaces(req, res) {
    try {
        const races = raceModel.findAllRaces();

        const enhancedRaces = races.map(race => {
            const hasResult = race.result.some(r => r.raceId === race.id);
            return {
                ...race,
                formattedDate: utils.formatDate(race.date),
                formattedTime: utils.formatTime(race.time),
                hasResult,
                driverCount: race.drivers ? race.drivers.length : 0
            };
        });

        res.render('admin/races', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
            pageTitle: 'Manage Races',
            races: enhancedRaces
        });
    } catch (error) {
        utils.error('Error rendering races page:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the races data'
        });
    }
}

function getRaceForm(req, res) {
    try {
        const raceId = req.params.id;
        let race = null;
        let allDrivers = driverModel.getPreparedDrivers();
        let teams = teamModel.getAllTeams();
        let selectedDrivers = [];

        if (raceId !== 'new') {
            race = raceModel.getPreparedRace(raceId);
            selectedDrivers = race.drivers;
        }

        const availableDrivers = allDrivers.map(driver => {
            const team = teams.find(t => t.id === driver.defaultTeamId);
            return {
                ...driver,
                teamName: team ? team.name : 'Unknown Team',
                selected: selectedDrivers.includes(driver.id)
            };
        });

        res.render('admin/race-form', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
            pageTitle: race ? `Edit Race: ${race.name}` : 'Create New Race',
            race,
            drivers: availableDrivers,
            isEdit: !!race
        });
    } catch (error) {
        utils.error('Error rendering race form:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the race form'
        });
    }
}

function createOrUpdateRace(req, res) {
    try {
        const raceId = req.params.id;
        const { name, location, date, time, predictionsEnded, drivers } = req.body;

        if (!name || !location || !date) {
            return res.status(400).json({
                success: false,
                message: 'Race name, location, and date are required'
            });
        }

        const raceData = {
            name,
            location,
            date,
            time: time || '00:00:00',
            predictionsEnded: predictionsEnded === 'true',
            drivers: Array.isArray(drivers) ? drivers : []
        };

        let success;

        if (raceId === 'new') {
            const newRace = raceModel.createRace(raceData);
            success = !!newRace;
        } else {
            success = raceModel.updateRace(raceId, raceData);
        }

        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to save race'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error saving race:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving the race'
        });
    }
}

function deleteRace(req, res) {
    try {
        const raceId = req.params.id;

        if (!raceId) {
            return res.status(400).json({
                success: false,
                message: 'Race ID is required'
            });
        }

        const success = raceModel.deleteRace(raceId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Race not found or could not be deleted'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error deleting race:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the race'
        });
    }
}

module.exports = {
    getRaces,
    getRaceForm,
    createOrUpdateRace,
    deleteRace
};