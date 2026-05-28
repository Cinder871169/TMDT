const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const News = require('../models/News');

const BASE_URL = process.env.CLIENT_URL || 'https://sneakerzone.online';

// Generate XML sitemap
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all products and news for dynamic URLs
    const [products, news] = await Promise.all([
      Product.find({}).select('_id updatedAt').lean(),
      News.find({}).select('_id updatedAt').lean(),
    ]);

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/news', priority: '0.8', changefreq: 'weekly' },
      { url: '/vouchers', priority: '0.7', changefreq: 'weekly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    // Static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Product pages
    products.forEach(product => {
      const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : today;
      sitemap += `
  <url>
    <loc>${BASE_URL}/product/${product._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // News/Blog pages
    news.forEach(article => {
      const lastmod = article.updatedAt ? new Date(article.updatedAt).toISOString().split('T')[0] : today;
      sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${article._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += '\n</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
