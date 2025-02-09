import { createServer } from 'http';
import { AuthController } from './auth/auth.controller.ts';
import { AuthService } from './auth/auth.service.ts';
import { TokenService } from './token/token.service.ts';
import { Database } from './database/database.ts';
import { JWT } from './utils/JWT.ts';
import { Redis } from './redis/fake-redis.ts';
import { UserService } from './user/user.service.ts';

function createAuthController(): AuthController { // factory
  const db = Database.getInstance();
  return new AuthController(
    new AuthService(
      new UserService(db),
      new TokenService(new JWT(process.env.JWT_ACCESS_SECRET!, process.env.JWT_REFRESH_SECRET!)),
      new Redis(db)
    )
  );
}

const authController = createAuthController();

const server = createServer((req, res) => authController.handleRequest(req, res));

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${process.env.PORT}`);
});
