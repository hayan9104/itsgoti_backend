const express = require('express');
const router = express.Router();
const {
  getWorks,
  getWork,
  createWork,
  updateWork,
  deleteWork,
} = require('../controllers/workController');
const { protect } = require('../middleware/auth');

router.route('/').get(getWorks).post(protect, createWork);
router
  .route('/:id')
  .get(getWork)
  .put(protect, updateWork)
  .delete(protect, deleteWork);

module.exports = router;
