import type { JWTPayload } from './JWTPayload.ts';

export interface ITokenService {
  signAccessToken(payload: JWTPayload): string;
  signRefreshToken(payload: JWTPayload): string;
  verify(token: string): boolean;
  verifyRefreshToken(refreshToken: string): boolean;
  decodeToken(token: string): JWTPayload | null;
}
