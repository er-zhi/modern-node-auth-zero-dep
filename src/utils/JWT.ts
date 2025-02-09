import { createHmac, timingSafeEqual } from 'crypto';
import type { IJWT } from "../interfaces/IJWT.ts";
import type { JWTPayload } from '../interfaces/JWTPayload.ts';

export class JWT implements IJWT {
  private algorithm: string;
  private readonly accessSecret: Buffer;
  private readonly refreshSecret: Buffer;

  constructor(accessSecret: string, refreshSecret: string) {
    this.accessSecret = Buffer.from(accessSecret, 'utf-8');
    this.refreshSecret = Buffer.from(refreshSecret, 'utf-8');
    this.algorithm = 'sha256';
  }

  sign(payload: JWTPayload, isRefresh: boolean = false, expiresIn: number = 3600): string {
    const secret = isRefresh ? this.refreshSecret : this.accessSecret;
    const header = this.base64Encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = this.base64Encode(
      JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn })
    );

    const signature = createHmac(this.algorithm, secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  verify(token: string, isRefresh: boolean = false): boolean {
    if (!token || token.split('.').length !== 3) return false;

    const secret = isRefresh ? this.refreshSecret : this.accessSecret;
    const [header, body, signature] = token.split('.');

    try {
      const expectedSignature = createHmac(this.algorithm, secret)
        .update(`${header}.${body}`)
        .digest('base64url');

      return this.safeCompare(signature, expectedSignature);
    } catch {
      return false;
    }
  }

  decode<T>(token: string): T | null {
    try {
      const [, body] = token.split('.');
      return JSON.parse(this.base64Decode(body)) as T;
    } catch {
      return null;
    }
  }

  private base64Encode(data: string): string {
    return Buffer.from(data).toString('base64url');
  }

  private base64Decode(data: string): string {
    return Buffer.from(data, 'base64url').toString();
  }

  private safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
