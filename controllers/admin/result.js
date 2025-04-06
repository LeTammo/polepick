const raceModel = require('../../models/race');
const utils = require('../../utils');

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

        res.render('admin/results', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
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

        res.render('admin/result-form', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
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

module.exports = {
    getResults,
    getResultForm,
    createOrUpdateResult,
    deleteResult,
};