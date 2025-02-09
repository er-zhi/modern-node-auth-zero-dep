import { createServer } from 'http';
import { authRoutes } from './auth/auth.routes.ts';
import { IncomingMessage, ServerResponse } from 'node:http';

// Required Environment Variables
const REQUIRED_ENV_VARS = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SALT_ROUNDS', 'PORT',
];

// Function to Check Credentials Before Starting Server
function checkEnvVariables() {
  const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    console.error(`Missing environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// Check environment variables before starting the server
checkEnvVariables();

const server = createServer((req, res) => {
  const { url, method } = req;

  if (method === 'POST' && url && url in authRoutes) { // Method POST hardcoded!!!
    (authRoutes as Record<string, (req: IncomingMessage, res: ServerResponse) => void>)[url](req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
