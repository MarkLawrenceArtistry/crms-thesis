const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.get('/', queueController.getQueues);
router.post('/call-next', queueController.callNext);
router.get('/debug-all', queueController.debugGetAllQueues);
router.get('/now-serving', queueController.getNowServing);

module.exports = router;