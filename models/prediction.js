const dataService = require('../services/dataService');
const driverModel = require('./driver');
const raceModel =require('./race');
const scoreService = require('../services/scoreService');
const utils = require('../utils');

function getPredictions() {
    return dataService.loadData('predictions.json');
}

function getPredictionsByRaceId(raceId) {
    const predictions = getPredictions();
    return predictions.filter(prediction => prediction.raceId === raceId);
}

function getPreparedPredictions(raceId) {
    const predictions = getPredictionsByRaceId(raceId);
    const race = raceModel.getPreparedRace(raceId);

    return predictions.map(prediction => {
        const score = race.result ? scoreService.calculatePoints(prediction, race.result) : { points: 0, driverPoints: {} };

        const addPointsToDriver = (driver) => {
            if (!driver) return null;
            const points = score.driverPoints[driver.id] || 0;
            return { ...driver, points };
        };

        return {
            id: prediction.id,
            username: prediction.username,
            timestamp: prediction.timestamp,
            first: addPointsToDriver(driverModel.getPreparedDriverById(prediction.first)),
            second: addPointsToDriver(driverModel.getPreparedDriverById(prediction.second)),
            third: addPointsToDriver(driverModel.getPreparedDriverById(prediction.third)),
            others: prediction.others.map(driverId => addPointsToDriver(driverModel.getPreparedDriverById(driverId))),
            points: score.points
        };
    }).sort((a, b) =>
        b.points - a.points || new Date(b.timestamp) - new Date(a.timestamp)
    );
}

function createOrUpdatePrediction(raceId, { username, first, second, third, others }) {
    try {
        if (!username || !first || !second || !third || !others || others.length !== 7) {
            utils.error('Invalid prediction data');
            return false;
        }

        const predictions = getPredictions();
        const existingPredictionIndex = predictions.findIndex(p =>
            p.raceId === raceId && p.username === username
        );

        if (existingPredictionIndex !== -1) {
            predictions[existingPredictionIndex] = {
                ...predictions[existingPredictionIndex],
                username,
                timestamp: new Date().toISOString(),
                first,
                second,
                third,
                others
            };
        } else {
            const newId = predictions.length > 0
                ? (parseInt(predictions[predictions.length - 1].id) + 1).toString()
                : "1";

            predictions.push({
                id: newId,
                raceId,
                username,
                timestamp: new Date().toISOString(),
                first,
                second,
                third,
                others
            });
        }

        return dataService.saveData('predictions.json', predictions);
    } catch (error) {
        utils.error('Error creating/updating prediction:', error);
        return false;
    }
}

function deletePrediction(predictionId) {
    try {
        const predictions = getPredictions();
        const filteredPredictions = predictions.filter(p => p.id !== predictionId);

        if (filteredPredictions.length === predictions.length) {
            return false;
        }

        return dataService.saveData('predictions.json', filteredPredictions);
    } catch (error) {
        utils.error('Error deleting prediction:', error);
        return false;
    }
}

module.exports = {
    getPredictions,
    getPredictionsByRaceId,
    getPreparedPredictions,
    createOrUpdatePrediction,
    deletePrediction
};
