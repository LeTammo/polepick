const raceModel = require('../models/race');
const driverModel = require('../models/driver');
const teamModel = require('../models/team');
const utils = require('../utils');

function render(res, view, options) {
    res.render(view, {
        useAdminHeader: true,
        adminRoutes: [
            {'name': 'Dashboard', 'path': '/admin'},
            {'name': 'Teams', 'path': '/admin/teams'},
            {'name': 'Drivers', 'path': '/admin/drivers'},
            {'name': 'Races', 'path': '/admin/races'},
            //{'name': 'Results', 'path': '/admin/results'},
            //{'name': 'Predictions', 'path': '/admin/predictions'}
        ],
        ...options
    });
}

function getDashboard(req, res) {
    try {
        const races = raceModel.findAllRaces();
        const drivers = driverModel.getPreparedDrivers();
        const teams = teamModel.getAllTeams();

        render(res, 'admin/dashboard', {
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

function getTeams(req, res) {
    try {
        const teams = teamModel.getAllTeams();

        render(res, 'admin/teams', {
            pageTitle: 'Manage Teams',
            teams
        });
    } catch (error) {
        utils.error('Error rendering teams page:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the teams data'
        });
    }
}

function createTeam(req, res) {
    try {
        const { name, color, color_dark } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Team name is required'
            });
        }

        const newTeam = teamModel.createTeam({
            name,
            color: color || '#cccccc',
            color_dark: color_dark || '#999999'
        });

        if (!newTeam) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create team'
            });
        }

        res.json({
            success: true,
            team: newTeam
        });
    } catch (error) {
        utils.error('Error creating team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating the team'
        });
    }
}

function updateTeam(req, res) {
    try {
        const teamId = req.params.id;
        const { name, color, color_dark } = req.body;

        if (!teamId || !name) {
            return res.status(400).json({
                success: false,
                message: 'Team ID and name are required'
            });
        }

        const success = teamModel.updateTeam(teamId, {
            name, color, color_dark
        });

        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update team'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error updating team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the team'
        });
    }
}

function deleteTeam(req, res) {
    try {
        const teamId = req.params.id;

        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: 'Team ID is required'
            });
        }

        const success = teamModel.deleteTeam(teamId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or could not be deleted'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error deleting team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the team'
        });
    }
}

function getDrivers(req, res) {
    try {
        const drivers = driverModel.getAllDrivers();
        const teams = teamModel.getAllTeams();

        const enhancedDrivers = drivers.map(driver => {
            const team = teams.find(t => t.id === driver.defaultTeamId);
            return {
                ...driver,
                teamName: team ? team.name : 'Unknown Team'
            };
        });

        render(res, 'admin/drivers', {
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

        render(res,'admin/races', {
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
        let allDrivers = driverModel.findAllDrivers();
        let teams = teamModel.getAllTeams();
        let selectedDrivers = [];

        if (raceId !== 'new') {
            race = raceModel.findRaceById(raceId);
            if (!race) {
                return res.status(404).render('error', {
                    message: 'Race not found'
                });
            }
            selectedDrivers = race.drivers || [];
        }

        const availableDrivers = allDrivers.map(driver => {
            const team = teams.find(t => t.id === driver.defaultTeamId);
            return {
                ...driver,
                teamName: team ? team.name : 'Unknown Team',
                selected: selectedDrivers.includes(driver.id)
            };
        });

        render(res, 'admin/race-form', {
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

function getResults(req, res) {
    try {
        const races = raceModel.findAllRaces();

        const enhancedResults = races.result.map(result => {
            const race = races.find(r => r.id === result.raceId);
            return {
                ...result,
                raceName: race ? race.name : 'Unknown Race',
                formattedDate: race ? utils.formatDate(race.date) : 'Unknown Date'
            };
        });

        render(res, 'admin/results', {
            pageTitle: 'Manage Results',
            results: enhancedResults,
            races: races.filter(race => !results.some(r => r.raceId === race.id))
        });
    } catch (error) {
        utils.error('Error rendering results page:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the results data'
        });
    }
}

function getResultForm(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.findRaceById(raceId);

        if (!race) {
            return res.status(404).render('error', {
                message: 'Race not found'
            });
        }

        const drivers = raceModel.getRaceDrivers(raceId);

        if (race.result) {
            drivers.forEach(driver => {
                if (driver.id === race.result.first) {
                    driver.isFirst = true;
                } else if (driver.id === race.result.second) {
                    driver.isSecond = true;
                } else if (driver.id === race.result.third) {
                    driver.isThird = true;
                } else if (race.result.others && race.result.others.includes(driver.id)) {
                    driver.isOther = true;
                    driver.otherPosition = race.result.others.indexOf(driver.id) + 4;
                } else if (race.result.remaining && race.result.remaining.includes(driver.id)) {
                    driver.isRemaining = true;
                    driver.remainingPosition = race.result.remaining.indexOf(driver.id) + 1;
                }
            });
        }

        render(res, 'admin/result-form', {
            pageTitle: `Race Result: ${race.name}`,
            race,
            result: race.result,
            drivers,
            isEdit: !!race.result
        });
    } catch (error) {
        utils.error('Error rendering result form:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the result form'
        });
    }
}

function createOrUpdateResult(req, res) {
    try {
        const raceId = req.params.id;
        const { first, second, third, others, remaining } = req.body;

        if (!raceId || !first || !second || !third) {
            return res.status(400).json({
                success: false,
                message: 'Race ID and top three positions are required'
            });
        }

        const parsedOthers = others ? (Array.isArray(others) ? others : [others]) : [];
        const parsedRemaining = remaining ? (Array.isArray(remaining) ? remaining : [remaining]) : [];

        const success = resultModel.createOrUpdateResult(raceId, {
            first,
            second,
            third,
            others: parsedOthers,
            remaining: parsedRemaining
        });

        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to save result'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error saving result:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while saving the result'
        });
    }
}

function deleteResult(req, res) {
    try {
        const raceId = req.params.id;

        if (!raceId) {
            return res.status(400).json({
                success: false,
                message: 'Race ID is required'
            });
        }

        const success = resultModel.deleteResult(raceId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Result not found or could not be deleted'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error deleting result:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the result'
        });
    }
}

function getPredictions(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.getRaceById(raceId);

        if (!race) {
            return res.status(404).render('error', {
                message: 'Race not found'
            });
        }

        const predictions = predictionModel.getFormattedPredictions(raceId);

        render(res, 'admin/predictions', {
            pageTitle: `Predictions for ${race.name}`,
            race,
            predictions
        });
    } catch (error) {
        utils.error('Error rendering predictions page:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the predictions data'
        });
    }
}

function deletePrediction(req, res) {
    try {
        const predictionId = req.params.id;

        if (!predictionId) {
            return res.status(400).json({
                success: false,
                message: 'Prediction ID is required'
            });
        }

        const success = predictionModel.deletePrediction(predictionId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Prediction not found or could not be deleted'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error deleting prediction:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the prediction'
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

    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,

    getDrivers,
    createDriver,
    updateDriver,
    assignDriverTeam,
    deleteDriver,

    getRaces,
    getRaceForm,
    createOrUpdateRace,
    deleteRace,

    getResults,
    getResultForm,
    createOrUpdateResult,
    deleteResult,

    getPredictions,
    deletePrediction,

    requireAdmin,
    getLoginPage,
    handleLogin,
    handleLogout
};