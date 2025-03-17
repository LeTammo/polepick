require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function formatBackendDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(',', '');
}

function log(message) { console.log(`[polepick] ${formatBackendDate(new Date())} - ${message}`); }

function checkIfFilesExist() {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        log('Data folder not found. Creating data folder');
        fs.mkdirSync(path.join(__dirname, 'data'));
        log('Data folder created.');
    }

    const files = ['drivers.json', 'races.json', 'results.json', 'predictions.json'];
    files.forEach(file => {
        if (!fs.existsSync(path.join(__dirname, 'data', file))) {
            log(`${file} not found. Creating ${file}`);
            fs.writeFileSync(path.join(__dirname, 'data', file), '[]', 'utf8');
            log(`${file} created.`);
        }
    });
}

checkIfFilesExist();

function loadData(file) {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', file), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading ${file}:`, err);
        return [];
    }
}

function saveData(file, data) {
    try {
        fs.writeFileSync(
            path.join(__dirname, 'data', file),
            JSON.stringify(data, null, 2),
            'utf8'
        );
        return true;
    } catch (err) {
        console.error(`Error saving ${file}:`, err);
        return false;
    }
}

function calculatePoints(prediction, result) {
    const resultDrivers = [result.first, result.second, result.third, ...result.others];
    const predictionDrivers = [prediction.first, prediction.second, prediction.third, ...prediction.others];

    let points = 0;

    if (prediction.first === result.first) {
        points += 4;
        resultDrivers.splice(resultDrivers.indexOf(result.first), 1);
    }

    if (prediction.second === result.second) {
        points += 3;
        resultDrivers.splice(resultDrivers.indexOf(result.second), 1);
    }

    if (prediction.third === result.third) {
        points += 2;
        resultDrivers.splice(resultDrivers.indexOf(result.third), 1);
    }

    predictionDrivers.forEach(driver => {
        if (resultDrivers.includes(driver)) {
            points += 1;
        }
    });

    return points;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-GB", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-GB", {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDriverById(driverId) {
    const drivers = loadData('drivers.json');
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : driverId;
}

function getDriverIdByName(driverName) {
    const drivers = loadData('drivers.json');
    const driver = drivers.find(d => d.name === driverName || d.customId === driverName);
    return driver ? driver.id : driverName;
}

app.get('/', (req, res) => {
    const races = loadData('races.json');
    const latestRace = races[races.length - 1];

    return res.redirect("/race/" + latestRace.id);
});

app.get('/race/:id', (req, res) => {
    const races = loadData('races.json');
    const raceId = req.params.id;
    const race = races.find(r => r.id === raceId);

    const allDrivers = loadData('drivers.json');
    const raceDrivers = race.drivers.map((driverId, index) => {
        const d = allDrivers.find(d => d.id === driverId);
        return {
            id: d.id,
            name: d.name,
            team: d.team,
            color: d.color,
            color_dark: d.color_dark,
            isOdd: index % 2 !== 0
        };
    });

    const results = loadData('results.json');
    const result = results.find(r => r.raceId === raceId);

    let formattedResult = null;
    if (result) {
        formattedResult = {
            ...result,
            first: {
                'id': result.first,
                'name': getDriverById(result.first),
                'color': allDrivers.find(d => d.id === result.first).color,
                'color_dark': allDrivers.find(d => d.id === result.first).color_dark
            },
            second: {
                'id': result.second,
                'name': getDriverById(result.second),
                'color': allDrivers.find(d => d.id === result.second).color,
                'color_dark': allDrivers.find(d => d.id === result.second).color_dark
            },
            third: {
                'id': result.third,
                'name': getDriverById(result.third),
                'color': allDrivers.find(d => d.id === result.third).color,
                'color_dark': allDrivers.find(d => d.id === result.third).color_dark
            },
            others: result.others.map((driverId, index) => {
                return {
                    'id': driverId,
                    'name': getDriverById(driverId),
                    'color': allDrivers.find(d => d.id === driverId).color,
                    'color_dark': allDrivers.find(d => d.id === driverId).color_dark,
                    'position': index + 4
                };
            }),
            remaining: result.remaining.map((driverId, index) => {
                return {
                    'id': driverId,
                    'name': getDriverById(driverId),
                    'color': allDrivers.find(d => d.id === driverId).color,
                    'color_dark': allDrivers.find(d => d.id === driverId).color_dark,
                    'position': index + 11
                };
            })
        };
    }

    const allPredictions = loadData('predictions.json')
        .filter(p => p.raceId === raceId)
        .map(prediction => {
            const points = result ? calculatePoints(prediction, result) : 0;
            return {
                username: prediction.username,
                first: {
                    'id': prediction.first,
                    'name': getDriverById(prediction.first),
                    'color': allDrivers.find(d => d.id === prediction.first).color,
                    'color_dark': allDrivers.find(d => d.id === prediction.first).color_dark
                },
                second: {
                    'id': prediction.second,
                    'name': getDriverById(prediction.second),
                    'color': allDrivers.find(d => d.id === prediction.second).color,
                    'color_dark': allDrivers.find(d => d.id === prediction.second).color_dark
                },
                third: {
                    'id': prediction.third,
                    'name': getDriverById(prediction.third),
                    'color': allDrivers.find(d => d.id === prediction.third).color,
                    'color_dark': allDrivers.find(d => d.id === prediction.third).color_dark
                },
                others: prediction.others.map(driverId => {
                    return {
                        'id': driverId,
                        'name': getDriverById(driverId),
                        'color': allDrivers.find(d => d.id === driverId).color,
                        'color_dark': allDrivers.find(d => d.id === driverId).color_dark
                    };
                }),
                points: points
            };
        })
        .sort((a, b) => b.points - a.points || new Date(b.timestamp) - new Date(a.timestamp));

    res.render('index', {
        pageTitle: `${race.name} - Prediction`,
        race: {
            ...race,
            formattedDate: formatDate(race.date),
            formattedTime: formatTime(race.time)
        },
        drivers: raceDrivers,
        result: formattedResult,
        predictions: allPredictions,
        predictionsJson: JSON.stringify(allPredictions),
        hasResult: !!result
    });
});

app.post('/race/:id/predict', (req, res) => {
    const { username, first, second, third, others } = req.body;
    console.log(`${username} made a prediction for race #${req.params.id}`);

    const raceId = req.params.id;

    const race = loadData('races.json').find(r => r.id === raceId);
    if (!race) {
        return res.status(400).send('Race not found');
    }

    if (race.predictionsEnded) {
        return res.status(400).send('Predictions have ended for this race');
    }

    if (!username || !first || !second || !third || !others || others.length !== 7) {
        return res.status(400).send('Invalid prediction data');
    }

    const predictions = loadData('predictions.json');

    const existingPredictionIndex = predictions.findIndex(p =>
        p.raceId === raceId && p.username === username
    );

    const firstId = getDriverIdByName(first);
    const secondId = getDriverIdByName(second);
    const thirdId = getDriverIdByName(third);
    const othersIds = Array.isArray(others)
        ? others.map(getDriverIdByName)
        : [];

    if (existingPredictionIndex !== -1) {
        predictions[existingPredictionIndex] = {
            ...predictions[existingPredictionIndex],
            username,
            timestamp: new Date().toISOString(),
            first: firstId,
            second: secondId,
            third: thirdId,
            others: othersIds
        };
    } else {
        const newId = predictions.length > 0
            ? (parseInt(predictions[predictions.length - 1].id) + 1).toString()
            : "1";

        predictions.push({
            id: newId,
            raceId,
            username,
            timestamp: new Date().toISOString(),
            first: firstId,
            second: secondId,
            third: thirdId,
            others: othersIds
        });
    }

    saveData('predictions.json', predictions);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});