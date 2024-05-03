const itemsRouter = require('express').Router();
const {query, getItemById, getReview, getItemsFromSearch} = require('../db/index.js');

// Get all items
itemsRouter.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM items');
    if (result.rows > 0) {
      res.send(result.rows);
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
      res.send(item);
    } else {
      res.status(404).send('404 Item not found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show all item's review by item id
itemsRouter.get(':id', async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM reviews WHERE item_id = ${req.params.id}`);
    if (result.rows > 0) {
      res.send(result.rows);
    } else {
      res.status(404).send('404 No reviews found!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Show item's review by item id and review id
itemsRouter.get(':id/:reviewId', async (req, res, next) => {
  try {
    const review = await getReview(req.params.reviewId);
    if (review) {
      res.send(review);
    } else {
      res.status(404).send('404 Review not found!')
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

module.exports = itemsRouter;