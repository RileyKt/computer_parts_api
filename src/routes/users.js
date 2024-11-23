const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.customer.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.customer.create({
      data: { email, password: hashedPassword, first_name, last_name },
    });

    res.status(201).json({ message: 'Signup successful', user });
  } catch (error) {
    res.status(500).json({ error: 'Error during signup', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.customer.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.user = { id: user.customer_id, email: user.email }; // Store session
    res.status(200).json({ message: 'Login successful', user: { email: user.email, first_name: user.first_name, last_name: user.last_name } });
  } catch (error) {
    res.status(500).json({ error: 'Error during login', details: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error during logout' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Get session
router.get('/getSession', (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'No active session' });
  }
  res.status(200).json({ user: req.session.user });
});

module.exports = router;
