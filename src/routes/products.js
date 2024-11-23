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
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
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
router.get('/all', async (req, res) => {
    try {
      const products = await prisma.product.findMany();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products', details: error.message });
    }
  });
  
module.exports = router;
