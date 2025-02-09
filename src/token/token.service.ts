import type { ITokenService, JWTPayload, IJWT } from '../interfaces/index.ts';

export class TokenService  implements ITokenService {
  private jwt: IJWT;

  constructor(jwt: IJWT) {
    this.jwt = jwt;
  }

  /** ✅ Sign access token */
  signAccessToken(payload: JWTPayload): string {
    return this.jwt.sign(payload);
  }

  /** ✅ Sign refresh token */
  signRefreshToken(payload: JWTPayload): string {
    return this.jwt.sign(payload, true);
  }

  /** ✅ Verify if the token is valid */
  verify(token: string): boolean {
    return this.jwt.verify(token);
  }

  /** ✅ Verify if the refresh token is valid */
  verifyRefreshToken(refreshToken: string): boolean {
    return this.jwt.verify(refreshToken, true);
  }

  /** ✅ Decode token safely */
  decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = this.jwt.decode(token) as JWTPayload | null;

      // Ensure the decoded object has a valid ID
      if (decoded && typeof decoded.id === 'number') {
        return decoded;
      }

      console.error('❌ Invalid decoded token:', decoded);
      return null;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }
}
