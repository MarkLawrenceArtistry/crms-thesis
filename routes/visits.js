const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

// The primary route for creating a new patient visit
router.post('/', visitController.createVisit);
router.get('/:id/details', visitController.getVisitDetails);

module.exports = router;