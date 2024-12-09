const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Add Product
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, cost } = req.body;

  if (!name || !description || !cost || !req.file) {
    return res.status(400).json({ error: 'All fields are required, including an image.' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        cost: parseFloat(cost),
        image_filename: req.file.filename,
      },
    });
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Products
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Get Product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
