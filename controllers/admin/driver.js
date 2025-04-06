const driverModel = require('../../models/driver');
const teamModel = require('../../models/team');
const utils = require('../../utils');

function getDrivers(req, res) {
    try {
        const drivers = driverModel.findAllDrivers();
        const teams = teamModel.getAllTeams();

        const enhancedDrivers = drivers.map(driver => {
            const team = teams.find(t => t.id === driver.defaultTeamId);
            return {
                ...driver,
                teamName: team ? team.name : 'Unknown Team'
            };
        });

        res.render('admin/drivers', {
            pageTitle: 'Manage Drivers',
            drivers: enhancedDrivers,
            teams
        });
    } catch (error) {
        utils.error('Error rendering drivers page:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the drivers data'
        });
    }
}

function createDriver(req, res) {
    try {
        const { name, teamId } = req.body;

        if (!name || !teamId) {
            return res.status(400).json({
                success: false,
                message: 'Driver name and team ID are required'
            });
        }

        const newDriver = driverModel.createDriver({
            name,
            teamId
        });

        if (!newDriver) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create driver'
            });
        }

        res.json({
            success: true,
            driver: newDriver
        });
    } catch (error) {
        utils.error('Error creating driver:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating the driver'
        });
    }
}

function updateDriver(req, res) {
    try {
        const driverId = req.params.id;
        const { name, teamId } = req.body;

        if (!driverId || !name || !teamId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID, name, and team ID are required'
            });
        }

        const success = driverModel.updateDriver(driverId, {
            name, teamId
        });

        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update driver'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error updating driver:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the driver'
        });
    }
}

function assignDriverTeam(req, res) {
    try {
        const driverId = req.params.id;
        const { raceId, teamId } = req.body;

        if (!driverId || !raceId || !teamId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID, race ID, and team ID are required'
            });
        }

        const success = driverModel.assignDriverToTeam(driverId, raceId, teamId);

        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to assign driver to team for this race'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error assigning driver to team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while assigning the driver to a team'
        });
    }
}

function deleteDriver(req, res) {
    try {
        const driverId = req.params.id;

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        const success = driverModel.deleteDriver(driverId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found or could not be deleted'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error deleting driver:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the driver'
        });
    }
}

module.exports = {
    getDrivers,
    createDriver,
    updateDriver,
    assignDriverTeam,
    deleteDriver
};