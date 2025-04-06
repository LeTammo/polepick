const raceModel = require('../../models/race');
const utils = require('../../utils');

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

        res.render('admin/predictions', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
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

module.exports = {
    getPredictions,
    deletePrediction,
};