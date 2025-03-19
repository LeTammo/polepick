const raceModel = require('./models/race');
const resultModel = require('./models/result');
const predictionModel = require('./models/prediction');
const utils = require('./utils');

function getHomePage(req, res) {
    const latestRace = raceModel.getLatestRace();

    if (!latestRace) {
        return res.status(404).render('error', {
            message: 'No races found'
        });
    }

    return res.redirect(`/race/${latestRace.id}`);
}

function getRacePage(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.getFormattedRace(raceId);

        if (!race) {
            return res.status(404).render('error', {
                message: 'Race not found'
            });
        }

        const drivers = raceModel.getRaceDrivers(raceId);
        const result = resultModel.getFormattedResult(raceId);
        const predictions = predictionModel.getFormattedPredictions(raceId);

        res.render('index', {
            pageTitle: `${race.name} - Prediction`,
            race: race,
            drivers: drivers,
            result: result,
            predictions: predictions,
            predictionsJson: JSON.stringify(predictions),
            hasResult: !!result
        });
    } catch (error) {
        utils.error('Error rendering race page: ', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the race data'
        });
    }
}

function submitPrediction(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.getRaceById(raceId);

        if (!race) {
            return res.status(400).json({
                success: false,
                message: 'Race not found'
            });
        }

        if (race.predictionsEnded) {
            return res.status(400).json({
                success: false,
                message: 'Predictions have ended for this race'
            });
        }

        const { username, first, second, third, others } = req.body;
        utils.log(`${username} made a prediction for race #${raceId}`);

        const success = predictionModel.createOrUpdatePrediction(raceId, {
            username, first, second, third, others
        });

        if (!success) {
            utils.error('Failed to save prediction:\nusername:', username, '\nfirst:', first, '\nsecond:', second, '\nthird:', third, '\nothers:', others);
            return res.status(400).json({
                success: false,
                message: 'Failed to save prediction'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error submitting prediction:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your prediction'
        });
    }
}

module.exports = {
    getHomePage,
    getRacePage,
    submitPrediction
};