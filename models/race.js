const dataService = require('../services/dataService');
const driverModel = require('./driver');
const utils = require('../utils');

function findAllRaces() {
    let races = dataService.loadData('races.json');

    return races.map(race => {
        return {
            ...race,
            formattedDate: utils.formatDateShort(race.date),
        }
    });
}

function findRaceById(id) {
    const races = findAllRaces();
    return races.find(race => race.id === id) || null;
}

function getLatestRace() {
    const races = findAllRaces();
    if (races.length === 0) return null;

    const sortedRaces = [...races].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.time || '00:00:00'));
        const dateB = new Date(b.date + 'T' + (b.time || '00:00:00'));
        return dateB - dateA;
    });

    return sortedRaces[0];
}

function getPreparedRace(id) {
    const race = findRaceById(id);
    if (!race) return null;

    let result = null;
    if (race.result.length > 0) {
        result = {
            resultIds: race.result,
            pointsIds: race.result.slice(0, 10),
            first: driverModel.getPreparedDriverById(race.result[0]),
            second: driverModel.getPreparedDriverById(race.result[1]),
            third: driverModel.getPreparedDriverById(race.result[2]),
            points: driverModel.getPreparedDriversByIds(race.result.slice(3, 10), 3),
            remaining: driverModel.getPreparedDriversByIds(race.result.slice(10, 20), 10),
        }
    }

    return {
        ...race,
        formattedDate: utils.formatDate(race.date),
        formattedTime: utils.formatTime(race.time),
        grid: driverModel.getPreparedDriversByIds(race.drivers),
        result: result
    };
}

function getRaceDrivers(id) {
    const race = findRaceById(id);
    if (!race) return [];

    return race.drivers.map((id, index) => {
        const driver = driverModel.findDriverById(id);
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

function createRace(raceData) {
    try {
        const races = findAllRaces();
        const newId = races.length > 0
            ? (parseInt(races[races.length - 1].id) + 1).toString()
            : "1";

        const newRace = {
            id: newId,
            name: raceData.name,
            location: raceData.location,
            date: raceData.date,
            time: raceData.time || '00:00:00',
            predictionsEnded: false,
            drivers: raceData.drivers || []
        };

        races.push(newRace);
        return dataService.saveData('races.json', races) ? newRace : null;
    } catch (error) {
        utils.error('Error creating race:', error);
        return null;
    }
}

function updateRace(raceId, raceData) {
    try {
        const races = findAllRaces();
        const index = races.findIndex(r => r.id === raceId);

        if (index === -1) return false;

        races[index] = {
            ...races[index],
            name: raceData.name || races[index].name,
            location: raceData.location || races[index].location,
            date: raceData.date || races[index].date,
            time: raceData.time || races[index].time,
            predictionsEnded: raceData.predictionsEnded !== undefined
                ? raceData.predictionsEnded
                : races[index].predictionsEnded
        };

        if (raceData.drivers) {
            races[index].drivers = raceData.drivers;
        }

        return dataService.saveData('races.json', races);
    } catch (error) {
        utils.error('Error updating race:', error);
        return false;
    }
}

function deleteRace(raceId) {
    try {
        const races = findAllRaces();
        const filteredRaces = races.filter(r => r.id !== raceId);

        if (filteredRaces.length === races.length) {
            return false;
        }

        return dataService.saveData('races.json', filteredRaces);
    } catch (error) {
        utils.error('Error deleting race:', error);
        return false;
    }
}

module.exports = {
    findAllRaces,
    findRaceById,
    getLatestRace,
    getRaceDrivers,
    getPreparedRace,
    createRace,
    updateRace,
    deleteRace
};