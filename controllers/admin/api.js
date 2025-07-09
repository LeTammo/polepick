const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function loadRaceFromApi(req, res) {
    try {
        const raceId = req.params.id;

        const racesPath = path.join(__dirname, '../../data/races.json');
        const driversPath = path.join(__dirname, '../../data/drivers.json');
        const races = JSON.parse(fs.readFileSync(racesPath, 'utf8'));
        const drivers = JSON.parse(fs.readFileSync(driversPath, 'utf8'));
        const race = races.find(r => r.id === raceId);
        if (!race) {
            return res.json({ success: false, message: 'Race not found.' });
        }

        const season = (race.date || '').slice(0, 4);
        const round = (parseInt(raceId, 10) + 1).toString();
        const apiUrl = `https://f1api.dev/api/${season}/${round}/race`;
        const apiRes = await fetch(apiUrl);
        const apiData = await apiRes.json();
        if (apiData.status === 404 || !apiData.races || !Array.isArray(apiData.races.results)) {
            return res.json({ success: false, message: 'No race results found for this round.' });
        }

        const resultOrder = [];
        for (const result of apiData.races.results) {
            const apiShort = result.driver.shortName;
            let match = drivers.find(d => d.label === apiShort && d.active === true);
            if (match) {
                resultOrder.push(match.id);
            }
        }
        if (!resultOrder.length) {
            return res.json({ success: false, message: 'No matching drivers found in your data.' });
        }

        race.result = resultOrder;
        fs.writeFileSync(racesPath, JSON.stringify(races, null, 2));
        return res.json({ success: true });
    } catch (error) {
        console.error('Error loading result from API:', error);
        return res.json({ success: false, message: 'Error loading result from API.' });
    }
}

async function loadQualiFromApi(req, res) {
    try {
        const raceId = req.params.id;

        const racesPath = path.join(__dirname, '../../data/races.json');
        const driversPath = path.join(__dirname, '../../data/drivers.json');
        const races = JSON.parse(fs.readFileSync(racesPath, 'utf8'));
        const drivers = JSON.parse(fs.readFileSync(driversPath, 'utf8'));
        const race = races.find(r => r.id === raceId);
        if (!race) {
            return res.json({ success: false, message: 'Race not found.' });
        }

        const season = (race.date || '').slice(0, 4);
        const round = (parseInt(raceId, 10) + 1).toString();
        const apiUrl = `https://f1api.dev/api/${season}/${round}/qualy`;
        const apiRes = await fetch(apiUrl);
        const apiData = await apiRes.json();
        if (apiData.status === 404 || !apiData.races || !Array.isArray(apiData.races.qualyResults)) {
            return res.json({ success: false, message: 'No qualification results found for this round.' });
        }

        const qualiOrder = [];
        for (const result of apiData.races.qualyResults) {
            const apiShort = result.driver.shortName;
            let match = drivers.find(d => d.label === apiShort && d.active === true);
            if (match) {
                qualiOrder.push(match.id);
            }
        }
        if (!qualiOrder.length) {
            return res.json({ success: false, message: 'No matching drivers found in your data.' });
        }

        race.drivers = qualiOrder;
        fs.writeFileSync(racesPath, JSON.stringify(races, null, 2));
        return res.json({ success: true });
    } catch (error) {
        console.error('Error loading qualification from API:', error);
        return res.json({ success: false, message: 'Error loading qualification from API.' });
    }
}

module.exports = {
    loadRaceFromApi,
    loadQualiFromApi,
};
