const cartRouter = require('express').Router();
const {getCart, addItemToCart, removeItemFromCart, updateCartItem, clearCart} = require('../db/index.js');
const { validateCartItem, handleValidationErrors } = require('../middleware/validation');

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
    if (cart) {
      res.status(200).send(cart);
    } else {
      res.status(404).send('404 Cart not found');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Add item to cart
cartRouter.post('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const addedItem = await addItemToCart(req.user.email, req.body.itemString);
    res.status(201).send(addedItem);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Modify item quantity in cart
cartRouter.put('/', isAuthenticated, validateCartItem, handleValidationErrors, async (req, res, next) => {
  try {
    const updatedItem = await updateCartItem(req.user.email, req.body.oldValue, req.body.newValue);
    res.status(200).send(updatedItem);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Remove item from cart
cartRouter.delete('/', isAuthenticated, async (req, res, next) => {
  try {
    await removeItemFromCart(req.user.email, req.body.item);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Clear cart
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