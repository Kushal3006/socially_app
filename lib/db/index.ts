import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Parse connection string or use direct credentials
const connectionString = process.env.DATABASE_URL;

// Initialize postgres client
const getClient = () => {
  try {
    const client = connectionString 
      ? postgres(connectionString, { ssl: false }) // Disable SSL
      : postgres({
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'Vvm@2025',
          database: process.env.DB_NAME || 'socially_app',
          ssl: false,
        });
    
    console.log("Database connection established successfully");
    return client;
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
};

// Create client
const client = getClient();

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

// Export schema for type safety
export { schema }; 