const Page = require('../models/Page');

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find();
    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single page by name
// @route   GET /api/pages/:name
// @access  Public
exports.getPage = async (req, res) => {
  try {
    const page = await Page.findOne({ name: req.params.name });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }
    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create or update page
// @route   POST /api/pages
// @access  Private
exports.createPage = async (req, res) => {
  try {
    const { name } = req.body;

    let page = await Page.findOne({ name });

    if (page) {
      // Update existing page
      page = await Page.findOneAndUpdate({ name }, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      // Create new page
      page = await Page.create(req.body);
    }

    res.status(201).json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update page (creates if doesn't exist)
// @route   PUT /api/pages/:name
// @access  Private
exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findOneAndUpdate(
      { name: req.params.name },
      { ...req.body, name: req.params.name }, // Include name for upsert
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );
    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete page
// @route   DELETE /api/pages/:name
// @access  Private
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findOneAndDelete({ name: req.params.name });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
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
