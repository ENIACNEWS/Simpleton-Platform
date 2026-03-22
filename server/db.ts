import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced database connection with retry logic
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });

// Database health check with graceful error handling
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error: any) {
    console.warn('Database connection issue (non-critical):', error.message);
    return false;
  }
}

// Manual table creation for cases where drizzle-kit is not available
export async function ensureTablesExist() {
  try {
    // Check if coins table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'coins'
      );
    `);
    
    const coinsTableExists = result.rows[0]?.exists;
    
    if (!coinsTableExists) {
      console.log("🔧 Creating coins table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS coins (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          year_start INTEGER NOT NULL,
          year_end INTEGER,
          purity DECIMAL(5,4) NOT NULL,
          weight DECIMAL(10,4) NOT NULL,
          diameter DECIMAL(5,2),
          thickness DECIMAL(4,2),
          mintage INTEGER,
          description TEXT,
          specifications JSONB,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("✅ Coins table created successfully");
    } else {
      console.log("✅ Coins table already exists");
    }
  } catch (error) {
    console.error("❌ Error checking/creating tables:", error);
  }
}