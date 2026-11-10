import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  readonly port: number;
  readonly nodeEnv: string;
  readonly corsOrigin: string;
  readonly databaseUrl: string;
  readonly jwtSecret: string;
}

function parsePort(rawPort: string | undefined): number {
  const parsed = Number(rawPort ?? 4000);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 4000;
}

export const env: EnvConfig = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
};
