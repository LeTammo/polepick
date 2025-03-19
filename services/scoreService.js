function calculatePoints(prediction, result) {
    if (!prediction || !result) return 0;

    const resultDrivers = [result.first, result.second, result.third, ...result.others];
    const predictionDrivers = [prediction.first, prediction.second, prediction.third, ...prediction.others];

    let points = 0;
    const remainingResultDrivers = [...resultDrivers];

    if (prediction.first === result.first) {
        points += 4;
        const index = remainingResultDrivers.indexOf(result.first);
        if (index !== -1) remainingResultDrivers.splice(index, 1);
    }

    if (prediction.second === result.second) {
        points += 3;
        const index = remainingResultDrivers.indexOf(result.second);
        if (index !== -1) remainingResultDrivers.splice(index, 1);
    }

    if (prediction.third === result.third) {
        points += 2;
        const index = remainingResultDrivers.indexOf(result.third);
        if (index !== -1) remainingResultDrivers.splice(index, 1);
    }

    predictionDrivers.forEach(driver => {
        if (remainingResultDrivers.includes(driver)) {
            points += 1;
            const index = remainingResultDrivers.indexOf(driver);
            if (index !== -1) remainingResultDrivers.splice(index, 1);
        }
    });

    return points;
}

module.exports = {
    calculatePoints
};