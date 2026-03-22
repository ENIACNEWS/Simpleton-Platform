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
          WHERE table_schema = 'public'
            AND table_name = 'users'
            AND column_name = $1
        );
      `, [col.column]);

      if (!check.rows[0]?.exists) {
        const defaultClause = col.defaultVal ? ` DEFAULT ${col.defaultVal}` : '';
        await pool.query(`ALTER TABLE users ADD COLUMN ${col.column} ${col.type}${defaultClause};`);
        console.log(`[Migration] Added missing column users.${col.column}`);
      }
    } catch (err: any) {
      if (!err.message?.includes('already exists')) {
        console.error(`[Migration] Failed to add column users.${col.column}:`, err.message);
      }
    }
  }
}

// Helper to check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    );
  `, [tableName]);
  return result.rows[0]?.exists || false;
}

// Seed rapaport prices from locked grid data
async function seedRapaportPrices() {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM rapaport_prices');
    if (parseInt(countResult.rows[0]?.count || '0') > 0) {
      console.log('[Seed] rapaport_prices already has data, skipping seed');
      return;
    }

    console.log('[Seed] Seeding rapaport_prices from RAPAPORT_GRID_LOCKED...');
    const { RAPAPORT_GRID_LOCKED } = await import("@shared/rapaport-grid-lock");
    const { PEAR_PRICING_GRID_LOCKED } = await import("@shared/pear-pricing-grid-lock");

    let insertCount = 0;

    // Seed round brilliant prices
    for (const [caratRange, colors] of Object.entries(RAPAPORT_GRID_LOCKED)) {
      for (const [color, clarities] of Object.entries(colors as any)) {
        for (const [clarity, price] of Object.entries(clarities as any)) {
          await pool.query(
            `INSERT INTO rapaport_prices (shape, carat_range, color_grade, clarity_grade, price, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            ['round', caratRange, color, clarity, price as number, 'system-seed']
          );
          insertCount++;
        }
      }
    }

    // Seed pear/fancy shape prices
    for (const [caratRange, colors] of Object.entries(PEAR_PRICING_GRID_LOCKED)) {
      for (const [color, clarities] of Object.entries(colors as any)) {
        for (const [clarity, price] of Object.entries(clarities as any)) {
          await pool.query(
            `INSERT INTO rapaport_prices (shape, carat_range, color_grade, clarity_grade, price, updated_by)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            ['pear', caratRange, color, clarity, price as number, 'system-seed']
          );
          insertCount++;
        }
      }
    }

    console.log(`[Seed] Inserted ${insertCount} rapaport price entries`);
  } catch (err: any) {
    console.error('[Seed] Failed to seed rapaport prices:', err.message);
  }
}

