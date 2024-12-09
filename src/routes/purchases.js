const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Add a new purchase
router.post('/', async (req, res) => {
  const {
    customer_id,
    street,
    city,
    province,
    country,
    postal_code,
    credit_card,
    credit_expire,
    credit_cvv,
    invoice_amt,
    invoice_tax,
    invoice_total,
    products,
  } = req.body;

  // Validates input fields
  if (
    !customer_id ||
    !street ||
    !city ||
    !province ||
    !country ||
    !postal_code ||
    !credit_card ||
    !credit_expire ||
    !credit_cvv ||
    !invoice_amt ||
    !invoice_tax ||
    !invoice_total ||
    !products
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Create a new purchase
    const newPurchase = await prisma.purchase.create({
      data: {
        customer_id,
        street,
        city,
        province,
        country,
        postal_code,
        credit_card,
        credit_expire,
        credit_cvv,
        invoice_amt: parseFloat(invoice_amt),
        invoice_tax: parseFloat(invoice_tax),
        invoice_total: parseFloat(invoice_total),
        order_date: new Date(),
      },
    });

    // Add purchase items
    for (const item of products) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required for each product.' });
      }

      await prisma.purchaseItem.create({
        data: {
          purchase_id: newPurchase.purchase_id,
          product_id,
          quantity,
        },
      });
    }

    res.status(201).json({ message: 'Purchase created successfully', purchase: newPurchase });
  } catch (error) {
    console.error('Error creating purchase:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all purchases for a specific customer
router.get('/customer/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const purchases = await prisma.purchase.findMany({
      where: { customer_id: parseInt(id) },
      include: {
        // Include related purchase items
        PurchaseItem: true, 
      },
    });

    if (!purchases.length) {
      return res.status(404).json({ error: 'No purchases found for this customer.' });
    }

    res.status(200).json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
