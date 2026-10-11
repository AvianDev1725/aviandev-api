import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import { db } from '../src/db/index.js';

describe('database', () => {
  it('has the posts table', async () => {
    const result = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableNames = result.rows.map((row) => row.table_name);

    expect(tableNames).toContain('posts');
  });
});