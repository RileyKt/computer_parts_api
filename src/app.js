require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);


// Base endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
