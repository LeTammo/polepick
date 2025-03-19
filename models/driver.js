const dataService = require('../services/dataService');

function getAllDrivers() {
    return dataService.loadData('drivers.json');
}

function getDriverById(driverId) {
    const drivers = getAllDrivers();
    return drivers.find(driver => driver.id === driverId) || null;
}

function getDriverNameById(driverId) {
    const driver = getDriverById(driverId);
    return driver ? driver.name : driverId;
}

function getDriverIdByName(driverName) {
    const drivers = getAllDrivers();
    const driver = drivers.find(d =>
        d.name === driverName ||
        d.customId === driverName
    );
    return driver ? driver.id : driverName;
}

function getPreparedDriver(driverId) {
    const driver = getDriverById(driverId);
    if (!driver) return null;

    return {
        id: driver.id,
        name: driver.name,
        color: driver.color,
        color_dark: driver.color_dark,
        team: driver.team
    };
}

module.exports = {
    getAllDrivers,
    getDriverById,
    getDriverNameById,
    getDriverIdByName,
    getPreparedDriver
};