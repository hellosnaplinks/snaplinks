const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

content = content.replace(
  "import { defineConfig } from 'vite';",
  "import { defineConfig } from 'vite';\nimport { VitePWA } from 'vite-plugin-pwa';"
);

const pwaPlugin = `    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-icon.jpg'],
      manifest: {
        name: 'SnapLinks',
        short_name: 'SnapLinks',
        description: 'End-to-End Encrypted P2P Chat',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          {
            src: '/logo-icon.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: '/logo-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: '/logo-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })`;

content = content.replace(
  "  plugins: [react()],",
  "  plugins: [\n    react(),\n" + pwaPlugin + "\n  ],"
);

fs.writeFileSync('vite.config.ts', content);
console.log("Done");
