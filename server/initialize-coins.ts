import { db } from "./db";
import { coins } from "@shared/schema";

// Quick function to check if coins exist and initialize if needed
async function initializeCoins() {
  console.log("🔍 Checking coin database...");
  
  try {
    // Check if coins exist
    const existingCoins = await db.select().from(coins).limit(1);
    
    if (existingCoins.length === 0) {
      console.log("⚠️  No coins found - database needs to be seeded");
      console.log("💡 Run: npm run seed-coins or npx tsx server/seed-coins.ts");
      return false;
    } else {
      console.log("✅ Coins database is populated");
      return true;
    }
  } catch (error) {
    console.error("❌ Error checking coins:", error);
    return false;
  }
}

// Export for use in routes
export { initializeCoins };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeCoins().then(() => process.exit(0)).catch((error) => {
    console.error("Failed to check coins:", error);
    process.exit(1);
  });
}