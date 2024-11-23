const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { product_id: parseInt(id) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product', details: error.message });
  }
});

// Purchase a product
router.post('/purchase', async (req, res) => {
  const { product_id, customer_id } = req.body;

  if (!product_id || !customer_id) {
    return res.status(400).json({ error: 'Product ID and Customer ID are required' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { product_id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const customer = await prisma.customer.findUnique({ where: { customer_id } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Simulate purchase (you can expand this logic to create a purchase record)
    res.status(200).json({ message: 'Purchase successful', product, customer });
  } catch (error) {
    res.status(500).json({ error: 'Error processing purchase', details: error.message });
  }
});

module.exports = router;
