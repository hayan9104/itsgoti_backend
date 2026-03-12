const express = require('express');
const router = express.Router();
const {
  getCaseStudies,
  getCaseStudy,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} = require('../controllers/caseStudyController');
const { protect } = require('../middleware/auth');

router.route('/').get(getCaseStudies).post(protect, createCaseStudy);
router
  .route('/:slug')
  .get(getCaseStudy)
  .put(protect, updateCaseStudy)
  .delete(protect, deleteCaseStudy);

module.exports = router;
