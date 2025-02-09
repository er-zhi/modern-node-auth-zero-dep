import { createHmac, timingSafeEqual } from 'crypto';

export interface JWTPayload {
  id: number;
  username?: string;
  exp?: number;
}

export class JWT {
  private algorithm: string;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(accessSecret: string, refreshSecret: string) {
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.algorithm = 'sha256';
  }

  sign(payload: JWTPayload, isRefresh: boolean = false, expiresIn: number = 3600): string {
    const secret = isRefresh ? this.refreshSecret : this.accessSecret;
    const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn })
    ).toString('base64url');

    const signature = createHmac(this.algorithm, Buffer.from(secret, 'utf-8'))
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  verify(token: string, isRefresh: boolean = false): boolean {
    if (!token.includes('.')) return false;

    const secret = isRefresh ? this.refreshSecret : this.accessSecret;
    const parts = token.split('.');

    if (parts.length !== 3) return false;

    const [header, body, signature] = parts;

    const expectedSignature = createHmac(this.algorithm, Buffer.from(secret, 'utf-8'))
      .update(`${header}.${body}`)
      .digest('base64url');

    return timingSafeEqual(Buffer.from(signature, 'utf-8'), Buffer.from(expectedSignature, 'utf-8'));
  }

  decode(token: string): JWTPayload | null {
    try {
      const [_, body] = token.split('.');
      return JSON.parse(Buffer.from(body, 'base64url').toString()) as JWTPayload;
    } catch {
      return null;
    }
  }
}
