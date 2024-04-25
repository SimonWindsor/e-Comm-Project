const itemsRouter = require('express').Router();
const {query, getItemById, getItemsFromSearch} = require('../db/index');

// Get all items
itemsRouter.get('/', async (req, res, next) => {
  const result = await query('SELECT * FROM items');
  res.send(result.rows);
});

// Show item by id
itemsRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id);
    if (item) {
      res.send(item);
    } else {
      res.status(404).send('404 Item not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show items from search
itemsRouter.get('/search/:searchTerms', async (req, res, next) => {
  try {
    const results = await getItemsFromSearch(req.params.searchTerms);
    if (results) {
      res.send(results);
    } else {
      res.send(`Could not find any items based on your search: '${req.params.searchTerms}'`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Add item to cart
itemsRouter.post('/:id', (req, res, next) => {

});

module.exports = itemsRouter;