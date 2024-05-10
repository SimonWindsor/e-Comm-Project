const itemsRouter = require('express').Router();
const {query, getItemById, addItemToCart, removeItemFromCart, getItemsFromSearch} = require('../db/index.js');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

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

// Add item to cart
itemsRouter.post('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const addedItem = await addItemToCart(req.user.id, req.body.itemString);
    res.status(201).send(addedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Remove item from cart
itemsRouter.delete('/:itemId', async (req, res, next) => {
  try {
    await removeItemFromCart(req.user.id, req.params.itemId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = itemsRouter;