import { createServer } from 'vite';

async function startDevServer() {
  try {
    const server = await createServer({
      server: {
        port: 8030,
        host: true
      }
    });
    
    await server.listen();
    server.printUrls();
    console.log('Dev server started successfully!');
  } catch (error) {
    console.error('Failed to start dev server:', error);
  }
}

startDevServer();
