const itemsRouter = require('express').Router();
const {query, getClient} = require('../db/index');

// Get all items
itemsRouter.get('/', async (req, res, next) => {
  const result = await query('SELECT * FROM items');
  res.send(result.rows);
});

// Show item by id
itemsRouter.get('/:id', async (req, res, next) => {
  const result = await query('SELECT * FROM items WHERE id = $1', [req.params.id]);
  res.send(result.rows[0]);
});

// Show items from search
itemsRouter.get('/search', (req, res, next) => {
  res.send(req.params);
});

// Add item to cart
itemsRouter.post('/:id', (req, res, next) => {

});


module.exports = itemsRouter;