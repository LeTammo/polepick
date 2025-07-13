const express = require('express');
const router = express.Router();
const apiController = require('../controllers/admin/api');

router.get('/push/vapid-key', apiController.getVapidKey);
router.post('/push/subscribe', apiController.subscribe);

module.exports = router;