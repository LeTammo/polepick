const dataService = require('../services/dataService');
const teamModel = require('./team');
const utils = require('../utils');

function getDrivers() {
    return dataService.loadData('drivers.json');
}

function getDriverById(id) {
    return getDrivers().find(driver => driver.id === id) || null;
}

function getDriverByLabelAndTeam(label, team) {
    return getDrivers().find(d => d.label === label && d.team === team) || null;
}

function getPreparedDrivers() {
    return getDrivers().map((driver) => {
        const team = teamModel.getTeamById(driver.team);

        return {
            ...driver,
            team: team.name,
            teamLong: team.nameLong,
            color: team.color,
            teamId: team.id,
        }
    });
}

function getPreparedDriversByIds(drivers, startIndex = 0) {
    return drivers.map((id, index) => {
        if (!id) return {};

        return {
            position: startIndex + index + 1,
            isOdd: (startIndex + index) % 2 !== 0,
            ...getPreparedDriverById(id),
        }
    });
}

function getPreparedDriverById(id) {
    if (!id) return {};

    const driver = getDriverById(id);
    const team = teamModel.getTeamById(driver.team);

    return {
        ...driver,
        team: team.name,
        teamLong: team.nameLong,
        color: team.color,
        teamId: team.id,
    };
}

function createDriver(driverData) {
    try {
        const drivers = getDrivers();
        const uniqueDrivers = Array.from(new Set(drivers.map(d => d.label)))
            .map(label => drivers.find(d => d.label === label));

        const newDriver = {
            id: (1 + 5 * uniqueDrivers.length).toString(),
            ...driverData
        };

        drivers.push(newDriver);
        return dataService.saveData('drivers.json', drivers) ? newDriver : null;
    } catch (error) {
        utils.error('Error creating driver:', error);
        return null;
    }
}

function updateDriver(driver) {
    try {
        const drivers = getDrivers();

        drivers[driver.id] = {
            ...drivers[driver.id],
            name: driver.name || drivers[driver.id].name,
            label: driver.label || drivers[driver.id].label,
            team: driver.team || drivers[driver.id].team,
        };

        return dataService.saveData('drivers.json', drivers);
    } catch (error) {
        utils.error('Error updating driver:', error);
        return false;
    }
}

function deleteDriver(id) {
    try {
        const drivers = getDrivers();
        const filteredDrivers = drivers.filter(d => d.id !== id);

        if (filteredDrivers.length === drivers.length) {
            return false;
        }

        return dataService.saveData('drivers.json', filteredDrivers);
    } catch (error) {
        utils.error('Error deleting driver:', error);
        return false;
    }
}

module.exports = {
    getDrivers,
    getDriverById,
    getDriverByLabelAndTeam,
    getPreparedDrivers,
    getPreparedDriversByIds,
    getPreparedDriverById,
    createDriver,
    updateDriver,
    deleteDriver
};
