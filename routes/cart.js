const cartRouter = require('express').Router();
const {getCart, addItemToCart, removeItemFromCart} = require('../db/index');

// Get current cart contents
cartRouter.get('/:userId', (req, res, next) => {
  const cart = getCart()
});

// Remove item from cart
cartRouter.delete('/:itemId', (req, res, next) => {

});

module.exports = cartRouter;