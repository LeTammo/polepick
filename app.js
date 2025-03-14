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
    let points = 0;

    if (prediction.first === result.first) {
        points += 4;
    }

    if (prediction.second === result.second) {
        points += 3;
    }

    if (prediction.third === result.third) {
        points += 2;
    }

    const predictionDrivers = [
        prediction.first,
        prediction.second,
        prediction.third,
        ...prediction.others
    ];

    const resultDrivers = [
        result.first,
        result.second,
        result.third,
        ...result.others
    ];

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

// Map driver IDs to full names using the drivers.json
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
            isOdd: index % 2 !== 0
        };
    });

    const results = loadData('results.json');
    const result = results.find(r => r.raceId === raceId);

    let formattedResult = null;
    if (result) {
        formattedResult = {
            ...result,
            firstDriver: getDriverById(result.first),
            secondDriver: getDriverById(result.second),
            thirdDriver: getDriverById(result.third),
            othersDrivers: result.others.map(getDriverById)
        };
    }

    const allPredictions = loadData('predictions.json')
        .filter(p => p.raceId === raceId)
        .map(prediction => {
            const points = result ? calculatePoints(prediction, result) : 0;
            return {
                ...prediction,
                firstDriver: getDriverById(prediction.first),
                secondDriver: getDriverById(prediction.second),
                thirdDriver: getDriverById(prediction.third),
                othersDrivers: prediction.others.map(getDriverById),
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