const cartRouter = require('express').Router();
const {getCart, addItemToCart, removeItemFromCart, updateCartItem} = require('../db/index');

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
    const cart = await getCart(req.user.id);
    if (cart) {
      res.send(cart);
    } else {
      res.status(404).send('404 Cart not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Add item to cart
cartRouter.post('/', isAuthenticated, async (req, res, next) => {
  try {
    await addItemToCart(req.user.id, req.body.itemString);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Modify item quanity in cart
cartRouter.put('/', isAuthenticated, async (req, res, next) => {
  try {
    await updateCartItem(req.user.id, req.body.oldVAlue, req.body.newValue);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Remove item from cart
cartRouter.delete('/:itemId', async (req, res, next) => {
  try {
    await removeItemFromCart(req.user.id, req.body.itemString);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = cartRouter;