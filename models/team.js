const dataService = require('../services/dataService');
const utils = require('../utils');

function getAllTeams() {
    return dataService.loadData('teams.json');
}

function getTeamById(teamId) {
    const teams = getAllTeams();
    return teams.find(team => team.id === teamId) || null;
}

function getTeamNameById(teamId) {
    const team = getTeamById(teamId);
    return team ? team.name : 'Unknown Team';
}

function createTeam(teamData) {
    try {
        const teams = getAllTeams();
        const newId = teams.length > 0
            ? (parseInt(teams[teams.length - 1].id) + 1).toString()
            : "1";

        const newTeam = {
            id: newId,
            name: teamData.name,
            color: teamData.color || '#cccccc',
            color_dark: teamData.color_dark || '#999999'
        };

        teams.push(newTeam);
        return dataService.saveData('teams.json', teams) ? newTeam : null;
    } catch (error) {
        utils.error('Error creating team:', error);
        return null;
    }
}

function updateTeam(teamId, teamData) {
    try {
        const teams = getAllTeams();
        const index = teams.findIndex(t => t.id === teamId);

        if (index === -1) return false;

        teams[index] = {
            ...teams[index],
            name: teamData.name,
            color: teamData.color || teams[index].color,
            color_dark: teamData.color_dark || teams[index].color_dark
        };

        return dataService.saveData('teams.json', teams);
    } catch (error) {
        utils.error('Error updating team:', error);
        return false;
    }
}

function deleteTeam(teamId) {
    try {
        const teams = getAllTeams();
        const filteredTeams = teams.filter(t => t.id !== teamId);

        if (filteredTeams.length === teams.length) {
            return false; // No team was removed
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
    getTeamNameById,
    createTeam,
    updateTeam,
    deleteTeam
};