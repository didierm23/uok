// src/config/database.js
const { Sequelize } = require('sequelize');

const {
  DB_HOST,
  DB_PORT = 5432,
  DB_NAME,
  DB_USER,
  DB_PASS,
  NODE_ENV = 'development'
} = process.env;

if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASS) {
  console.warn('Missing one or more DB environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASS).');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Render requires SSL; this also works for many managed Postgres providers.
    ssl: {
      require: true,
      // For many managed providers you must set rejectUnauthorized false.
      rejectUnauthorized: false
    }
  }
});

// Test connection helper
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message || error);
    return false;
  }
};

// Helper to sync models
const syncModels = async (options = { alter: true }) => {
  try {
    // alter: true updates existing tables to match models (safe-ish for dev)
    // use force: true only if you want to drop and recreate tables
    await sequelize.sync(options);
    console.log('✅ Models synchronized with the database.');
  } catch (err) {
    console.error('❌ Failed to synchronize models:', err);
    throw err;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncModels
};
// =====================================================Local database.js commented below

// // src/config/database.js
// // =====================================================
// // DATABASE CONNECTION CONFIGURATION
// // =====================================================
// // This file sets up the connection to PostgreSQL database
// // We use connection pooling for better performance

// // Import the pg (node-postgres) library
// // pg is the PostgreSQL client for Node.js
// const { Pool } = require('pg');

// // Import dotenv to load environment variables from .env file
// // This keeps sensitive information (like passwords) out of our code
// require('dotenv').config();

// // =====================================================
// // WHAT IS A CONNECTION POOL?
// // =====================================================
// // A connection pool is a cache of database connections
// // Instead of creating a new connection for every query:
// // 1. Pool creates several connections when app starts
// // 2. Queries reuse these existing connections
// // 3. Much faster than creating new connections each time
// // 4. Automatically handles connection lifecycle

// // Create a new connection pool with configuration from environment variables
// const pool = new Pool({
//   host: process.env.DB_HOST,           // Database server address (usually 'localhost' in development)
//   port: process.env.DB_PORT,           // PostgreSQL default port is 5432
//   database: process.env.DB_NAME,       // Name of the database we created
//   user: process.env.DB_USER,           // PostgreSQL username
//   password: process.env.DB_PASSWORD,   // PostgreSQL password
  
//   // Optional pool configuration for better performance:
//   max: 20,                             // Maximum number of connections in the pool
//   idleTimeoutMillis: 30000,           // How long a connection can be idle before being closed (30 seconds)
//   connectionTimeoutMillis: 2000,      // How long to wait when connecting to database (2 seconds)
// });

// // =====================================================
// // CONNECTION EVENT HANDLERS
// // =====================================================
// // These help us monitor the database connection status

// // Event: When a new client connects to the database
// pool.on('connect', () => {
//   console.log('✅ Connected to PostgreSQL database');
// });

// // Event: When there's an error with a connection
// pool.on('error', (err) => {
//   console.error('❌ Unexpected error on idle client', err);
//   process.exit(-1); // Exit the application if database connection fails
// });

// // =====================================================
// // TEST CONNECTION FUNCTION
// // =====================================================
// // This function verifies that we can connect to the database
// // It's good practice to test the connection when the app starts

// const testConnection = async () => {
//   try {
//     // Try to connect to database
//     const client = await pool.connect();
//     console.log('🔗 Database connection test successful');
    
//     // Release the client back to the pool
//     // Always release clients after using them!
//     client.release();
    
//     return true;
//   } catch (error) {
//     console.error('❌ Database connection test failed:', error.message);
//     return false;
//   }
// };

// // =====================================================
// // EXPORT
// // =====================================================
// // Export the pool so other files can use it to query the database
// // Export testConnection so we can verify connection at startup

// module.exports = {
//   pool,
//   testConnection
// };

// // =====================================================
// // USAGE EXAMPLE (in other files):
// // =====================================================
// // const { pool } = require('./config/database');
// // const result = await pool.query('SELECT * FROM users');
