const itemsRouter = require('express').Router();
const {query, getItemById, getReview, getItemsFromSearch} = require('../db/index.js');

// Get all items
itemsRouter.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM items');
    if (result.rows.length > 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send('404 No items found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show item by id
itemsRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id);
    if (item) {
      res.status(200).send(item);
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
      res.status(200).send(results);
    } else {
      res.send(`Could not find any items based on your search: '${req.params.searchTerms}'`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = itemsRouter;