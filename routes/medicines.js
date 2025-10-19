const express = require('express')
const router = express.Router()
const medicineController = require('../controllers/medicineController')

router.get('/search', medicineController.searchMedicine)
router.post('/', medicineController.createMedicine)
router.get('/', medicineController.getAllMedicines)
router.get('/:id', medicineController.getMedicine)
router.put('/:id', medicineController.updateMedicine)
router.delete('/:id', medicineController.deleteMedicine)

module.exports = router