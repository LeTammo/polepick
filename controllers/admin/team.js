const teamModel = require('../../models/team');
const utils = require('../../utils');

function getTeams(req, res) {
    try {
        const teams = teamModel.getAllTeams();

        res.render('admin/teams', {
            useAdminHeader: true,
            adminRoutes: utils.getAdminRoutes(),
            pageTitle: 'Manage Teams',
            teams
        });
    } catch (error) {
        utils.error('Error rendering teams page:', error);
        res.status(500).render('error', {
            message: 'An error occurred loading the teams data'
        });
    }
}

function createTeam(req, res) {
    try {
        const { name, nameLong, color } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Team name is required'
            });
        }

        const newTeam = teamModel.createTeam({ name, nameLong, color });

        if (!newTeam) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create team'
            });
        }

        res.json({
            success: true,
            team: newTeam
        });
    } catch (error) {
        utils.error('Error creating team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating the team'
        });
    }
}

function updateTeam(req, res) {
    try {
        const id = req.params.id;
        const { name, nameLong, color } = req.body;

        if (!id || !name) {
            return res.status(400).json({
                success: false,
                message: 'Team ID and name are required'
            });
        }

        const success = teamModel.updateTeam(id, { name, nameLong, color });

        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update team'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error updating team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating the team'
        });
    }
}

function deleteTeam(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Team ID is required'
            });
        }

        const success = teamModel.deleteTeam(id);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or could not be deleted'
            });
        }

        res.json({ success: true });
    } catch (error) {
        utils.error('Error deleting team:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the team'
        });
    }
}

module.exports = {
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam
};