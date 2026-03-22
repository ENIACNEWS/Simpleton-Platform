import { db } from '../server/db';
import { listedBusinesses } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const result = await db.update(listedBusinesses).set({ status: 'approved' }).where(eq(listedBusinesses.status, 'pending'));
  console.log('Approved all pending businesses');
  const count = await db.select({ id: listedBusinesses.id }).from(listedBusinesses);
  console.log('Total businesses in list:', count.length);
  process.exit(0);
}
run();
