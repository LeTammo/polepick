const fs = require('fs');
const path = require('path');
const utils = require('../utils');

function initializeDataFiles() {
    const dataPath = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataPath)) {
        utils.log('Data folder not found. Creating data folder');
        fs.mkdirSync(dataPath);
        utils.log('Data folder created.');
    }

    const requiredFiles = ['drivers.json', 'races.json', 'predictions.json', 'teams.json'];

    requiredFiles.forEach(file => {
        const filePath = path.join(dataPath, file);
        if (!fs.existsSync(filePath)) {
            utils.log(`${file} not found. Creating ${file}`);
            fs.writeFileSync(filePath, '[]', 'utf8');
            utils.log(`${file} created.`);
        }
    });
}

function loadData(file) {
    try {
        const data = fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        utils.error(`Error loading ${file}:`, err);
        return [];
    }
}

function saveData(file, data) {
    try {
        fs.writeFileSync(
            path.join(process.cwd(), 'data', file),
            JSON.stringify(data, null, 2),
            'utf8'
        );
        return true;
    } catch (err) {
        utils.error(`Error saving ${file}:`, err);
        return false;
    }
}

module.exports = {
    initializeDataFiles,
    loadData,
    saveData
};