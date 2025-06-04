const dataService = require('../services/dataService');
const driverModel = require('./driver');
const utils = require('../utils');

function findAllRaces() {
    return dataService.loadData('races.json');
}

function findRaceById(id) {
    const races = getAllRaces();
    return races.find(race => race.id === id) || null;
}

function getAllRaces() {
    return findAllRaces().map(race => {
        return {
            ...race,
            formattedDate: utils.formatDateShort(race.date),
        }
    });
}

function getLatestRace() {
    const races = getAllRaces();
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
        gridCompleted: race.predictionsStarted && isCompleted(race.drivers),
        result: result,
        renderResult: race.predictionsEnded && isCompleted(race.result),
    };
}

function isCompleted(driversList) {
    return driversList.every(driver => driver !== "");
}

function getPreparedRaces() {
    const races = getAllRaces();
    const allDrivers = driverModel.getPreparedDrivers();

    return races.map(race => {
        const gridArray = Array(20).fill(null).map((_, index) => {
            const driverId = race.drivers[index];
            if (!driverId) return { position: index + 1, driver: null };

            const driver = allDrivers.find(d => d.id === driverId);
            return {
                position: index + 1,
                driver: driver || null
            };
        });

        const resultArray = Array(20).fill(null).map((_, index) => {
            const driverId = race.result[index];
            if (!driverId) return { position: index + 1, driver: null };

            const driver = allDrivers.find(d => d.id === driverId);
            return {
                position: index + 1,
                driver: driver || null
            };
        });

        return {
            ...race,
            formattedDate: utils.formatDate(race.date),
            formattedTime: utils.formatTime(race.time),
            gridArray: gridArray,
            resultArray: resultArray,
            daysUntilRace: getDaysUntilRace(race.date) >= 0 ? getDaysUntilRace(race.date) : null,
            hasResult: race.predictionsEnded && isCompleted(race.result),
            shortName: race.name.replace('Grand Prix', 'GP'),
        };
    });
}

function getDaysUntilRace(date) {
    const raceDate = new Date(date);
    const today = new Date();
    const diffTime = raceDate - today;

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

function createRace({
    name,
    nameShort,
    flag,
    date,
    time,
    weatherText,
    weatherTemperature,
    weatherIcon,
    track_img,
    predictionsStarted,
    predictionsEnded,
    drivers,
    result
}) {
    try {
        const races = findAllRaces();
        const id = races.length > 0
            ? (parseInt(races[races.length - 1].id) + 1).toString()
            : "1";

        const newRace = {
            id,
            name,
            nameShort,
            flag,
            date,
            time,
            weatherText,
            weatherTemperature,
            weatherIcon,
            track_img,
            predictionsStarted,
            predictionsEnded,
        };

        if (drivers) {
            newRace.drivers = drivers;
        }
        if (result) {
            newRace.result = result;
        }

        races.push(newRace);
        return dataService.saveData('races.json', races) ? newRace : null;
    } catch (error) {
        utils.error('Error creating race:', error);
        return null;
    }
}

function updateRace(id, {
    name,
    nameShort,
    flag,
    date,
    time,
    weatherText,
    weatherTemperature,
    weatherIcon,
    track_img,
    predictionsStarted,
    predictionsEnded,
    drivers,
    result
}) {
    try {
        const races = findAllRaces();
        const index = races.findIndex(r => r.id === id);

        if (index === -1) return false;

        races[index] = {
            id,
            name,
            nameShort,
            flag,
            date,
            time,
            weatherText,
            weatherTemperature,
            weatherIcon,
            track_img,
            predictionsStarted,
            predictionsEnded
        };

        if (drivers) {
            races[index].drivers = drivers;
        }
        if (result) {
            races[index].result = result;
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

function validateDrivers(drivers) {
    for (const driver of drivers) {
        if (Number.isInteger(driver.id)) {
            return false;
        }
    }

    return true;
}

module.exports = {
    findAllRaces,
    findRaceById,
    getAllRaces,
    getLatestRace,
    getRaceDrivers,
    getPreparedRace,
    getPreparedRaces,
    createRace,
    updateRace,
    deleteRace
};