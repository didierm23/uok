// src/models/userModel.js
// =====================================================
// USER MODEL (Sequelize Version)
// =====================================================
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// =====================================================
// DATABASE CONNECTION
// =====================================================
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

// =====================================================
// DEFINE USER MODEL
// =====================================================
const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 100],
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Explicit timestamps for safer sync with existing tables
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true, // allow null for older rows
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

// =====================================================
// DATABASE SYNC FUNCTION
// =====================================================
const syncDatabase = async () => {
  try {
    console.log('🔄 Synchronizing User model with database...');

    // ✅ For development: drop and recreate cleanly
    // await sequelize.sync({ force: true });

    // ✅ For production: safe alter without data loss
    await sequelize.sync({ alter: true });

    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Failed to sync database:', error.message);
  }
};

// =====================================================
// CUSTOM QUERY METHODS
// =====================================================
const UserModel = {
  createUser: async (username, email, hashedPassword) =>
    await User.create({ username, email, password: hashedPassword }),

  findUserByEmail: async (email) => await User.findOne({ where: { email } }),

  findUserByUsername: async (username) => await User.findOne({ where: { username } }),

  findUserById: async (id) =>
    await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'createdAt'],
    }),

  getAllUsers: async () =>
    await User.findAll({
      attributes: ['id', 'username', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
    }),
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = { sequelize, User, UserModel, syncDatabase };




// // src/models/userModel.js
// // =====================================================
// // USER MODEL - DATA LAYER
// // =====================================================
// // This file contains all database operations related to users
// // It's the ONLY place where we write SQL queries for users
// // This follows the Single Responsibility Principle

// // Import the database connection pool
// const { pool } = require('../config/database');

// // =====================================================
// // WHY CREATE A MODEL?
// // =====================================================
// // 1. SEPARATION OF CONCERNS: Database logic separated from business logic
// // 2. REUSABILITY: Use these functions in multiple controllers
// // 3. MAINTAINABILITY: Change SQL query in one place, affects everywhere
// // 4. TESTABILITY: Easy to test database operations independently

// // =====================================================
// // USER MODEL OBJECT
// // =====================================================
// // We create an object with methods for each database operation
// const User = {
  
//   // ===================================================
//   // CREATE USER
//   // ===================================================
//   // Purpose: Insert a new user into the database
//   // Parameters: 
//   //   - username: string
//   //   - email: string
//   //   - hashedPassword: string (already encrypted by bcrypt)
//   // Returns: The newly created user object (without password)
  
//   createUser: async (username, email, hashedPassword) => {
//     // SQL Query Explanation:
//     // INSERT INTO users - Insert data into 'users' table
//     // (username, email, password) - Columns we're inserting into
//     // VALUES ($1, $2, $3) - Placeholder values (prevents SQL injection)
//     // RETURNING * - Return the inserted row data
    
//     const query = `
//       INSERT INTO users (username, email, password)
//       VALUES ($1, $2, $3)
//       RETURNING id, username, email, created_at
//     `;
    
//     // What are $1, $2, $3?
//     // These are PARAMETERIZED QUERIES (very important for security!)
//     // Instead of inserting values directly into SQL string:
//     //   ❌ BAD: "INSERT INTO users VALUES ('" + username + "')"  // SQL Injection risk!
//     //   ✅ GOOD: Use $1, $2, $3 and pass values in array
    
//     // PostgreSQL automatically escapes these values, preventing SQL injection
//     const values = [username, email, hashedPassword];
    
//     try {
//       // Execute the query
//       // pool.query() sends the SQL to PostgreSQL and waits for result
//       const result = await pool.query(query, values);
      
//       // result.rows[0] contains the first (and only) row returned
//       // We use RETURNING in SQL to get the inserted data back
//       return result.rows[0];
      
//     } catch (error) {
//       // If something goes wrong, throw the error up to the controller
//       // Controller will decide how to handle it
//       throw error;
//     }
//   },

//   // ===================================================
//   // FIND USER BY EMAIL
//   // ===================================================
//   // Purpose: Search for a user using their email address
//   // Used during: Login, checking if email already exists
//   // Returns: User object if found, null if not found
  
//   findUserByEmail: async (email) => {
//     // SELECT * - Get all columns from the table
//     // FROM users - From the 'users' table
//     // WHERE email = $1 - Filter rows where email matches our parameter
    
//     const query = `
//       SELECT * FROM users 
//       WHERE email = $1
//     `;
    
//     const values = [email];
    
//     try {
//       const result = await pool.query(query, values);
      
//       // result.rows is an array of matching rows
//       // If email doesn't exist, array will be empty
//       // We return first row (rows[0]) or null if not found
//       return result.rows[0] || null;
      
//     } catch (error) {
//       throw error;
//     }
//   },

//   // ===================================================
//   // FIND USER BY USERNAME
//   // ===================================================
//   // Purpose: Search for a user using their username
//   // Used during: Registration (to check if username is taken)
//   // Returns: User object if found, null if not found
  
//   findUserByUsername: async (username) => {
//     const query = `
//       SELECT * FROM users 
//       WHERE username = $1
//     `;
    
//     const values = [username];
    
//     try {
//       const result = await pool.query(query, values);
//       return result.rows[0] || null;
      
//     } catch (error) {
//       throw error;
//     }
//   },

//   // ===================================================
//   // GET ALL USERS
//   // ===================================================
//   // Purpose: Retrieve all users from database
//   // Used for: Displaying user list
//   // Returns: Array of user objects
//   // Security: We DON'T return passwords!
  
//   getAllUsers: async () => {
//     // Notice we SELECT specific columns, NOT including 'password'
//     // This is a security best practice - never expose passwords
//     // Even though they're hashed, it's better to not send them at all
    
//     const query = `
//       SELECT id, username, email, created_at 
//       FROM users
//       ORDER BY created_at DESC
//     `;
    
//     // No parameters needed for this query, so we pass empty array
    
//     try {
//       const result = await pool.query(query);
      
//       // result.rows contains all matching rows
//       // Could be empty array if no users exist
//       return result.rows;
      
//     } catch (error) {
//       throw error;
//     }
//   },

//   // ===================================================
//   // FIND USER BY ID
//   // ===================================================
//   // Purpose: Get a specific user by their ID
//   // Used by: Authentication middleware (after decoding JWT)
//   // Returns: User object without password
  
//   findUserById: async (id) => {
//     const query = `
//       SELECT id, username, email, created_at 
//       FROM users 
//       WHERE id = $1
//     `;
    
//     const values = [id];
    
//     try {
//       const result = await pool.query(query, values);
//       return result.rows[0] || null;
      
//     } catch (error) {
//       throw error;
//     }
//   }

//   // ===================================================
//   // POTENTIAL ADDITIONS (for student assignments)
//   // ===================================================
//   // - updateUser(id, updates): Update user information
//   // - deleteUser(id): Remove a user
//   // - findUsersByRole(role): Find users with specific role
//   // - countUsers(): Get total number of users
// };

// // =====================================================
// // EXPORT THE MODEL
// // =====================================================
// // This makes the User object available to other files
// module.exports = User;

// // =====================================================
// // HOW TO USE THIS MODEL (in controllers):
// // =====================================================
// // const User = require('../models/userModel');
// // 
// // const user = await User.findUserByEmail('john@example.com');
// // const newUser = await User.createUser('john', 'john@example.com', 'hashedPass');
// // const allUsers = await User.getAllUsers();
