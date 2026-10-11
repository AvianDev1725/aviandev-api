import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';

const mainUrl = parse(readFileSync('.env')).DATABASE_URL;

if (process.env.DATABASE_URL === mainUrl) {
  throw new Error('Tests are pointing at the MAIN database. Check .env.test.');
}

console.log('Testing against:', new URL(process.env.DATABASE_URL!).host);