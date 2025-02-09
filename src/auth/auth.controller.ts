import { IncomingMessage, ServerResponse } from 'http';
import type { IAuthService } from '../interfaces/index.ts';

export class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const { url, method } = req;

    // Define allowed routes
    const routes: Record<string, (req: IncomingMessage, res: ServerResponse) => Promise<void>> = {
      '/signup': this.signUp.bind(this),
      '/login': this.login.bind(this),
      '/logout': this.logout.bind(this),
      '/refresh': this.refreshToken.bind(this),
      '/profile': this.profile.bind(this),
    };

    // ✅ Match route, else return 404
    if (method === 'POST' && url && routes[url]) {
      return routes[url](req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Not Found' }));
    }
  }

  async signUp(req: IncomingMessage, res: ServerResponse) {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { username, password } = JSON.parse(body);
        if (!username || !password) {
          return this.sendError(res, 400, 'Username and password are required');
        }

        const user = this.authService.signUp(username, password);
        if (!user) return this.sendError(res, 400, 'Username already taken');

        this.sendResponse(res, 201, user);
      } catch (error) {
        this.sendError(res, 400, 'Invalid request body');
      }
    });
  }

  async login(req: IncomingMessage, res: ServerResponse) {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { username, password } = JSON.parse(body);
        if (!username || !password) return this.sendError(res, 400, 'Invalid credentials');

        const tokens = this.authService.login(username, password);
        if (!tokens) return this.sendError(res, 401, 'Unauthorized');

        this.sendResponse(res, 200, tokens);
      } catch (error) {
        this.sendError(res, 400, 'Invalid request body');
      }
    });
  }

  async refreshToken(req: IncomingMessage, res: ServerResponse) {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { refreshToken } = JSON.parse(body);
        if (!refreshToken) return this.sendError(res, 400, 'Refresh token is required');

        const tokens = this.authService.refresh(refreshToken);
        if (!tokens) return this.sendError(res, 401, 'Invalid refresh token');

        this.sendResponse(res, 200, tokens);
      } catch (error) {
        this.sendError(res, 400, 'Invalid request body');
      }
    });
  }

  async logout(req: IncomingMessage, res: ServerResponse) {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { accessToken, refreshToken } = JSON.parse(body);
        if (!accessToken || !refreshToken) return this.sendError(res, 400, 'Access and refresh tokens are required');

        const success = this.authService.logout(accessToken, refreshToken);
        if (!success) return this.sendError(res, 400, 'Failed to logout');

        this.sendResponse(res, 200, { message: 'User logged out successfully' });
      } catch (error) {
        this.sendError(res, 400, 'Invalid request body');
      }
    });
  }

  async profile(req: IncomingMessage, res: ServerResponse) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return this.sendError(res, 401, 'Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    const userData = this.authService.verifyAccessToken(token);

    if (!userData) {
      return this.sendError(res, 401, 'Unauthorized: Invalid or expired token');
    }

    this.sendResponse(res, 200, { id: userData.id, username: userData.username });
  }

  private sendResponse(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  private sendError(res: ServerResponse, statusCode: number, message: string) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}
