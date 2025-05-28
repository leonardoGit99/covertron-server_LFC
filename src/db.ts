import { Pool } from 'pg';
import { db } from './config';

const pool = new Pool({
  connectionString: db.urldatabase,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

export default pool;
