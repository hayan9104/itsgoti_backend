const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    client: {
      type: String,
      required: [true, 'Please add client name'],
    },
    clientLogo: {
      type: String,
    },
    clientLogoMobile: {
      type: String,
    },
    industry: {
      type: String,
    },
    platform: {
      type: String,
    },
    duration: {
      type: String,
    },
    projectFocus: [{
      type: String,
    }],
    services: [{
      type: String,
    }],
    heroImage: {
      type: String,
    },
    heroImageMobile: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    bannerImageMobile: {
      type: String,
    },
    collaborationTitle: {
      type: String,
      default: 'The Collaboration',
    },
    collaborationText: {
      type: String,
    },
    challenge: {
      type: String,
      required: [true, 'Please add the challenge'],
    },
    solution: {
      type: String,
      required: [true, 'Please add the solution'],
    },
    results: {
      type: String,
    },
    processSteps: [{
      number: String,
      title: String,
    }],
    opportunities: [{
      number: String,
      title: String,
      description: String,
    }],
    experienceTitle: {
      type: String,
      default: 'The Experience We Created',
    },
    experienceImages: [{
      type: String,
    }],
    experienceImagesMobile: [{
      type: String,
    }],
    experienceQuote: {
      type: String,
    },
    colorPalette: [{
      color: String,
      name: String,
    }],
    typography: {
      fontFamily: String,
      fontImage: String,
      fontImageMobile: String,
      characterSet: String,
    },
    metrics: [{
      label: String,
      value: String,
    }],
    images: [{
      type: String,
    }],
    imagesMobile: [{
      type: String,
    }],
    testimonial: {
      quote: String,
      author: String,
      position: String,
      image: String,
      imageMobile: String,
    },
    technologies: [{
      type: String,
    }],
    relatedProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CaseStudy',
    }],
    relatedWorks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Work',
    }],
    published: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
caseStudySchema.pre('save', async function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

module.exports = mongoose.model('CaseStudy', caseStudySchema);
