export interface IJWT {
  sign(payload: object, isRefresh?: boolean, expiresIn?: number): string;
  verify(token: string, isRefresh?: boolean): boolean;
  decode<T>(token: string): T | null;
}
