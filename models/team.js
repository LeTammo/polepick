const dataService = require('../services/dataService');
const utils = require('../utils');

function getAllTeams() {
    return dataService.loadData('teams.json');
}

function getTeamById(teamId) {
    const teams = getAllTeams();
    return teams.find(team => team.id === teamId) || null;
}

function createTeam({ name, nameLong, color }) {
    try {
        const teams = getAllTeams();
        const id = teams.length > 0
            ? (parseInt(teams[teams.length - 1].id) + 1).toString()
            : "1";

        const newTeam = { id, name, nameLong, color };

        teams.push(newTeam);
        return dataService.saveData('teams.json', teams) ? newTeam : null;
    } catch (error) {
        utils.error('Error creating team:', error);
        return null;
    }
}

function updateTeam(id, data) {
    try {
        const teams = getAllTeams();
        const index = teams.findIndex(t => t.id === id);

        if (index === -1) return false;

        teams[index] = {
            ...teams[index],
            name: data.name || teams[index].name,
            nameLong: data.nameLong || teams[index].nameLong,
            color: data.color || teams[index].color,
        };

        return dataService.saveData('teams.json', teams);
    } catch (error) {
        utils.error('Error updating team:', error);
        return false;
    }
}

function deleteTeam(id) {
    try {
        const teams = getAllTeams();
        const filteredTeams = teams.filter(t => t.id !== id);

        if (filteredTeams.length === teams.length) {
            return false;
        }

        return dataService.saveData('teams.json', filteredTeams);
    } catch (error) {
        utils.error('Error deleting team:', error);
        return false;
    }
}

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
};