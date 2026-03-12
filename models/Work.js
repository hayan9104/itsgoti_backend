const mongoose = require('mongoose');

const workSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    image: {
      type: String,
      default: '',
    },
    // Tags shown on the card (e.g., "Lifestyle", "Fashion")
    tags: [{
      type: String,
    }],
    // Main category for filtering
    category: {
      type: String,
      enum: ['', 'Lifestyle', 'Branding', 'Fashion and Apparels', 'Fitness and Nutritions'],
      default: '',
    },
    client: {
      type: String,
    },
    link: {
      type: String,
    },
    // Service types (Website, Landing Pages, Applications, etc.)
    serviceTypes: [{
      type: String,
    }],
    technologies: [{
      type: String,
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Work', workSchema);
