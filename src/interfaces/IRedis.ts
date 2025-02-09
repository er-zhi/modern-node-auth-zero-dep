export interface IRedis {
  set(key: string, value: string, ttlSeconds?: number): void;
  get(key: string): string | null;
  del(key: string): boolean;
}
