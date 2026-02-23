const express = require('express');
const router = express.Router();
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public route - contact form submission
router.route('/').get(protect, getContacts).post(createContact);

// Private routes - admin only
router
  .route('/:id')
  .get(protect, getContact)
  .put(protect, updateContact)
  .delete(protect, deleteContact);

module.exports = router;
