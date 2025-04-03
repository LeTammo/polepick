function calculatePoints(prediction, result) {
    const predictionDrivers = [prediction.first, prediction.second, prediction.third, ...prediction.others];
    const remainingResultDrivers = [...result.pointsIds];

    let points = 0;

    if (prediction.third === remainingResultDrivers[2]) {
        points += 2;
        remainingResultDrivers.splice(2, 1);
    }

    if (prediction.second === remainingResultDrivers[1]) {
        points += 3;
        remainingResultDrivers.splice(1, 1);
    }

    if (prediction.first === remainingResultDrivers[0]) {
        points += 4;
        remainingResultDrivers.splice(0, 1);
    }

    predictionDrivers.forEach(driver => {
        if (remainingResultDrivers.includes(driver)) {
            points += 1;
        }
    });

    return points;
}

module.exports = {
    calculatePoints
};