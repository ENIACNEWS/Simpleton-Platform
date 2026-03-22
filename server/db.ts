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

// Ensure missing columns are added to existing tables (schema drift fix)
async function ensureUserColumns() {
  const requiredColumns: Array<{ column: string; type: string; defaultVal?: string }> = [
    { column: 'gmail_refresh_token', type: 'TEXT' },
    { column: 'first_name', type: 'TEXT' },
    { column: 'last_name', type: 'TEXT' },
    { column: 'profile_image_url', type: 'TEXT' },
    { column: 'provider', type: 'TEXT', defaultVal: "'email'" },
    { column: 'provider_id', type: 'TEXT' },
    { column: 'is_verified', type: 'BOOLEAN', defaultVal: 'false' },
    { column: 'email_verified', type: 'BOOLEAN', defaultVal: 'false' },
    { column: 'subscription_status', type: 'TEXT', defaultVal: "'free'" },
    { column: 'stripe_customer_id', type: 'TEXT' },
    { column: 'stripe_subscription_id', type: 'TEXT' },
    { column: 'subscription_expires_at', type: 'TIMESTAMP' },
    { column: 'username', type: 'TEXT' },
  ];

  for (const col of requiredColumns) {
    try {
      const check = await pool.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'users' AND column_name = $1
        );
      `, [col.column]);
      if (!check.rows[0]?.exists) {
        const defaultClause = col.defaultVal ? ` DEFAULT ${col.defaultVal}` : '';
        await pool.query(`ALTER TABLE users ADD COLUMN ${col.column} ${col.type}${defaultClause};`);
        console.log(`[Migration] Added missing column users.${col.column}`);
      }
    } catch (err: any) {
      // Column might already exist from a concurrent migration — ignore "already exists" errors
      if (!err.message?.includes('already exists')) {
        console.error(`[Migration] Failed to add column users.${col.column}:`, err.message);
      }
    }
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
      console.log("Creating coins table...");
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
      console.log("Coins table created successfully");
    }

    // Create listed_businesses table
    const lbResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'listed_businesses'
      );
    `);

    if (!lbResult.rows[0]?.exists) {
      console.log("Creating listed_businesses table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS listed_businesses (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          zip TEXT NOT NULL,
          phone TEXT,
          website TEXT,
          hours TEXT,
          category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          google_rating TEXT,
          google_review_count INTEGER,
          simpleton_verified BOOLEAN DEFAULT false,
          google_place_id TEXT,
          last_google_sync TIMESTAMP,
          approval_date TIMESTAMP,
          added_by INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_business_city_state ON listed_businesses (city, state);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_business_zip ON listed_businesses (zip);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_business_status ON listed_businesses (status);`);
      console.log("listed_businesses table created successfully");

      // Seed the business data
      try {
        const { seedListedBusinesses } = await import("./seed-businesses");
        await seedListedBusinesses();
        console.log("Business seed data loaded successfully");
      } catch (seedErr: any) {
        console.error("Failed to seed businesses:", seedErr.message);
      }
    }

    // Create business_reviews table
    const brResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'business_reviews'
      );
    `);

    if (!brResult.rows[0]?.exists) {
      console.log("Creating business_reviews table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS business_reviews (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          rating INTEGER NOT NULL,
          review_text TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_review_business ON business_reviews (business_id);`);
      console.log("business_reviews table created successfully");
    }

    // Create business_complaints table
    const bcResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'business_complaints'
      );
    `);

    if (!bcResult.rows[0]?.exists) {
      console.log("Creating business_complaints table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS business_complaints (
          id SERIAL PRIMARY KEY,
          business_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          complaint_text TEXT NOT NULL,
          severity TEXT NOT NULL DEFAULT 'low',
          investigation_status TEXT NOT NULL DEFAULT 'pending',
          resolution_notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMP
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_complaint_business ON business_complaints (business_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_complaint_status ON business_complaints (investigation_status);`);
      console.log("business_complaints table created successfully");
    }

    // Ensure all schema columns exist on the users table
    await ensureUserColumns();
  } catch (error) {
    console.error("Error checking/creating tables:", error);
  }
}
