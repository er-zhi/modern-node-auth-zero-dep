export interface JWTPayload {
  id: number;
  username?: string;
  exp?: number;
}
