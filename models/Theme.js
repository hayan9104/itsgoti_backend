const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a theme name'],
      trim: true,
    },
    themeCode: {
      type: String,
      default: 'default',
      trim: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    pages: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customCSS: {
      type: String,
      default: '',
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Theme', themeSchema);
