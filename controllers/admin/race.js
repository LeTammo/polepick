const raceModel = require('../../models/race');
const utils = require('../../utils');

function getRaces(req, res) {
    try {
        const races = raceModel.getRaces();

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

function createOrUpdateRace(req, res) {
    try {
        const id = req.params.id;
        const {
            name,
            nameShort,
            flag,
            date,
            time,
            weatherText,
            weatherTemperature,
            weatherIcon,
            track_img,
            predictionsStarted,
            predictionsEnded,
            drivers,
            result
        } = req.body;

        const missingFields = [];
        if (!name) missingFields.push('Race Name');
        if (!nameShort) missingFields.push('Location');
        if (!flag) missingFields.push('Flag');
        if (!date) missingFields.push('Date');
        if (!time) missingFields.push('Time');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: "${missingFields.join('", "')}"`
            });
        }

        const raceData = {
            name,
            nameShort,
            flag,
            date,
            time,
            weatherText: weatherText || '',
            weatherTemperature: weatherTemperature || '',
            weatherIcon: weatherIcon || '',
            track_img: track_img || '',
            predictionsStarted: predictionsStarted === "true",
            predictionsEnded: predictionsEnded === "true",
            drivers: Array.isArray(drivers) ? drivers : [],
            result: Array.isArray(result) ? result : []
        };

        let success;
        if (!id) {
            success = raceModel.createRace(raceData);
        } else {
            success = raceModel.updateRace(id, raceData);
        }

        if (!success) return res.status(500).json({ success: false, message: 'Could not save race' });
        res.redirect('/admin');

    } catch (error) {
        utils.error('Error saving race:', error);
        res.status(500).json({ success: false, message: 'Server error occurred while saving the race' });
    }
}


function deleteRace(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Race ID is required'
            });
        }

        const success = raceModel.deleteRace(id);

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
    createOrUpdateRace,
    deleteRace
};
