const raceModel = require('../models/race');
const predictionModel = require('../models/prediction');
const scoreService = require('../services/scoreService');
const utils = require('../utils');

function getHomePage(req, res) {
    const races = raceModel.getPreparedRaces().reverse();

    return res.render('pages/home', { races })
}

function getNextRace(req, res) {
    const latestRace = raceModel.getLatestRace();
    if (!latestRace) {
        return res.status(404).render('error', { message: 'No races found' });
    }

    return res.redirect(`/race/${latestRace.id}`);
}

function getRacePage(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.getPreparedRace(raceId);
        const races = raceModel.getAllRaces();

        if (!race) {
            return res.status(404).render('error', {
                message: 'Race not found'
            });
        }


        const predictions = predictionModel.getPreparedPredictions(raceId);
        const username = req.cookies[`polepick-username-for-race-${raceId}`];

        let userPrediction = predictions.find(p => p.username === username);
        userPrediction = userPrediction ? { ...userPrediction, isUserPrediction: true } : null;

        res.render('pages/main', {
            race: race,
            races: races,
            predictions: predictions.filter(p => p.username !== username),
            userPrediction: userPrediction,
            predictionsJson: JSON.stringify(predictions),
            hasResult: !!race.result,
        });
    } catch (error) {
        utils.error('Error rendering race page: ', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the race data'
        });
    }
}

function submitPrediction(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.findRaceById(raceId);

        if (!race) {
            return res.status(400).json({
                success: false,
                message: 'Race not found'
            });
        }

        if (race.predictionsEnded) {
            return res.status(400).json({
                success: false,
                message: 'Predictions have ended for this race'
            });
        }

        const { username, first, second, third, others } = req.body;
        utils.log(`${username} made a prediction for race #${raceId}`);

        const success = predictionModel.createOrUpdatePrediction(raceId, {
            username, first, second, third, others
        });

        if (!success) {
            utils.error('Failed to save prediction:\nusername:', username, '\nfirst:', first, '\nsecond:', second, '\nthird:', third, '\nothers:', others);
            return res.status(400).json({
                success: false,
                message: 'Failed to save prediction'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error submitting prediction:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your prediction'
        });
    }
}

function getLeaderboardPage(req, res) {
    try {
        const races = raceModel.getAllRaces();
        const predictions = predictionModel.findAllPredictions();

        const allUsers = [...new Set(predictions.map(p => p.username))];

        const leaderboard = allUsers.map(username => {
            return {
                username,
                totalPoints: 0,
                racePoints: [],
                totalPredictions: 0,
                averagePoints: null // init
            };
        });

        races.forEach(r => {
            if (!r.predictionsEnded) return;

            const racePredictions = predictions.filter(p => p.raceId === r.id);
            const race = raceModel.getPreparedRace(r.id);

            racePredictions.forEach(prediction => {
                const points = scoreService.calculatePoints(prediction, race.result);
                const userIndex = leaderboard.findIndex(u => u.username === prediction.username);

                if (userIndex !== -1) {
                    const user = leaderboard[userIndex];
                    user.totalPoints += points;
                    user.totalPredictions += 1;
                    user.racePoints.push({
                        raceId: race.id,
                        raceName: race.name,
                        points
                    });
                }
            });
        });

        // Calculate averagePoints (only for users with 3+ predictions)
        leaderboard.forEach(user => {
            if (user.totalPredictions >= 3) {
                user.averagePoints = user.totalPoints / user.totalPredictions;
            }
        });

        // Sort by: 1) has averagePoints (i.e. totalPredictions >= 3), 2) averagePoints desc
        leaderboard.sort((a, b) => {
            const aEligible = a.averagePoints !== null;
            const bEligible = b.averagePoints !== null;

            if (aEligible && bEligible) {
                return b.averagePoints - a.averagePoints;
            } else if (aEligible) {
                return -1; // a before b
            } else if (bEligible) {
                return 1; // b before a
            } else {
                return b.totalPoints - a.totalPoints; // fallback for ineligible
            }
        });

        // Rank assignment only for eligible users (3+ predictions)
        let currentRank = 1;
        let previousAvg = -1;
        leaderboard.forEach((entry, index) => {
            if (entry.averagePoints !== null) {
                if (entry.averagePoints === previousAvg) {
                    entry.rank = currentRank;
                    entry.isTied = true;
                } else {
                    currentRank = index + 1;
                    entry.rank = currentRank;
                    entry.isTied = false;
                }

                previousAvg = entry.averagePoints;

                entry.isTopThree = entry.rank <= 3;
                if (entry.rank === 1) {
                    entry.rankBackgroundColor = 'bg-yellow-500';
                } else if (entry.rank === 2) {
                    entry.rankBackgroundColor = 'bg-gray-400';
                } else if (entry.rank === 3) {
                    entry.rankBackgroundColor = 'bg-amber-600';
                }
            } else {
                // Ineligible for ranking
                entry.rank = null;
                entry.isTied = false;
                entry.isTopThree = false;
                entry.rankBackgroundColor = 'bg-gray-300'; // for greying out
            }
        });

        res.render('leaderboard', {
            pageTitle: 'Polepick - Leaderboard',
            leaderboard,
            races: races,
        });
    } catch (error) {
        utils.error('Error rendering leaderboard page: ', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the leaderboard'
        });
    }
}

module.exports = {
    getHomePage,
    getNextRace,
    getRacePage,
    submitPrediction,
    getLeaderboardPage
};