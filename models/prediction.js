const dataService = require('../services/dataService');
const driverModel = require('./driver');
const resultModel = require('./result');
const scoreService = require('../services/scoreService');
const utils = require('../utils');

function getAllPredictions() {
    return dataService.loadData('predictions.json');
}

function getPredictionsByRaceId(raceId) {
    const predictions = getAllPredictions();
    return predictions.filter(prediction => prediction.raceId === raceId);
}

function getFormattedPredictions(raceId) {
    const predictions = getPredictionsByRaceId(raceId);
    const result = resultModel.getResultByRaceId(raceId);

    return predictions.map(prediction => {
        const points = result ? scoreService.calculatePoints(prediction, result) : 0;

        return {
            username: prediction.username,
            timestamp: prediction.timestamp,
            first: prepareDriver(prediction.first),
            second: prepareDriver(prediction.second),
            third: prepareDriver(prediction.third),
            others: prediction.others.map(driverId => prepareDriver(driverId)),
            points: points
        };
    }).sort((a, b) =>
        b.points - a.points || new Date(b.timestamp) - new Date(a.timestamp)
    );
}

function prepareDriver(driverId) {
    const driver = driverModel.getDriverById(driverId);
    if (!driver) {
        return {
            id: driverId,
            name: driverId,
            color: '#cccccc',
            color_dark: '#999999'
        };
    }

    return {
        id: driverId,
        name: driver.name,
        color: driver.color,
        color_dark: driver.color_dark
    };
}

function createOrUpdatePrediction(raceId, predictionData) {
    try {
        const { username, first, second, third, others } = predictionData;

        if (!username || !first || !second || !third || !others || others.length !== 7) {
            utils.error('Invalid prediction data');
            return false;
        }

        const predictions = getAllPredictions();
        const existingPredictionIndex = predictions.findIndex(p =>
            p.raceId === raceId && p.username === username
        );

        const firstId = driverModel.getDriverIdByName(first);
        const secondId = driverModel.getDriverIdByName(second);
        const thirdId = driverModel.getDriverIdByName(third);
        const othersIds = Array.isArray(others)
            ? others.map(driverModel.getDriverIdByName)
            : [];

        if (existingPredictionIndex !== -1) {
            predictions[existingPredictionIndex] = {
                ...predictions[existingPredictionIndex],
                username,
                timestamp: new Date().toISOString(),
                first: firstId,
                second: secondId,
                third: thirdId,
                others: othersIds
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
                first: firstId,
                second: secondId,
                third: thirdId,
                others: othersIds
            });
        }

        return dataService.saveData('predictions.json', predictions);
    } catch (error) {
        utils.error('Error creating/updating prediction:', error);
        return false;
    }
}

module.exports = {
    getAllPredictions,
    getPredictionsByRaceId,
    getFormattedPredictions,
    createOrUpdatePrediction
};