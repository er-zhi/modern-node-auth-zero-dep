import { AuthService } from './auth.service.ts';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async signUp(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', async () => {
      const { username, password } = JSON.parse(body);

      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Username and password are required' }));
      }

      const user = this.authService.signUp(username, password);

      if (!user) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Username already taken' }));
      }

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user)); // { id, accessToken, refreshToken }
    });
  }

  async login(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', async () => {
      const { username, password } = JSON.parse(body);

      if (!username || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }

      const tokens = this.authService.login(username, password);

      if (!tokens) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tokens)); // { accessToken, refreshToken }
    });
  }

  async refreshToken(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', async () => {
      const { refreshToken } = JSON.parse(body);

      if (!refreshToken) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Refresh token is required' }));
      }

      const tokens = this.authService.refresh(refreshToken);

      if (!tokens) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid refresh token' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tokens)); // { accessToken, refreshToken }
    });
  }

  async logout(req: any, res: any) {
    let body = '';
    req.on('data', (chunk: Buffer) => (body += chunk.toString()));
    req.on('end', async () => {

      try {
        const { accessToken, refreshToken } = JSON.parse(body);

        if (!accessToken || !refreshToken) {
          console.error('Logout Error: Missing tokens');
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Access and refresh tokens are required' }));
        }

        const success = this.authService.logout(accessToken, refreshToken);

        if (!success) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Failed to logout' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User logged out successfully' }));
      } catch (error) {
        console.error('Logout Error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
  }


  async profile(req: any, res: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }));
    }

    const token = authHeader.split(' ')[1];

    const userData = this.authService.verifyAccessToken(token);

    if (!userData) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: userData.id, username: userData.username }));
  }
}