// Manual table creation for cases where drizzle-kit is not available
export async function ensureTablesExist() {
  try {
    // ==================== COINS TABLE ====================
    if (!(await tableExists('coins'))) {
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

    // ==================== LISTED BUSINESSES TABLE ====================
    if (!(await tableExists('listed_businesses'))) {
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

      try {
        const { seedListedBusinesses } = await import("./seed-businesses");
        await seedListedBusinesses();
        console.log("Business seed data loaded successfully");
      } catch (seedErr: any) {
        console.error("Failed to seed businesses:", seedErr.message);
      }
    }

    // ==================== BUSINESS REVIEWS TABLE ====================
    if (!(await tableExists('business_reviews'))) {
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

    // ==================== BUSINESS COMPLAINTS TABLE ====================
    if (!(await tableExists('business_complaints'))) {
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

    // ==================== RAPAPORT PRICES TABLE ====================
    if (!(await tableExists('rapaport_prices'))) {
      console.log("Creating rapaport_prices table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rapaport_prices (
          id SERIAL PRIMARY KEY,
          shape TEXT NOT NULL DEFAULT 'round',
          carat_range TEXT NOT NULL,
          color_grade TEXT NOT NULL,
          clarity_grade TEXT NOT NULL,
          price INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT NOW(),
          updated_by TEXT DEFAULT 'system'
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_rap_shape ON rapaport_prices (shape);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_rap_carat ON rapaport_prices (carat_range);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_rap_lookup ON rapaport_prices (shape, carat_range, color_grade, clarity_grade);`);
      console.log("rapaport_prices table created successfully");
      await seedRapaportPrices();
    }

    // ==================== GLOBAL DIAMOND PRICES TABLE ====================
    if (!(await tableExists('global_diamond_prices'))) {
      console.log("Creating global_diamond_prices table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS global_diamond_prices (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          carat_bracket TEXT,
          price_per_carat DECIMAL(10,2),
          typical_grades TEXT,
          updated_at TIMESTAMP DEFAULT NOW(),
          updated_by TEXT DEFAULT 'system',
          source TEXT DEFAULT 'manual'
        );
      `);
      console.log("global_diamond_prices table created successfully");
    }

    // ==================== DIAMOND CALCULATOR SETTINGS TABLE ====================
    if (!(await tableExists('diamond_calculator_settings'))) {
      console.log("Creating diamond_calculator_settings table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS diamond_calculator_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          pricing_system TEXT DEFAULT 'rapaport',
          lab_grown_percentage DECIMAL(5,2) DEFAULT 0,
          loan_percentage DECIMAL(5,2) DEFAULT 70,
          wholesale_percentage DECIMAL(5,2) DEFAULT 80,
          percentage_locked BOOLEAN DEFAULT false,
          grid_data JSONB,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_dcs_user ON diamond_calculator_settings (user_id);`);
      console.log("diamond_calculator_settings table created successfully");
    }

    // ==================== CALCULATION HISTORY TABLE ====================
    if (!(await tableExists('calculation_history'))) {
      console.log("Creating calculation_history table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS calculation_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          metal TEXT,
          karat TEXT,
          purity DECIMAL(5,4),
          weight DECIMAL(10,4),
          unit TEXT DEFAULT 'grams',
          spot_price DECIMAL(12,2),
          melt_value DECIMAL(12,2),
          price_type TEXT DEFAULT 'bid',
          calculated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_calc_user ON calculation_history (user_id);`);
      console.log("calculation_history table created successfully");
    }

    // ==================== API KEYS TABLE ====================
    if (!(await tableExists('api_keys'))) {
      console.log("Creating api_keys table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id SERIAL PRIMARY KEY,
          key_id TEXT NOT NULL UNIQUE,
          key_secret TEXT NOT NULL UNIQUE,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          tier TEXT NOT NULL DEFAULT 'free',
          requests_per_minute INTEGER NOT NULL DEFAULT 10,
          requests_per_day INTEGER NOT NULL DEFAULT 1000,
          requests_per_month INTEGER NOT NULL DEFAULT 10000,
          allowed_endpoints TEXT[] DEFAULT ARRAY['pricing', 'ticker'],
          allowed_origins TEXT[],
          is_active BOOLEAN NOT NULL DEFAULT true,
          last_used TIMESTAMP,
          expires_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_key_id ON api_keys (key_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id);`);
      console.log("api_keys table created successfully");
    }

    // ==================== REVENUE PHASES TABLE ====================
    if (!(await tableExists('revenue_phases'))) {
      console.log("Creating revenue_phases table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS revenue_phases (
          id SERIAL PRIMARY KEY,
          phase_number INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          status TEXT DEFAULT 'upcoming',
          revenue_target DECIMAL(12,2) DEFAULT 0,
          actual_revenue DECIMAL(12,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("revenue_phases table created successfully");
    }

    // ==================== DOCUMENT PURCHASES TABLE ====================
    if (!(await tableExists('document_purchases'))) {
      console.log("Creating document_purchases table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS document_purchases (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          document_type TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          stripe_payment_id TEXT,
          status TEXT DEFAULT 'completed',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("document_purchases table created successfully");
    }

    // ==================== DAILY USAGE TABLE ====================
    if (!(await tableExists('daily_usage'))) {
      console.log("Creating daily_usage table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS daily_usage (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          api_calls INTEGER DEFAULT 0,
          calculations INTEGER DEFAULT 0,
          page_views INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("daily_usage table created successfully");
    }

    // ==================== SITE VISITORS TABLE ====================
    if (!(await tableExists('site_visitors'))) {
      console.log("Creating site_visitors table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_visitors (
          id SERIAL PRIMARY KEY,
          session_id TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          page_url TEXT,
          referrer TEXT,
          country TEXT,
          city TEXT,
          device_type TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("site_visitors table created successfully");
    }

    // ==================== GHOST CONVERSATIONS TABLE ====================
    if (!(await tableExists('ghost_conversations'))) {
      console.log("Creating ghost_conversations table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ghost_conversations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          session_id TEXT NOT NULL,
          title TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("ghost_conversations table created successfully");
    }

    // ==================== GHOST MESSAGES TABLE ====================
    if (!(await tableExists('ghost_messages'))) {
      console.log("Creating ghost_messages table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ghost_messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("ghost_messages table created successfully");
    }

    // ==================== PRICE ALERTS TABLE ====================
    if (!(await tableExists('price_alerts'))) {
      console.log("Creating price_alerts table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS price_alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          metal TEXT NOT NULL,
          target_price DECIMAL(12,2) NOT NULL,
          direction TEXT NOT NULL DEFAULT 'above',
          is_active BOOLEAN DEFAULT true,
          triggered_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("price_alerts table created successfully");
    }

    // ==================== MARKET TRANSACTIONS TABLE ====================
    if (!(await tableExists('market_transactions'))) {
      console.log("Creating market_transactions table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS market_transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          metal TEXT NOT NULL,
          transaction_type TEXT NOT NULL,
          quantity DECIMAL(10,4) NOT NULL,
          price_per_unit DECIMAL(12,2) NOT NULL,
          total_amount DECIMAL(12,2) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("market_transactions table created successfully");
    }

    // ==================== MARKET PREDICTIONS TABLE ====================
    if (!(await tableExists('market_predictions'))) {
      console.log("Creating market_predictions table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS market_predictions (
          id SERIAL PRIMARY KEY,
          metal TEXT NOT NULL,
          prediction_type TEXT NOT NULL,
          predicted_price DECIMAL(12,2),
          confidence DECIMAL(5,2),
          timeframe TEXT,
          actual_price DECIMAL(12,2),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("market_predictions table created successfully");
    }

    // ==================== SIMPLETON INDEX TABLE ====================
    if (!(await tableExists('simpleton_index'))) {
      console.log("Creating simpleton_index table...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS simpleton_index (
          id SERIAL PRIMARY KEY,
          index_value DECIMAL(12,4) NOT NULL,
          components JSONB,
          calculated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("simpleton_index table created successfully");
    }

    // Ensure all schema columns exist on the users table
    await ensureUserColumns();

  } catch (error) {
    console.error("Error checking/creating tables:", error);
  }
}
