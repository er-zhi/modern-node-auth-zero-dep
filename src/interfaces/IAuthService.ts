export interface IAuthService {
  signUp(username: string, password: string): { id: number; accessToken: string; refreshToken: string } | null;
  login(username: string, password: string): { accessToken: string; refreshToken: string } | null;
  refresh(refreshToken: string): { accessToken: string; refreshToken: string } | null;
  logout(accessToken: string, refreshToken: string): boolean;
  verifyAccessToken(token: string): { id: number; username: string } | null;
}
