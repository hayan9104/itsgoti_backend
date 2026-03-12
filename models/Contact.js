const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
    },
    company: {
      type: String,
    },
    companyName: {
      type: String,
    },
    service: {
      type: String,
    },
    subject: {
      type: String,
      default: 'Contact Form Inquiry',
    },
    source: {
      type: String,
    },
    sourcePage: {
      type: String,
      enum: ['Contact Page', 'Landing Page', 'Landing Page 2', 'Landing Page 3'],
      default: 'Contact Page',
    },
    message: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    replied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contact', contactSchema);
