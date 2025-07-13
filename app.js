const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');

const dataService = require('./services/dataService');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const errorRoutes = require('./routes/error');
const utils = require('./utils');
const hbsHelpers = require('./helpers/hbsHelpers');

require('dotenv').config();
const app = express();

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

app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

app.use(errorRoutes.notFoundHandler);
app.use(errorRoutes.errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    utils.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
