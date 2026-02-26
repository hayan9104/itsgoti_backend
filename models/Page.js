const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add page name'],
      unique: true,
      enum: ['home', 'about', 'approach', 'work', 'case-study', 'contact', 'landing', 'footer', 'landing-page-2'],
    },
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    heroImage: {
      type: String,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    published: {
      type: Boolean,
      default: true,
    },
    redirectTo: {
      type: String,
      default: null,
      // When a page is hidden, redirect users to this page instead
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Page', pageSchema);
