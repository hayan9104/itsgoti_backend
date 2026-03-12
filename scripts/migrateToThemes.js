/**
 * Migration Script: Move existing Page data into the first Theme
 *
 * Run: node scripts/migrateToThemes.js
 *
 * This creates a "Default Theme" with isLive: true containing all
 * existing page content from the Page collection.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Use Google DNS (same as config/db.js)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Theme = require('../models/Theme');
const Page = require('../models/Page');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if any themes already exist
    const existingThemes = await Theme.find();
    if (existingThemes.length > 0) {
      console.log(`Found ${existingThemes.length} existing theme(s). Cleaning up before migration...`);
      await Theme.deleteMany({});
      console.log('Cleaned up old themes.');
    }

    // Get all existing pages
    const allPages = await Page.find();
    console.log(`Found ${allPages.length} pages to migrate`);

    // Build pages object for theme
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
      console.log(`  - Migrated page: ${page.name}`);
    }

    // Create the default live theme
    const theme = await Theme.create({
      name: 'Default Theme',
      isLive: true,
      pages,
      customCSS: '',
      config: {},
    });

    console.log(`\nCreated live theme: "${theme.name}" (ID: ${theme._id})`);
    console.log(`Contains ${Object.keys(pages).length} pages`);
    console.log('\nMigration complete! The page API will now read from this theme.');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();
