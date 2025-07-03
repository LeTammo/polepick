const raceModel = require("../../models/race");

function getHomePage(req, res) {
    const races = raceModel.getPreparedRaces().reverse();

    return res.render('user/home', { races })
}

function getNextRace(req, res) {
    const latestRace = raceModel.getLatestRace();
    if (!latestRace) {
        return res.status(404).render('error', { message: 'No races found' });
    }

    return res.redirect(`/race/${latestRace.id}`);
}

module.exports = {
    getHomePage,
    getNextRace
};
