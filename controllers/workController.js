const Work = require('../models/Work');

// @desc    Get all works
// @route   GET /api/works
// @access  Public
exports.getWorks = async (req, res) => {
  try {
    const { category, featured, published } = req.query;
    let query = {};

    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (published !== undefined) query.published = published === 'true';

    const works = await Work.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: works.length,
      data: works,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single work
// @route   GET /api/works/:id
// @access  Public
exports.getWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found',
      });
    }
    res.status(200).json({
      success: true,
      data: work,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new work
// @route   POST /api/works
// @access  Private
exports.createWork = async (req, res) => {
  try {
    // Log the incoming data for debugging
    console.log('Creating work with data:', req.body);

    const work = await Work.create(req.body);
    res.status(201).json({
      success: true,
      data: work,
    });
  } catch (error) {
    console.error('Error creating work:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update work
// @route   PUT /api/works/:id
// @access  Private
exports.updateWork = async (req, res) => {
  try {
    const work = await Work.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found',
      });
    }
    res.status(200).json({
      success: true,
      data: work,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete work
// @route   DELETE /api/works/:id
// @access  Private
exports.deleteWork = async (req, res) => {
  try {
    const work = await Work.findByIdAndDelete(req.params.id);
    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found',
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
