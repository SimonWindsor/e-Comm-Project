const itemsRouter = require('express').Router();
import * as db from '../db/index.js';

// Show item by id
itemsRouter.get('/:id', (req, res, next) => {

});

// Show items from search
itemsRouter.get('/search', (req, res, next) => {
  res.send(req.params);
});

// Add item to cart
itemsRouter.post('/:id', (req, res, next) => {

});


module.exports = itemsRouter;