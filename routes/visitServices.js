const express = require('express');
const router = express.Router();
const visitServiceController = require('../controllers/visitServiceController');

router.get('/:visit_id', visitServiceController.getServicesForVisit);
router.put('/:id/status', visitServiceController.updateVisitServiceStatus);

module.exports = router;