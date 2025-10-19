const express = require('express')
const router = express.Router()
const appointmentsController = require('../controllers/appointmentsController')

router.post('/', appointmentsController.createAppointment)
router.get('/', appointmentsController.getAllAppointments)
router.get('/:patient_id', appointmentsController.getAllAppointmentsFromPatient)
router.put('/:id', appointmentsController.updateAppointment)
router.delete('/:id', appointmentsController.deleteAppointment)

module.exports = router