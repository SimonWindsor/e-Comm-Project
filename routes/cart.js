const cartRouter = require('express').Router();
import * as db from '../db/index.js';

// Get current cart contents
cartRouter.get('/', (req, res, next) => {

});

// Remove item from cart
cartRouter.delete('/:itemId', (req, res, next) => {

});

module.exports = cartRouter;