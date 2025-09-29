const cartRouter = require('express').Router();
const {getCart, upsertCart, clearCart} = require('../db/index.js');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get current cart contents
cartRouter.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const cart = await getCart(req.user.email);
    res.status(200).json(cart || { items: [] });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Create cart for the first time (or no-op if exists)
cartRouter.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const cart = await upsertCart(req.user.email, payload);
    res.status(201).json(cart);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Replace entire cart
cartRouter.put('/', isAuthenticated, async (req, res, next) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const cart = await upsertCart(req.user.email, payload);
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Clear cart (delete row)
cartRouter.delete('/clear', isAuthenticated, async (req, res, next) => {
  try {
    await clearCart(req.user.email);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = cartRouter;