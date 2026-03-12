const CaseStudy = require('../models/CaseStudy');

// @desc    Get all case studies
// @route   GET /api/case-studies
// @access  Public
exports.getCaseStudies = async (req, res) => {
  try {
    const { published, industry } = req.query;
    let query = {};

    if (published !== undefined) query.published = published === 'true';
    if (industry) query.industry = industry;

    const caseStudies = await CaseStudy.find(query).sort({
      order: 1,
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      count: caseStudies.length,
      data: caseStudies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single case study
// @route   GET /api/case-studies/:slug
// @access  Public
exports.getCaseStudy = async (req, res) => {
  try {
    let caseStudy;

    // Check if it's an ObjectId or slug
    if (req.params.slug.match(/^[0-9a-fA-F]{24}$/)) {
      caseStudy = await CaseStudy.findById(req.params.slug).populate('relatedWorks');
    } else {
      caseStudy = await CaseStudy.findOne({ slug: req.params.slug }).populate('relatedWorks');
    }

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: 'Case study not found',
      });
    }
    res.status(200).json({
      success: true,
      data: caseStudy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new case study
// @route   POST /api/case-studies
// @access  Private
exports.createCaseStudy = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.create(req.body);
    res.status(201).json({
      success: true,
      data: caseStudy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update case study
// @route   PUT /api/case-studies/:slug
// @access  Private
exports.updateCaseStudy = async (req, res) => {
  try {
    let caseStudy;
    const identifier = req.params.slug;

    // Check if it's an ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      caseStudy = await CaseStudy.findByIdAndUpdate(
        identifier,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      caseStudy = await CaseStudy.findOneAndUpdate(
        { slug: identifier },
        req.body,
        { new: true, runValidators: true }
      );
    }

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: 'Case study not found',
      });
    }
    res.status(200).json({
      success: true,
      data: caseStudy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete case study
// @route   DELETE /api/case-studies/:slug
// @access  Private
exports.deleteCaseStudy = async (req, res) => {
  try {
    let caseStudy;
    const identifier = req.params.slug;

    // Check if it's an ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      caseStudy = await CaseStudy.findByIdAndDelete(identifier);
    } else {
      caseStudy = await CaseStudy.findOneAndDelete({ slug: identifier });
    }

    if (!caseStudy) {
      return res.status(404).json({
        success: false,
        message: 'Case study not found',
      });
    }
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
