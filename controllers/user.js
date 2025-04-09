const raceModel = require('../models/race');
const predictionModel = require('../models/prediction');
const scoreService = require('../services/scoreService');
const utils = require('../utils');

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
                totalPredictions: 0
            };
        });

        races.forEach(r => {
            if (!r.predictionsEnded) {
                return;
            }
            const racePredictions = predictions.filter(p => p.raceId === r.id);
            const race = raceModel.getPreparedRace(r.id);

            racePredictions.forEach(prediction => {
                const points = scoreService.calculatePoints(prediction, race.result);
                const userIndex = leaderboard.findIndex(u => u.username === prediction.username);

                if (userIndex !== -1) {
                    leaderboard[userIndex].totalPoints += points;
                    leaderboard[userIndex].totalPredictions += 1;
                    leaderboard[userIndex].racePoints.push({
                        raceId: race.id,
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
    getRacePage,
    submitPrediction,
    getLeaderboardPage
};