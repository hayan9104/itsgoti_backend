const express = require('express');
const router = express.Router();
const {
  getPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
} = require('../controllers/pageController');
const { protect } = require('../middleware/auth');

router.route('/').get(getPages).post(protect, createPage);
router
  .route('/:name')
  .get(getPage)
  .put(protect, updatePage)
  .delete(protect, deletePage);

module.exports = router;
