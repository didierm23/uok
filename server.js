// server.js
// =====================================================
// APPLICATION ENTRY POINT (with Sequelize ORM)
// =====================================================
// This version integrates Sequelize for automatic model synchronization.
// =====================================================

// STEP 1: IMPORT DEPENDENCIES
// =====================================================
const express = require('express');
require('dotenv').config(); // Must be called early

// Import Sequelize ORM connection + model sync
const { sequelize, syncDatabase } = require('./src/models/userModel');

// Import routes
const userRoutes = require('./src/routes/userRoutes');

// =====================================================
// STEP 2: EXPRESS APP INITIALIZATION
// =====================================================
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// STEP 3: CORS CONFIGURATION
// =====================================================
// In production, replace '*' with your frontend domain
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// =====================================================
// STEP 4: MIDDLEWARE SETUP
// =====================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// =====================================================
// STEP 5: ROUTES
// =====================================================

// Root route (API welcome)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to User Management API (Sequelize Edition)',
    version: '2.0.0',
    endpoints: {
      register: 'POST /api/users/register',
      login: 'POST /api/users/login',
      getUsers: 'GET /api/users (requires authentication)',
    },
  });
});

// User routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: sequelize.options.database,
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// STEP 6: 404 HANDLER
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// =====================================================
// STEP 7: GLOBAL ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// =====================================================
// STEP 8: START SERVER + DATABASE SYNC
// =====================================================
const startServer = async () => {
  try {
    console.log('🧩 Testing database connection...');
    await sequelize.authenticate(); // Sequelize connection test
    console.log('✅ Database connected successfully.');

    // Sync models (create/alter tables)
    await syncDatabase();

    // Start the HTTP server
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}`);
      console.log('═══════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// =====================================================
// STEP 9: GRACEFUL SHUTDOWN HANDLERS
// =====================================================
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing server...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Closing server...');
  await sequelize.close();
  process.exit(0);
});

// =====================================================
// STEP 10: EXECUTE STARTUP
// =====================================================
startServer();


// // server.js
// // =====================================================
// // APPLICATION ENTRY POINT
// // =====================================================
// // This is where our application starts
// // It sets up the Express server and brings everything together

// // =====================================================
// // STEP 1: IMPORT DEPENDENCIES
// // =====================================================

// // Express: Web framework for Node.js
// const express = require('express');

// // dotenv: Loads environment variables from .env file
// // Must be called early, before accessing process.env
// require('dotenv').config();

// // Import database connection
// const { testConnection } = require('./src/config/database');

// // Import routes
// const userRoutes = require('./src/routes/userRoutes');

// // =====================================================
// // CORS MIDDLEWARE
// // =====================================================
// // This allows frontend to communicate with backend
// // In production, restrict origins to your domain
// const cors = (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*'); // Allow all origins (for development)
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
  
//   next();
// };

// // =====================================================
// // STEP 2: INITIALIZE EXPRESS APPLICATION
// // =====================================================
// // Create an Express application instance
// const app = express();

// // Get port from environment variables, default to 3000
// const PORT = process.env.PORT || 3000;

// // =====================================================
// // WHAT IS EXPRESS?
// // =====================================================
// // Express is a minimal web framework for Node.js
// // It provides:
// // - Routing (mapping URLs to functions)
// // - Middleware support (functions that process requests)
// // - Request/Response helpers
// // - Template rendering (not used in REST APIs)

// // =====================================================
// // STEP 3: MIDDLEWARE CONFIGURATION
// // =====================================================
// // Middleware functions have access to request and response objects
// // They can modify these objects or end the request-response cycle

// // Parse JSON bodies
// // This middleware parses incoming JSON data and makes it available in req.body
// app.use(express.json());
// // Without this, req.body would be undefined
// // When client sends: { "email": "test@example.com" }
// // This makes it available as: req.body.email

// // Parse URL-encoded bodies (form data)
// // This handles data from HTML forms
// app.use(express.urlencoded({ extended: true }));
// // extended: true allows for rich objects and arrays to be encoded

// // =====================================================
// // ENABLE CORS (for frontend-backend communication)
// // =====================================================
// app.use(cors);

// // =====================================================
// // MIDDLEWARE EXECUTION ORDER
// // =====================================================
// // Middleware runs in the order it's defined
// // Think of it as a pipeline:
// //
// // Request → Middleware 1 → Middleware 2 → Route Handler → Response
// //
// // Example flow:
// // 1. Client sends POST request with JSON body
// // 2. express.json() parses JSON
// // 3. express.urlencoded() checks for form data
// // 4. Request reaches route handler
// // 5. Controller processes and sends response

// // =====================================================
// // STEP 4: BASIC LOGGING MIDDLEWARE (custom)
// // =====================================================
// // This logs every incoming request
// // Useful for debugging and monitoring

// app.use((req, res, next) => {
//   // Log the HTTP method and URL of each request
//   console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  
//   // Call next() to pass control to the next middleware
//   // If you don't call next(), the request will hang!
//   next();
// });

// // =====================================================
// // STEP 5: DEFINE ROUTES
// // =====================================================

// // Root endpoint - simple welcome message
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Welcome to User Management API',
//     version: '1.0.0',
//     endpoints: {
//       register: 'POST /api/users/register',
//       login: 'POST /api/users/login',
//       getUsers: 'GET /api/users (requires authentication)'
//     }
//   });
// });

// // Mount user routes
// // All routes in userRoutes.js will be prefixed with '/api/users'
// app.use('/api/users', userRoutes);

// // EXPLANATION:
// // app.use(prefix, router) mounts the router at the prefix
// // If userRoutes has: router.post('/register', ...)
// // Full path becomes: /api/users/register

// // =====================================================
// // STEP 6: HEALTH CHECK ENDPOINT
// // =====================================================
// // Useful for monitoring if server is running
// // Cloud platforms often ping this to check server health

// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'OK',
//     timestamp: new Date().toISOString()
//   });
// });

// // =====================================================
// // STEP 7: 404 ERROR HANDLER
// // =====================================================
// // This runs if no routes match the request
// // Must be defined AFTER all other routes

// app.use((req, res) => {
//   res.status(404).json({
//     error: 'Route not found',
//     message: `Cannot ${req.method} ${req.url}`
//   });
// });

// // Why after other routes?
// // Express checks routes in order
// // If no route matches, this middleware catches it

// // =====================================================
// // STEP 8: GLOBAL ERROR HANDLER
// // =====================================================
// // This catches any errors that occur in the application
// // Must have 4 parameters: (err, req, res, next)

// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
  
//   // Send error response
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal server error',
//     // Only send stack trace in development
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // =====================================================
// // STEP 9: START SERVER
// // =====================================================
// // This function starts the server and listens for requests

// const startServer = async () => {
//   try {
//     // Test database connection before starting server
//     console.log('Testing database connection...');
//     const dbConnected = await testConnection();
    
//     if (!dbConnected) {
//       console.error('Failed to connect to database. Exiting...');
//       process.exit(1); // Exit with error code
//     }

//     // Start listening for requests
//     app.listen(PORT, () => {
//       console.log('═══════════════════════════════════════════');
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`📡 API Base URL: http://localhost:${PORT}`);
//       console.log(`📚 Documentation: http://localhost:${PORT}/`);
//       console.log('═══════════════════════════════════════════');
//       console.log('Available endpoints:');
//       console.log(`   POST   http://localhost:${PORT}/api/users/register`);
//       console.log(`   POST   http://localhost:${PORT}/api/users/login`);
//       console.log(`   GET    http://localhost:${PORT}/api/users`);
//       console.log('═══════════════════════════════════════════');
//     });

//   } catch (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
// };

// // =====================================================
// // WHAT IS app.listen()?
// // =====================================================
// // app.listen(port, callback) does two things:
// // 1. Binds the server to the specified port
// // 2. Starts listening for incoming HTTP requests
// //
// // When a request comes in:
// // 1. Express matches the URL to a route
// // 2. Runs any middleware for that route
// // 3. Executes the controller function
// // 4. Sends response back to client

// // =====================================================
// // GRACEFUL SHUTDOWN
// // =====================================================
// // Handle shutdown signals to close connections properly

// process.on('SIGTERM', () => {
//   console.log('SIGTERM signal received: closing HTTP server');
//   server.close(() => {
//     console.log('HTTP server closed');
//     // Close database connections here if needed
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT signal received: closing HTTP server');
//   process.exit(0);
// });

// // =====================================================
// // START THE SERVER
// // =====================================================
// startServer();

// // =====================================================
// // HOW TO RUN THIS APPLICATION
// // =====================================================
// //
// // Development mode (auto-restart on file changes):
// // npm run dev
// //
// // Production mode:
// // npm start
// //
// // The server will:
// // 1. Load environment variables from .env
// // 2. Test database connection
// // 3. Start listening on specified port
// // 4. Log available endpoints
// // 5. Wait for incoming requests

// // =====================================================
// // REQUEST-RESPONSE CYCLE
// // =====================================================
// //
// // 1. Client sends HTTP request
// //    Example: POST http://localhost:3000/api/users/register
// //    Body: { "username": "john", "email": "john@example.com", "password": "pass123" }
// //
// // 2. Request hits server (server.js)
// //    - express.json() parses JSON body
// //    - Logging middleware logs the request
// //
// // 3. Express matches route
// //    - Finds: app.use('/api/users', userRoutes)
// //    - Looks in userRoutes for POST /register
// //
// // 4. Route handler executes
// //    - Calls userController.registerUser
// //
// // 5. Controller processes request
// //    - Validates input
// //    - Checks if user exists
// //    - Hashes password
// //    - Saves to database
// //    - Prepares response
// //
// // 6. Response sent back to client
// //    - Express serializes JSON
// //    - Sets appropriate headers
// //    - Sends over HTTP
// //
// // 7. Client receives response
// //    - Can now use the returned data
// //    - For login, stores the JWT token

// // =====================================================
// // ENVIRONMENT VARIABLES
// // =====================================================
// // We use process.env to access environment variables
// // These are set in .env file
// //
// // Why use environment variables?
// // 1. Security: Keep sensitive data out of code
// // 2. Flexibility: Different values for dev/prod
// // 3. Configuration: Easy to change without code changes
// //
// // Example:
// // Development .env:
// //   DB_HOST=localhost
// //   DB_NAME=user_management_db
// //
// // Production .env:
// //   DB_HOST=production-db.example.com
// //   DB_NAME=prod_users

// // =====================================================
// // PORT CONFIGURATION
// // =====================================================
// // const PORT = process.env.PORT || 3000;
// //
// // This means:
// // - Try to use PORT from .env file
// // - If not set, default to 3000
// //
// // Useful for:
// // - Cloud platforms that assign random ports
// // - Running multiple instances on different ports
// // - Avoiding port conflicts

// // =====================================================
// // DEBUGGING TIPS
// // =====================================================
// //
// // 1. Server won't start:
// //    - Check if port is already in use
// //    - Verify .env file exists and has correct values
// //    - Check database connection
// //
// // 2. Routes not working:
// //    - Check route path (case-sensitive)
// //    - Verify HTTP method (GET vs POST)
// //    - Look at console logs for errors
// //
// // 3. req.body is undefined:
// //    - Make sure express.json() middleware is set up
// //    - Check Content-Type header is 'application/json'
// //
// // 4. Database errors:
// //    - Verify PostgreSQL is running
// //    - Check credentials in .env
// //    - Ensure database and tables exist
