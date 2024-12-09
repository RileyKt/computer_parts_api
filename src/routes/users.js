const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.customer.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      },
    });

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: newUser.customer_id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.customer.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.user = {
      customer_id: user.customer_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    res.status(200).json({ message: 'Login successful', email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout Route
router.post('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log out' });
      }
      res.status(200).json({ message: 'Logout successful' });
    });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// Get Session Route
router.get('/getSession', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;
