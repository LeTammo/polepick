const raceModel = require("../../models/race");

function getHomePage(req, res) {
    const allRaces = raceModel.getPreparedRaces();
    
    // Split into upcoming and past
    const upcomingRaces = allRaces
        .filter(r => r.daysUntilRace !== null)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
    const pastRaces = allRaces
        .filter(r => r.daysUntilRace === null)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Determine highlight race (Next upcoming, or latest past if season over)
    let highlightRace = upcomingRaces.length > 0 ? upcomingRaces[0] : null;
    let previousRaces = pastRaces;

    // If no upcoming races, use the most recent past race as highlight
    if (!highlightRace && pastRaces.length > 0) {
        highlightRace = pastRaces[0];
        previousRaces = pastRaces.slice(1);
    }

    return res.render('user/home', { highlightRace, previousRaces });
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
