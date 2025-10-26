const raceModel = require("../../models/race");
const predictionModel = require("../../models/prediction");
const utils = require("../../utils");

function getRacePage(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.getPreparedRace(raceId);
        const races = raceModel.getRaces();

        if (!race) {
            return res.status(404).render('error', {
                message: 'Race not found'
            });
        }


        const predictions = predictionModel.getPreparedPredictions(raceId);
        const username = req.cookies[`polepick-username-for-race-${raceId}`];

        const predictionsWithRank = [];
        predictions.forEach((p, index) => {
            if (index === 0) {
                p.rank = 1;
            } else {
                const prevPrediction = predictions[index - 1];
                if (p.points === prevPrediction.points) {
                    p.rank = prevPrediction.rank;
                } else {
                    p.rank = index + 1;
                }
            }
            predictionsWithRank.push(p);
        });

        console.log(predictionsWithRank);

        let userPrediction = predictionsWithRank.find(p => p.username === username);
        userPrediction = userPrediction ? { ...userPrediction, isUserPrediction: true } : null;

        res.render('user/main', {
            race: race,
            races: races,
            predictions: predictionsWithRank.filter(p => p.username !== username),
            userPrediction: userPrediction,
            predictionsJson: JSON.stringify(predictions),
            hasResult: !!race.result,
            renderResult: race.renderResult,
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
    getRacePage,
    submitPrediction
};
