// src/lib/db.ts
import { Pool } from 'pg';

let pool: Pool;

try {
  if (!process.env.POSTGRES_USER || !process.env.POSTGRES_HOST || !process.env.POSTGRES_DATABASE || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_PORT) {
    throw new Error('Missing PostgreSQL environment variables. Please check your .env file.');
  }
  pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    ssl: process.env.POSTGRES_HOST === 'localhost' ? false : { rejectUnauthorized: false }, // Basic SSL for non-localhost
  });

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    // May not be necessary to exit the process here for all applications
    // process.exit(-1); 
  });

  // Test the connection during initialization
  pool.query('SELECT NOW()')
    .then(res => console.log('Successfully connected to PostgreSQL. Server time:', res.rows[0].now))
    .catch(err => {
        console.error('Error connecting to PostgreSQL during initial test:', err.stack);
        // Optionally, re-throw or handle to prevent app startup if DB is critical
    });

} catch (error) {
  console.error('Failed to initialize PostgreSQL pool:', error);
  // Fallback to a dummy pool to prevent runtime errors if initialization fails.
  // Operations will fail gracefully.
  pool = {
    query: () => Promise.reject(new Error('PostgreSQL pool is not initialized or connection failed.')),
    // Add other Pool methods if they are directly called and need graceful failure
    connect: () => Promise.reject(new Error('PostgreSQL pool is not initialized or connection failed.')),
    end: () => Promise.resolve(),
  } as any as Pool; // Cast to Pool type, use with caution
}

export const db = {
  query: (text: string, params?: any[]) => {
    // Check if pool was initialized, especially if the catch block above was entered.
    if (!pool || typeof pool.query !== 'function') {
        console.error('PostgreSQL pool is not available. Initialization might have failed.');
        return Promise.reject(new Error('PostgreSQL pool is not available.'));
    }
    return pool.query(text, params);
  },
  // Expose connect method if direct client usage is needed, e.g., for transactions
  getClient: async () => {
    if (!pool || typeof pool.connect !== 'function') {
        console.error('PostgreSQL pool is not available for getting a client.');
        throw new Error('PostgreSQL pool is not available.');
    }
    const client = await pool.connect();
    const originalRelease = client.release;
    // Monkey patch release to log errors or handle specific scenarios
    client.release = (err?: Error | boolean) => {
        if (err && typeof err !== 'boolean') { // Check if err is an actual Error object
            console.error('Error releasing client', err);
        }
        return originalRelease.call(client, err as any); // Cast err as any if originalRelease expects boolean
    };
    return client;
  }
};
