const express = require('express');
const router = express.Router();
const {
  getLiveThemeCode,
  getThemes,
  getTheme,
  createTheme,
  duplicateTheme,
  publishTheme,
  updateTheme,
  deleteTheme,
  getThemePage,
  updateThemePage,
  getThemeAllPages,
  pushThemeAllPages,
} = require('../controllers/themeController');
const { protect } = require('../middleware/auth');

// Public: get live theme code (no auth needed for frontend rendering)
router.get('/live-code', getLiveThemeCode);

// All other theme routes require authentication
router.use(protect);

router.route('/').get(getThemes).post(createTheme);

router.route('/:id').get(getTheme).put(updateTheme).delete(deleteTheme);

router.post('/:id/duplicate', duplicateTheme);
router.put('/:id/publish', publishTheme);

// Per-page content within a theme
router.route('/:id/pages/:pageName').get(getThemePage).put(updateThemePage);

// Bulk operations (for CLI pull/push)
router.route('/:id/all-pages').get(getThemeAllPages).put(pushThemeAllPages);

module.exports = router;
