const fs = require('fs');

const sitemapPath = 'public/sitemap.xml';
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/snaplinks\.app/g, 'snaplinks.in');

// Add new pages to sitemap
sitemap = sitemap.replace('</urlset>', `  <url>
    <loc>https://snaplinks.in/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://snaplinks.in/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://snaplinks.in/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
fs.writeFileSync(sitemapPath, sitemap);

const robotsPath = 'public/robots.txt';
let robots = fs.readFileSync(robotsPath, 'utf8');
robots = robots.replace(/snaplinks\.app/g, 'snaplinks.in');
fs.writeFileSync(robotsPath, robots);

const indexPath = 'index.html';
let index = fs.readFileSync(indexPath, 'utf8');
index = index.replace(/snaplinks\.app/g, 'snaplinks.in');
fs.writeFileSync(indexPath, index);

console.log("Done");
