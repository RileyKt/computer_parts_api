const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Path to save uploaded images
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    // Extract file extension
    const ext = file.originalname.split('.').pop(); 
    // Generates a unique name
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext;
    // Save file with this unique name
    cb(null, uniqueFilename); 
  }
});
const upload = multer({ storage });

// POST route to add a product
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, cost } = req.body;

  // Validate input
  if (!name || !description || !cost || !req.file) {
    return res.status(400).json({ error: 'All fields are required, including an image.' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        cost: parseFloat(cost),
        // Save uploaded image's filename
        image_filename: req.file.filename, 
      },
    });
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to fetch all products
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to fetch a product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate if the ID is an integer
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid product ID. ID must be an integer.' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
