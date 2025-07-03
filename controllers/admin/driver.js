const driverModel = require('../../models/driver');
const utils = require('../../utils');

function getDrivers(req, res) {
    try {
        const drivers = driverModel.getDrivers();
        const teams = teamModel.getTeams();

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
        const { label, name, team } = req.body;

        if (!name || !label || !team) {
            return res.status(400).json({
                success: false,
                message: 'Driver name, label, and team are required'
            });
        }

        const newDriver = driverModel.createDriver({ label, name, team });

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
        const id = req.params.id;
        const { label, name, team } = req.body;

        if (!id || !label || !name || !team) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID, label, name, and team ID are required'
            });
        }

        const success = driverModel.updateDriver(id, { label, name, team });

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

function deleteDriver(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        const success = driverModel.deleteDriver(id);

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
    deleteDriver
};
