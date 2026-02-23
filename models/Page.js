const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add page name'],
      unique: true,
      enum: ['home', 'about', 'approach', 'work', 'case-study', 'contact', 'landing', 'footer'],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Page', pageSchema);
