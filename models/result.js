const dataService = require('../services/dataService');
const driverModel = require('./driver');
const utils = require('../utils');

function getAllResults() {
    return dataService.loadData('results.json');
}

function findResultByRaceId(raceId) {
    const results = getAllResults();
    return results.find(result => result.raceId === raceId) || null;
}

function getPreparedResult(raceId) {
    const result = findResultByRaceId(raceId);
    if (!result) return null;

    return {
        ...result,
        first: driverModel.getPreparedDriver(result.first),
        second: driverModel.getPreparedDriver(result.second),
        third: driverModel.getPreparedDriver(result.third),
        others: result.others.map((driverId, index) => ({
            ...driverModel.getPreparedDriver(driverId),
            position: index + 4
        })),
        remaining: result.remaining.map((driverId, index) => ({
            ...driverModel.getPreparedDriver(driverId),
            position: index + 11
        }))
    };
}

function createOrUpdateResult(raceId, resultData) {
    try {
        const { first, second, third, others, remaining } = resultData;

        if (!first || !second || !third || !others) {
            utils.error('Invalid result data');
            return false;
        }

        const results = getAllResults();
        const existingResultIndex = results.findIndex(r => r.raceId === raceId);

        const newResult = {
            raceId,
            first,
            second,
            third,
            others: others || [],
            remaining: remaining || [],
            timestamp: new Date().toISOString()
        };

        if (existingResultIndex !== -1) {
            results[existingResultIndex] = {
                ...results[existingResultIndex],
                ...newResult
            };
        } else {
            results.push(newResult);
        }

        return dataService.saveData('results.json', results);
    } catch (error) {
        utils.error('Error creating/updating result:', error);
        return false;
    }
}

function deleteResult(raceId) {
    try {
        const results = getAllResults();
        const filteredResults = results.filter(r => r.raceId !== raceId);

        if (filteredResults.length === results.length) {
            return false;
        }

        return dataService.saveData('results.json', filteredResults);
    } catch (error) {
        utils.error('Error deleting result:', error);
        return false;
    }
}

module.exports = {
    getAllResults,
    findResultByRaceId,
    getPreparedResult,
    createOrUpdateResult,
    deleteResult
};