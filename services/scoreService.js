function calculatePoints(prediction, result) {
    const predictionDrivers = [prediction.first, prediction.second, prediction.third, ...prediction.others];
    const remainingResultDrivers = [...result.pointsIds];
    const driverPoints = {};

    let points = 0;

    if (prediction.third === remainingResultDrivers[2]) {
        points += 2;
        driverPoints[prediction.third] = 2;
        remainingResultDrivers.splice(2, 1);
    }

    if (prediction.second === remainingResultDrivers[1]) {
        points += 3;
        driverPoints[prediction.second] = 3;
        remainingResultDrivers.splice(1, 1);
    }

    if (prediction.first === remainingResultDrivers[0]) {
        points += 4;
        driverPoints[prediction.first] = 4;
        remainingResultDrivers.splice(0, 1);
    }

    predictionDrivers.forEach(driver => {
        if (remainingResultDrivers.includes(driver)) {
            points += 1;
            driverPoints[driver] = (driverPoints[driver] || 0) + 1;
        }
    });

    return { points, driverPoints };
}

module.exports = {
    calculatePoints
};