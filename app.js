
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars')
const dataService = require('./services/dataService');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const errorRoutes = require('./routes/error');
const utils = require("./utils");
const cookieParser = require('cookie-parser');

const app = express();
require('dotenv').config();

const hbsHelpers = {
    json: function (context) {
        return JSON.stringify(context);
    }
};

app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'base',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: hbsHelpers
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

dataService.initializeDataFiles();

userRoutes(app);
adminRoutes(app);
errorRoutes(app);

module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    utils.log(`Server running on http://localhost:${PORT}`);
});