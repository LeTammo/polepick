const raceModel = require("../../models/race");
const predictionModel = require("../../models/prediction");
const scoreService = require("../../services/scoreService");
const utils = require("../../utils");

function getLeaderboardPage(req, res) {
    try {
        const races = raceModel.getRaces();
        const predictions = predictionModel.getPredictions();

        const allUsers = [...new Set(predictions.map(p => p.username))];

        const leaderboard = allUsers.map(username => {
            return {
                username,
                totalPoints: 0,
                racePoints: [],
                totalPredictions: 0,
                averagePoints: null
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
                    user.totalPoints += points.points;
                    user.totalPredictions += 1;
                    user.racePoints.push({
                        raceId: race.id,
                        raceName: race.name,
                        points
                    });
                }
            });
        });

        leaderboard.forEach(user => {
            if (user.totalPredictions >= 3) {
                user.averagePoints = user.totalPoints / user.totalPredictions;
            }
        });

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
                return b.totalPoints - a.totalPoints; // fallback
            }
        });

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
                entry.rank = null;
                entry.isTied = false;
                entry.isTopThree = false;
                entry.rankBackgroundColor = 'bg-gray-300';
            }
        });

        res.render('user/leaderboard', {
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
    getLeaderboardPage,
};
