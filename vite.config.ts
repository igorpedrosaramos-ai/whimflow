import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGenerateDiagram } from './api/generate-diagram';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-generate-diagram-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/generate-diagram') && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', chunk => {
                bodyStr += chunk;
              });
              req.on('end', async () => {
                try {
                  const body = bodyStr ? JSON.parse(bodyStr) : {};
                  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                  const result = await handleGenerateDiagram(body, apiKey);
                  res.statusCode = result.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result.data));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Erro interno no middleware' }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    server: {
      port: 3000,
      host: true
    }
  };
});
