const Page = require('../models/Page');
const Theme = require('../models/Theme');

// Helper: Get page data from the live theme (if themes exist)
const getPageFromTheme = async (pageName, themeId) => {
  try {
    let theme;
    if (themeId) {
      // Specific theme requested (for preview/editor)
      theme = await Theme.findById(themeId);
    } else {
      // Get live theme
      theme = await Theme.findOne({ isLive: true });
    }

    if (theme && theme.pages && theme.pages[pageName]) {
      const pageData = theme.pages[pageName];
      return {
        name: pageName,
        title: pageData.title || '',
        subtitle: pageData.subtitle || '',
        heroImage: pageData.heroImage || '',
        content: pageData.content || {},
        seo: pageData.seo || {},
        published: pageData.published !== false,
        redirectTo: pageData.redirectTo || null,
        updatedAt: theme.updatedAt,
        _themeId: theme._id,
        _themeName: theme.name,
      };
    }
    return null;
  } catch (err) {
    return null;
  }
};

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
exports.getPages = async (req, res) => {
  try {
    const themeId = req.query.themeId;

    // Try theme system first
    let theme;
    if (themeId) {
      theme = await Theme.findById(themeId);
    } else {
      theme = await Theme.findOne({ isLive: true });
    }

    if (theme && theme.pages) {
      const pageNames = Object.keys(theme.pages);
      const pagesData = pageNames.map((name) => ({
        name,
        ...theme.pages[name],
        _id: `${theme._id}_${name}`,
        updatedAt: theme.updatedAt,
      }));

      return res.status(200).json({
        success: true,
        count: pagesData.length,
        data: pagesData,
        _themeId: theme._id,
      });
    }

    // Fallback to Page model
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
    const themeId = req.query.themeId;

    // Try theme system first
    const themePageData = await getPageFromTheme(req.params.name, themeId);
    if (themePageData) {
      return res.status(200).json({
        success: true,
        data: themePageData,
      });
    }

    // Fallback to Page model
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
