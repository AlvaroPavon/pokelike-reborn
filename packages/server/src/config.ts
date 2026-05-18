/**
 * Server configuration loaded from environment variables with safe defaults.
 *
 * @module
 */

export interface ServerConfig {
  /** Port the server listens on (default: 3001) */
  port: number;
  /** Host interface to bind to (default: 0.0.0.0) */
  host: string;
  /** Base URL for the PokeAPI REST service */
  pokeApiBaseUrl: string;
  /** Cache TTL in milliseconds for PokeAPI responses (default: 1 hour) */
  cacheTtlMs: number;
  /** Secret key used to sign and verify JWT tokens */
  jwtSecret: string;
  /** JWT token expiration duration (default: "7d") */
  jwtExpiresIn: string;
  /** JSON file path used by the MVP persistent user store */
  userStorePath: string;
  /** Allowed frontend origin for Socket.io CORS */
  frontendOrigin: string;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  host: process.env.HOST ?? "0.0.0.0",
  pokeApiBaseUrl: "https://pokeapi.co/api/v2",
  cacheTtlMs: 60 * 60 * 1000, // 1 hour
  jwtSecret: process.env.JWT_SECRET ?? "pokelike-reborn-dev-secret-key-2026",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  userStorePath: process.env.USER_STORE_PATH ?? "data/users.json",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
} as const;
