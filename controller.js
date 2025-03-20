const raceModel = require('./models/race');
const resultModel = require('./models/result');
const predictionModel = require('./models/prediction');
const scoreService = require('./services/scoreService');
const utils = require('./utils');

function getHomePage(req, res) {
    const latestRace = raceModel.getLatestRace();

    if (!latestRace) {
        return res.status(404).render('error', {
            message: 'No races found'
        });
    }

    return res.redirect(`/race/${latestRace.id}`);
}

function getRacePage(req, res) {
    try {
        const raceId = req.params.id;
        const race = raceModel.getFormattedRace(raceId);
        const races = raceModel.getAllRaces();

        if (!race) {
            return res.status(404).render('error', {
                message: 'Race not found'
            });
        }

        const drivers = raceModel.getRaceDrivers(raceId);
        const result = resultModel.getFormattedResult(raceId);
        const predictions = predictionModel.getFormattedPredictions(raceId);
        const username = req.cookies[`polepick-username-for-race-${raceId}`];

        let userPrediction = predictions.find(p => p.username === username);
        userPrediction = userPrediction ? { ...userPrediction, isUserPrediction: true } : null;

        res.render('index', {
            pageTitle: `${race.name} - Prediction`,
            race: race,
            races: races,
            drivers: drivers,
            result: result,
            predictions: predictions.filter(p => p.username !== username),
            userPrediction: userPrediction,
            predictionsJson: JSON.stringify(predictions),
            hasResult: !!result
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
        const race = raceModel.getRaceById(raceId);

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
        const results = resultModel.getAllResults();
        const predictions = predictionModel.getAllPredictions();

        const allUsers = [...new Set(predictions.map(p => p.username))];

        const leaderboard = allUsers.map(username => {
            return {
                username,
                totalPoints: 0,
                racePoints: [],
                totalPredictions: 0
            };
        });

        results.forEach(result => {
            const raceId = result.raceId;
            const race = raceModel.getFormattedRace(raceId);
            const racePredictions = predictions.filter(p => p.raceId === raceId);

            racePredictions.forEach(prediction => {
                const points = scoreService.calculatePoints(prediction, result);
                const userIndex = leaderboard.findIndex(u => u.username === prediction.username);

                if (userIndex !== -1) {
                    leaderboard[userIndex].totalPoints += points;
                    leaderboard[userIndex].totalPredictions += 1;
                    leaderboard[userIndex].racePoints.push({
                        raceId,
                        raceName: race.name,
                        points
                    });
                }
            });
        });

        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

        let currentRank = 1;
        let previousPoints = -1;
        let tieCount = 0;

        leaderboard.forEach((entry, index) => {
            if (index > 0 && entry.totalPoints === previousPoints) {
                entry.rank = currentRank;
                entry.isTied = true;
                tieCount++;
            } else {
                currentRank = index + 1;
                entry.rank = currentRank;
                entry.isTied = false;
                tieCount = 0;
            }

            previousPoints = entry.totalPoints;

            entry.isTopThree = entry.rank <= 3;
            if (entry.rank === 1) {
                entry.rankBackgroundColor = 'bg-yellow-500';
            } else if (entry.rank === 2) {
                entry.rankBackgroundColor = 'bg-gray-400';
            } else if (entry.rank === 3) {
                entry.rankBackgroundColor = 'bg-amber-600';
            }
        });

        const racesWithResults = results.map(r => r.raceId);
        const enhancedRaces = races.map(race => ({
            ...race,
            formattedDate: utils.formatDate(race.date),
            hasResult: racesWithResults.includes(race.id)
        }));

        res.render('leaderboard', {
            pageTitle: 'Polepick - Leaderboard',
            leaderboard,
            races: enhancedRaces
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
    getRacePage,
    submitPrediction,
    getLeaderboardPage
};