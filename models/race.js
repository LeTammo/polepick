const dataService = require('../services/dataService');
const driverModel = require('./driver');
const utils = require('../utils');

function getAllRaces() {
    return dataService.loadData('races.json');
}

function getRaceById(raceId) {
    const races = getAllRaces();
    return races.find(race => race.id === raceId) || null;
}

function getLatestRace() {
    const races = getAllRaces();
    return races.length > 0 ? races[races.length - 1] : null;
}

function getRaceDrivers(raceId) {
    const race = getRaceById(raceId);
    if (!race) return [];

    return race.drivers.map((driverId, index) => {
        const driver = driverModel.getDriverById(driverId);
        if (!driver) return null;

        return {
            id: driver.id,
            name: driver.name,
            team: driver.team,
            color: driver.color,
            color_dark: driver.color_dark,
            isOdd: index % 2 !== 0
        };
    }).filter(driver => driver !== null);
}

function getFormattedRace(raceId) {
    const race = getRaceById(raceId);
    if (!race) return null;

    return {
        ...race,
        formattedDate: utils.formatDate(race.date),
        formattedTime: utils.formatTime(race.time)
    };
}

module.exports = {
    getAllRaces,
    getRaceById,
    getLatestRace,
    getRaceDrivers,
    getFormattedRace
};