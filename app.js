require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const dataService = require('./services/dataService');
const routes = require('./routes');
const utils = require("./utils");

const app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

dataService.initializeDataFiles();

routes(app);

module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    utils.log(`Server running on http://localhost:${PORT}`);
});