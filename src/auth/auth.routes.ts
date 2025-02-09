import { AuthController } from './auth.controller.ts';
import { AuthService } from './auth.service.ts';
import { JWT } from '../utils/JWT.ts';
import { Redis } from '../redis/fake-redis.ts';

const jwt = new JWT(process.env.JWT_ACCESS_SECRET!, process.env.JWT_REFRESH_SECRET!);
const redis = new Redis();
const authService = new AuthService(jwt, redis);
const authController = new AuthController(authService);

export const authRoutes: Record<string, (req: any, res: any) => void> = {
  '/signup': (req, res) => authController.signUp(req, res),
  '/login': (req, res) => authController.login(req, res),
  '/logout': (req, res) => authController.logout(req, res),
  '/refresh': (req, res) => authController.refreshToken(req, res),
  '/profile': (req, res) => authController.profile(req, res)
};
