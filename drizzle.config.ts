import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';


dotenv.config();

const connectionString = process.env.DATABASE_URL || '';
const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = connectionString.match(regex);

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: match
    ? {
        host: match[3],
        port: parseInt(match[4]),
        user: match[1],
        password: match[2],
        database: match[5],
      }
    : {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'Vvm@2025',
        database: 'socially_app',
        ssl: false,
      },
}); 