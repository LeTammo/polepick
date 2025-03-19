const dataService = require('../services/dataService');
const driverModel = require('./driver');

function getAllResults() {
    return dataService.loadData('results.json');
}

function getResultByRaceId(raceId) {
    const results = getAllResults();
    return results.find(result => result.raceId === raceId) || null;
}

function getFormattedResult(raceId) {
    const result = getResultByRaceId(raceId);
    if (!result) return null;

    return {
        ...result,
        first: prepareDriver(result.first),
        second: prepareDriver(result.second),
        third: prepareDriver(result.third),
        others: result.others.map((driverId, index) => ({
            ...prepareDriver(driverId),
            position: index + 4
        })),
        remaining: result.remaining.map((driverId, index) => ({
            ...prepareDriver(driverId),
            position: index + 11
        }))
    };
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

module.exports = {
    getAllResults,
    getResultByRaceId,
    getFormattedResult
};