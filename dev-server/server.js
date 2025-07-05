import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function createServer() {
  const app = express();

  try {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      root: projectRoot,
      server: { middlewareMode: true },
      appType: 'spa',
      plugins: [
        {
          name: 'simple-react',
          configureServer(server) {
            // Ensure proper MIME types
            server.middlewares.use((req, res, next) => {
              if (req.url?.endsWith('.js') || req.url?.endsWith('.jsx') || req.url?.endsWith('.ts') || req.url?.endsWith('.tsx')) {
                res.setHeader('Content-Type', 'application/javascript');
              }
              if (req.url?.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
              }
              next();
            });
          }
        }
      ]
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const port = 8030;
    app.listen(port, () => {
      console.log(`🚀 Dev server running at http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

createServer();
