// =====================================================
// USER CONTROLLER - BUSINESS LOGIC LAYER
// =====================================================
//
// Handles registration, login, and retrieval of user data.
// Works with UserModel (Sequelize abstraction).
// =====================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { UserModel } = require('../models/userModel');

// =====================================================
// REGISTER USER
// =====================================================
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required (username, email, password)' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check for duplicates
    const existingEmail = await UserModel.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const existingUsername = await UserModel.findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.createUser(username, email, hashedPassword);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
};

// =====================================================
// LOGIN USER
// =====================================================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
};

// =====================================================
// GET ALL USERS
// =====================================================
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();

    // ✅ Fix: Return in JSON structure expected by frontend
    res.status(200).json({
      users: users || [],
      count: users?.length || 0,
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('❌ Fetch users error:', error);
    res.status(500).json({
      error: 'Error retrieving users. Please try again later.',
      users: [],
      count: 0,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
};
