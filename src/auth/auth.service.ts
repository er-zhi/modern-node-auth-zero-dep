import type { IAuthService, IRedis, ITokenService, IUserService } from '../interfaces/index.ts';

export class AuthService implements IAuthService {
  private userService: IUserService;
  private tokenService: ITokenService;
  private redis: IRedis;

  constructor(userService: IUserService, tokenService: ITokenService, redis: IRedis) {
    this.userService = userService;
    this.tokenService = tokenService;
    this.redis = redis;
  }

  /** ✅ Sign up a new user */
  signUp(username: string, password: string): { id: number; accessToken: string; refreshToken: string } | null {
    const hashedPassword = this.userService.hashPassword(password);
    const user = this.userService.createUser(username, hashedPassword);
    if (!user) return null;

    return this.generateTokens(user.id, username);
  }

  /** ✅ Log in an existing user */
  login(username: string, password: string): { accessToken: string; refreshToken: string } | null {
    const user = this.userService.getUserByUsername(username);
    if (!user || !this.userService.verifyPassword(password, user.password)) return null;

    return this.generateTokens(user.id, username);
  }

  /** ✅ Refresh access token */
  refresh(refreshToken: string): { accessToken: string; refreshToken: string } | null {
    if (!this.tokenService.verifyRefreshToken(refreshToken)) return null;

    const decoded = this.tokenService.decodeToken(refreshToken);
    if (!decoded || typeof decoded.id !== 'number') return null;

    const user = this.userService.getUserById(decoded.id);
    if (!user) return null;

    return this.generateTokens(user.id, user.username);
  }

  /** ✅ Logout and invalidate tokens */
  logout(accessToken: string, refreshToken: string): boolean {
    if (!accessToken || !refreshToken) return false;

    this.redis.set(accessToken, 'blacklisted', 3600); // Blacklist access token for 1 hour
    return this.userService.removeRefreshToken(refreshToken);
  }

  /** ✅ Verify access token using cache & fallback */
  verifyAccessToken(token: string) {
    const tokenStatus = this.redis.get(token); // ✅ Ensure this works

    if (tokenStatus === 'blacklisted') return null;
    if (tokenStatus === 'valid') {
      const decoded = this.tokenService.decodeToken(token);
      return decoded ? this.userService.getUserById(decoded.id) : null;
    }

    return this.tokenService.verify(token)
      ? this.userService.getUserById(this.tokenService.decodeToken(token)?.id!)
      : null;
  }

  /** ✅ Generate access & refresh tokens and store them */
  private generateTokens(userId: number, username: string) {
    const accessToken = this.tokenService.signAccessToken({ id: userId, username });
    const refreshToken = this.tokenService.signRefreshToken({ id: userId });

    this.redis.set(accessToken, 'valid', 600); // Store access token in cache
    this.userService.storeRefreshToken(userId, refreshToken); // Save refresh token in DB

    return { id: userId, accessToken, refreshToken };
  }
}
