import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

async function setupVite(app, server) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios']
    }
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
}

function serveStatic(app) {
  const distPath = path.resolve(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export { setupVite, serveStatic, log };