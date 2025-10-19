const express = require('express')
const router = express.Router()
const patientController = require('../controllers/patientController')

router.get('/search', patientController.searchPatient)
router.post('/', patientController.createPatient)
router.get('/', patientController.getAllPatients)
router.get('/:id', patientController.getPatient)
router.put('/:id', patientController.updatePatient)
router.delete('/:id', patientController.deletePatient)

module.exports = router