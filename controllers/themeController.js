const Theme = require('../models/Theme');
const Page = require('../models/Page');

// @desc    Get live theme's code (public, no auth)
// @route   GET /api/themes/live-code
// @access  Public
exports.getLiveThemeCode = async (req, res) => {
  try {
    const theme = await Theme.findOne({ isLive: true }).select('themeCode name');
    res.json({
      success: true,
      data: { themeCode: theme?.themeCode || 'default' },
    });
  } catch (error) {
    res.json({ success: true, data: { themeCode: 'default' } });
  }
};

// @desc    Get all themes (auto-creates default live theme if none exist)
// @route   GET /api/themes
// @access  Private
exports.getThemes = async (req, res) => {
  try {
    let themes = await Theme.find()
      .select('-pages')
      .sort({ isLive: -1, updatedAt: -1 });

    // Auto-create default live theme from existing pages if no themes exist
    if (themes.length === 0) {
      console.log('No themes found. Auto-creating default live theme...');
      try {
        // Clean up any broken theme docs first
        await Theme.deleteMany({});

        const allPages = await Page.find();
        console.log(`Found ${allPages.length} pages to import`);

        const pages = {};
        for (const page of allPages) {
          pages[page.name] = {
            title: page.title || '',
            subtitle: page.subtitle || '',
            heroImage: page.heroImage || '',
            content: page.content || {},
            seo: page.seo || {},
            published: page.published !== false,
            redirectTo: page.redirectTo || null,
          };
        }

        const newTheme = new Theme({
          name: 'Live Theme',
          isLive: true,
          pages,
          customCSS: '',
          config: {},
        });
        await newTheme.save();
        console.log(`Created live theme: ${newTheme._id}`);

        // Re-fetch after creation
        themes = await Theme.find()
          .select('-pages')
          .sort({ isLive: -1, updatedAt: -1 });
      } catch (autoCreateErr) {
        console.error('Auto-create theme failed:', autoCreateErr);
      }
    }

    res.status(200).json({
      success: true,
      count: themes.length,
      data: themes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single theme
// @route   GET /api/themes/:id
// @access  Private
exports.getTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }
    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create theme (from scratch or by migrating current pages)
// @route   POST /api/themes
// @access  Private
exports.createTheme = async (req, res) => {
  try {
    const { name, migrateFromPages } = req.body;

    let pages = {};

    if (migrateFromPages) {
      // Migrate existing Page model data into this theme
      const allPages = await Page.find();
      for (const page of allPages) {
        pages[page.name] = {
          title: page.title || '',
          subtitle: page.subtitle || '',
          heroImage: page.heroImage || '',
          content: page.content || {},
          seo: page.seo || {},
          published: page.published !== false,
          redirectTo: page.redirectTo || null,
        };
      }
    }

    // First theme is automatically live
    const existingThemes = await Theme.countDocuments();
    const shouldBeLive = existingThemes === 0 ? true : (req.body.isLive || false);

    const theme = await Theme.create({
      name,
      themeCode: req.body.themeCode || 'default',
      isLive: shouldBeLive,
      pages,
      customCSS: req.body.customCSS || '',
      config: req.body.config || {},
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Duplicate a theme
// @route   POST /api/themes/:id/duplicate
// @access  Private
exports.duplicateTheme = async (req, res) => {
  try {
    const sourceTheme = await Theme.findById(req.params.id);
    if (!sourceTheme) {
      return res.status(404).json({
        success: false,
        message: 'Source theme not found',
      });
    }

    // Generate unique name: "Copy of X", "Copy of X (2)", "Copy of X (3)", etc.
    let baseName = req.body.name || `Copy of ${sourceTheme.name}`;
    let newName = baseName;
    let counter = 1;

    // Check if name already exists and find a unique one
    while (await Theme.findOne({ name: newName })) {
      counter++;
      newName = `${baseName} (${counter})`;
    }

    const newTheme = await Theme.create({
      name: newName,
      themeCode: sourceTheme.themeCode || 'default',
      isLive: false, // Duplicates are always drafts
      pages: JSON.parse(JSON.stringify(sourceTheme.pages || {})),
      customCSS: sourceTheme.customCSS || '',
      config: JSON.parse(JSON.stringify(sourceTheme.config || {})),
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      data: newTheme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Publish a theme (make it live)
// @route   PUT /api/themes/:id/publish
// @access  Private
exports.publishTheme = async (req, res) => {
  try {
    // Unset current live theme
    await Theme.updateMany({ isLive: true }, { isLive: false });

    // Set new live theme
    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      { isLive: true },
      { new: true }
    ).select('-pages');

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update theme metadata (name, customCSS, config)
// @route   PUT /api/themes/:id
// @access  Private
exports.updateTheme = async (req, res) => {
  try {
    const { name, customCSS, config, thumbnail, themeCode } = req.body;

    // Check for duplicate name if name is being updated
    if (name !== undefined) {
      const existingTheme = await Theme.findOne({
        name: name,
        _id: { $ne: req.params.id } // Exclude current theme
      });
      if (existingTheme) {
        return res.status(400).json({
          success: false,
          message: 'A theme with this name already exists',
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (customCSS !== undefined) updateData.customCSS = customCSS;
    if (config !== undefined) updateData.config = config;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (themeCode !== undefined) updateData.themeCode = themeCode;

    const theme = await Theme.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-pages');

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete theme (cannot delete live theme)
// @route   DELETE /api/themes/:id
// @access  Private
exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    if (theme.isLive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the live theme. Publish another theme first.',
      });
    }

    await Theme.findByIdAndDelete(req.params.id);

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

// @desc    Get a specific page's content from a theme
// @route   GET /api/themes/:id/pages/:pageName
// @access  Public (for preview) / Private check done via themeId
exports.getThemePage = async (req, res) => {
  try {
    const { id, pageName } = req.params;

    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    const pageData = theme.pages?.[pageName];
    if (!pageData) {
      return res.status(404).json({
        success: false,
        message: `Page "${pageName}" not found in this theme`,
      });
    }

    // Return in same format as Page model for compatibility
    res.status(200).json({
      success: true,
      data: {
        name: pageName,
        ...pageData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a specific page's content in a theme
// @route   PUT /api/themes/:id/pages/:pageName
// @access  Private
exports.updateThemePage = async (req, res) => {
  try {
    const { id, pageName } = req.params;

    const theme = await Theme.findById(id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    // Initialize pages object if needed
    if (!theme.pages) {
      theme.pages = {};
    }

    // Merge with existing page data
    const existingPageData = theme.pages[pageName] || {};
    theme.pages[pageName] = {
      ...existingPageData,
      ...req.body,
    };

    // Mark the mixed field as modified
    theme.markModified('pages');
    await theme.save();

    res.status(200).json({
      success: true,
      data: {
        name: pageName,
        ...theme.pages[pageName],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all pages from a theme (for theme pull)
// @route   GET /api/themes/:id/all-pages
// @access  Private
exports.getThemeAllPages = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: theme._id,
        name: theme.name,
        isLive: theme.isLive,
        pages: theme.pages || {},
        customCSS: theme.customCSS || '',
        config: theme.config || {},
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Push all pages to a theme (for theme push from CLI)
// @route   PUT /api/themes/:id/all-pages
// @access  Private
exports.pushThemeAllPages = async (req, res) => {
  try {
    const { pages, customCSS, config } = req.body;

    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Theme not found',
      });
    }

    if (pages) {
      theme.pages = pages;
      theme.markModified('pages');
    }
    if (customCSS !== undefined) {
      theme.customCSS = customCSS;
    }
    if (config !== undefined) {
      theme.config = config;
      theme.markModified('config');
    }

    await theme.save();

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      data: {
        id: theme._id,
        name: theme.name,
        isLive: theme.isLive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
